'use strict';

const logger = {
  log: function() {
    console.log('DEBUG:', ...arguments)
  }
}

const _ = require('lodash');
const async = require('async');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

const configs = require('../../../../util/configs');
const cloudformation = require('../../../../util/cloudformation');

var AWS = require('aws-sdk');

var lambda;

var init = function(input) {
    if (!lambda) {
        if (input.params.debug == 'aws') AWS.config.logger = logger;
        if (input.params.profile) {
            var credentials = new AWS.SharedIniFileCredentials({profile: input.params.profile});
            AWS.config.credentials = credentials;
        }
        var aws_sdk_config = {};
        ['region'].forEach(function(key) { aws_sdk_config[key] = input.params[key] });
        lambda = new AWS.Lambda(aws_sdk_config);
    }
};

var functions = {};

functions.resolve_stack = function(obj, stack, input, done) {
    async.eachOf(obj, function(value, key, next) {
        if (!_.isNil(value) && _.isString(value) && _.includes(value, '${')) {
            try {
                obj[key] = configs.do_resolve_stack_params(value, stack, input.params);
                next();
            } catch (err) {
                next(err);
            }
        } else if (!_.isNil(value) && _.isObject(value)) {
            functions.resolve_stack(value, stack, input, next);
        } else {
            next();
        }
    }, done);
};

functions.resolve_stack_params = function(input, done) {
    functions.resolve_stack(input.stack, input.stack, input, done);
};

functions.parse_commands = function(input, phase) {
    var commands = [];
    if (input.stack.lambda.deploy.phases) {
        if (input.stack.lambda.deploy.phases[phase] && input.stack.lambda.deploy.phases[phase].commands &&
            !_.isEmpty(input.stack.lambda.deploy.phases[phase].commands)) {
            input.stack.lambda.deploy.phases[phase].commands = _.map(input.stack.lambda.deploy.phases[phase].commands, function(str) {
                if (_.startsWith(str, 'aws') && !_.includes(str, '--profile') && input.params.profile) {
                    return str + ' --profile '+input.params.profile;
                } else {
                    return str;
                }
            });
            commands = commands.concat(input.stack.lambda.deploy.phases[phase].commands);
        }
    }
    return commands;
};

functions.process_commands = function(input, phase, done) {
    if (_.includes(input.params._, 'lambda-prune') ||
        _.includes(input.params._, 'lambda-versions') ||
        (_.includes(input.params._, 'lambda-deploy') && !_.isNil(input.params['lambda-version']))) {
        return done(null, input);
    }
    var commands = functions.parse_commands(input, phase);
    console.log(phase+' phase');
    async.eachSeries(commands, function(command, next) {
        if (input.params.debug) logger.log('exec', command);
        exec(command, {maxBuffer: 1024 * 5000, cwd: path.dirname(input.stack._cim.file) }, function(err, stdout, stderr) {
            process.stdout.write('.');
            next(err);
        });
    }, function(err) {
        console.log('');
        done(err, input);
    });
};

functions.deploy_function = function(input, done) {
    fs.readFile(input.function_obj.zip_file, function (err, data) {
        if (err) {
            throw err;
        }
        var base64data = new Buffer(data, 'binary');
        var params = {
            FunctionName: input.function_obj.function, /* required */
            DryRun: false,
            Publish: true,
            ZipFile: base64data
        };
        lambda.updateFunctionCode(params, function(err, data) {
            if (err) {
                return done(err, null);
            } else {
                console.log('Function: ' + input.function_obj.function);
                console.log('Version ' + data.Version + ' has been deployed. alias=$LATEST');
                if (_.isEqual(input.params.prune, 'true')) {
                    async.waterfall([
                        async.constant(input, null),
                        functions.fetch_unused_versions,
                        functions.delete_function_versions
                    ], done);
                } else {
                    done(null, data);
                }
            }
        });
    });
};

functions.publish_function = function(input, done) {
    if (_.isNil(input.function_obj.aliases) || _.isEmpty(input.function_obj.aliases)) {
        return done('Missing \'function.aliases\'.', null);
    }
    fs.readFile(input.function_obj.zip_file, function (err, data) {
        if (err) {
            throw err;
        }
        var base64data = new Buffer(data, 'binary');
        var params = {
            FunctionName: input.function_obj.function, /* required */
            DryRun: false,
            Publish: false,
            ZipFile: base64data
        };
        lambda.updateFunctionCode(params, function(err, data) {
            if (err) {
                return done(err, null);
            } else {
                var params = {
                    CodeSha256: data.CodeSha256,
                    FunctionName: input.function_obj.function
                };
                lambda.publishVersion(params, function (err, data) {
                    if (err) {
                        return done(err, null);
                    } else {
                        console.log('Function: ' + input.function_obj.function);
                        console.log('Version ' + data.Version +' has been published.');
                        done(null, data);
                    }
                });
            }
        });
    });
};

functions.deploy_function_version = function(input, done) {
    if (_.isNil(input.function_obj.aliases) || _.isEmpty(input.function_obj.aliases)) {
        return done('Missing \'function.aliases\'.', null);
    }
    if (_.isNil(input.params.alias)) {
        return done('--alias option is required when deploying a version.', null);
    }
    if (_.isNil(input.function_obj.aliases[input.params.alias])) {
        return done('Missing \'function.aliases.'+input.params.alias+'\'.', null);
    }
    var alias = input.params.alias;
    var params = {
        FunctionName: input.function_obj.function,
        FunctionVersion: input.params['lambda-version']+'',
        Name: alias
    };
    lambda.updateAlias(params, function(err, data) {
        if (err) {
            return done(err, null);
        } else {
            console.log('Function: ' + input.function_obj.function);
            console.log('Version ' + input.params['lambda-version'] + ' has been deployed. alias='+alias);
            if (_.isEqual(input.params.prune, 'true')) {
                async.waterfall([
                    async.constant(input, null),
                    functions.fetch_unused_versions,
                    functions.delete_function_versions
                ], done);
            } else {
                done(null, data);
            }
        }
    });
};

functions.prune_function = function(input, done) {
    if (_.isEqual(input.params['lambda-version'], 'all'))  {
        async.waterfall([
            async.constant(input, null),
            functions.fetch_unused_versions,
            functions.delete_function_versions
        ], done);
    } else {
        console.log('Function: ' + input.function_obj.function);
        functions.delete_function_version({
            function: input.function_obj.function,
            version: input.params['lambda-version']
        }, done);
    }
};

functions.fetch_unused_versions = function(input, nextMarker, done) {
    var params = {
        FunctionName: input.function_obj.function,
        Marker: nextMarker,
        MaxItems: 100
    };
    lambda.listVersionsByFunction(params, function(err, data) {
        if (err) {
            return done(err, null);
        } else {
            async.mapSeries(data.Versions, function(version, next) {
                functions.has_alias(input, version.Version, function(err, has_alias) {
                    if (err) {
                        return next(err, null);
                    } else {
                        next(null, has_alias ? null : version.Version);
                    }
                });
            }, function(err, versions) {
                if (err) {
                    done(err, null);
                } else {
                    input.versions = versions;
                    done(null, input);
                }
            });
        }
    });
};

functions.has_alias = function(input, version, done) {
    var params = {
        FunctionName: input.function_obj.function,
        FunctionVersion: version,
        Marker: null,
        MaxItems: 1
    };
    lambda.listAliases(params, function(err, data) {
        if (err) {
            return done(err, null);
        } else {
            done(null, !_.isEmpty(data.Aliases))
        }
    });
};

functions.delete_function_versions = function(input, done) {
    const versions = _.remove(input.versions, function(version) { return !_.isNil(version) && !_.isEqual(version, '$LATEST'); });
    async.eachSeries(versions, function(version, next) {
        functions.delete_function_version({
            function: input.function_obj.function,
            version: version
        }, next);
    }, function(err) {
        done(err, null);
    });
};

functions.delete_function_version = function(input, done) {
    var params = {
        FunctionName: input.function,
        Qualifier: input.version+''
    };
    lambda.deleteFunction(params, function(err, data) {
        if (err) {
            return done(err, null);
        } else {
            console.log('Version ' + input.version + ' has been removed.');
            done(null, data);
        }
    });
};

functions.function_aliases = function(input, version, nextMarker, done) {
    var params = {
        FunctionName: input.function_obj.function,
        FunctionVersion: version,
        Marker: nextMarker,
        MaxItems: 100
    };
    lambda.listAliases(params, function(err, data) {
        if (err) {
            return done(err, null);
        } else {
            if (_.isNil(nextMarker)) {
                console.log('Version = '+version);
            }
            _.forEach(data.Aliases, function(alias) {
                console.log(' - Alias = '+alias.Name);
            });
            if (!_.isNil(data.NextMarker)) {
                functions.function_aliases(input, version, data.NextMarker, done);
            } else {
                done(null, data);
            }
        }
    });
};

functions.function_versions = function(input, nextMarker, done) {
    var params = {
        FunctionName: input.function_obj.function,
        Marker: nextMarker,
        MaxItems: 100
    };
    lambda.listVersionsByFunction(params, function(err, data) {
        if (err) {
            return done(err, null);
        } else {
            async.eachSeries(data.Versions, function(version, next) {
                functions.function_aliases(input, version.Version, null, next);
            }, function(err) {
                if (err) {
                    return done(err, null);
                } else {
                    if (!_.isNil(data.NextMarker)) {
                        functions.function_versions(input, data.NextMarker, done);
                    } else {
                        done(null, data);
                    }
                }
            });
        }
    });
};

functions.deploy_phase = function(input, done) {
    if (input.stack.lambda.functions && _.isArray(input.stack.lambda.functions) &&
        !_.isEmpty(input.stack.lambda.functions)) {
        async.eachSeries(input.stack.lambda.functions, function (function_obj, next) {
            if (!input.params.function || _.isEqual(input.params.function, function_obj.function)) {
                function_obj.zip_file = path.resolve(path.dirname(input.stack._cim.file), function_obj.zip_file);
                if (_.includes(input.params._, 'lambda-deploy')) {
                    console.log('deploy phase');
                    if (_.isNil(input.params['lambda-version'])) {
                        functions.deploy_function({function_obj: function_obj, params: input.params}, next);
                    } else {
                        functions.deploy_function_version({function_obj: function_obj, params: input.params}, next);
                    }
                } else if (_.includes(input.params._, 'lambda-publish')) {
                    console.log('publish phase');
                    functions.publish_function({function_obj: function_obj, params: input.params}, next);
                } else if (_.includes(input.params._, 'lambda-prune')) {
                    functions.prune_function({function_obj: function_obj, params: input.params}, next);
                } else if (_.includes(input.params._, 'lambda-versions')) {
                    console.log('function versions: ' + function_obj.function);
                    functions.function_versions({function_obj: function_obj, params: input.params}, null, next);
                }
            } else {
                next();
            }
        }, function (err) {
            done(err, input);
        });
    } else {
        done(null, input);
    }
};

functions.deploy = function(input, done) {
    init(input);
    if (input.stack.lambda.deploy) {
        if (_.includes(input.params._, 'lambda-deploy')) {
            console.log('Deploying: ' + input.stack.stack.name);
        } else if (_.includes(input.params._, 'lambda-publish')) {
            console.log('Publishing: ' + input.stack.stack.name);
        } else if (_.includes(input.params._, 'lambda-prune')) {
            console.log('Pruning: ' + input.stack.stack.name);
        }
        async.waterfall([
            async.constant(input),
            functions.resolve_stack_params,
            async.constant(input, 'pre_deploy'),
            functions.process_commands,
            functions.deploy_phase,
            async.constant(input, 'post_deploy'),
            functions.process_commands
        ], done);
    } else {
        done(null, input);
    }
};

functions.deploy_stacks = function(input, done) {
    async.eachSeries(input.stacks, function(stack, next) {
        functions.deploy({stack: stack, params: input.params}, next);
    }, function(err) {
        done(err);
    });
};

module.exports = {
    deploy(cim, done) {
        async.waterfall([
            async.constant(cim),
            configs.load,
            function(stacks, next) {
                next(null, { stacks: stacks, params: cim.args});
            },
            cloudformation.fetch_statuses,
            functions.deploy_stacks
        ], done);
    }
};
