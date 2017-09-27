'use strict';
const async = require('async');
const _ = require('lodash');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const glob = require("glob");
const traverse = require("traverse");

var functions = {};

functions.find = function(cim, done) {
    //
    // Recursively find all the stacks to update.
    //
    glob(cim.args.recursive ? '**/_cim.yml' : '_cim.yml', {
        cwd: cim.args.dir,
        absolute: true
    }, done);
};

functions.parse = function(files, done) {
    //
    // Parse all config files found.
    //
    async.map(files, function(file, mapNext) {
        // Get document, or throw exception on error
        try {
            var data = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
            data._cim = {
                file: file
            };
            mapNext(null, data);
        } catch (err) {
            mapNext(err, null);
        }
    }, done);
};

functions.load_missing_parents = function(stacks, done) {
    if (arguments.length == 3) {
        done = arguments[2];
        var seen = arguments[1];
    } else {
        var seen = [];
    }
    async.each(stacks, function (stack, eachNext) {
        if (stack.stack.parents) {
            var parents = {};
            async.each(_.keys(stack.stack.parents), function (key, eachParentNext) {

                var parent = stack.stack.parents[key];

                if (!_.isObject(parent)) {
                    if (_.includes(seen, parent)) {
                        return eachParentNext('Circular reference');
                    }
                    seen.push(parent);
                    // Load the parent that isn't included in this update.  We still need the name.
                    try {
                        var parent_data = yaml.safeLoad(fs.readFileSync(parent, 'utf8'));

                        // Resolve the full path of any inner parents.  We need to recursively load them as well.
                        var inner_parents = {};
                        _.forEach(_.keys(parent_data.stack.parents), function(inner_parent_key) {
                            var inner_parent_path = parent_data.stack.parents[inner_parent_key];
                            var inner_parent_full_path = path.resolve(path.resolve(path.dirname(parent), inner_parent_path), '_cim.yml');
                            if (!fs.existsSync(inner_parent_full_path)) {
                                return eachParentNext('Unable to resolve parent: '+inner_parent_full_path);
                            }
                            inner_parents[inner_parent_key] = inner_parent_full_path;
                        });
                        parent_data.stack.parents = inner_parents;

                        // Add the parent.
                        parent_data._cim = {
                            file: parent,
                            skip: true
                        };
                        parents[key] = parent_data;
                        eachParentNext(null);
                    } catch (err) {
                        eachParentNext(err);
                    }
                } else {
                    if (_.includes(seen, parent)) {
                        return eachParentNext('Circular reference');
                    }
                    seen.push(parent._cim.file);
                    parents[key] = parent;
                    eachParentNext(null);
                }
            }, function (err) {
                if (err) return eachNext(err);
                else {
                    stack.stack.parents = parents;
                    functions.load_missing_parents(_.values(stack.stack.parents), seen, eachNext);
                }
            });
        } else {
            eachNext(null);
        }
    }, function (err) {
        done(err, stacks);
    });
};

functions.validate = function(stacks, done) {
    async.each(stacks, function(stack, eachNext) {
        async.waterfall([
            function(next) {
                //
                // Validate the basic structure of the config.
                //
                if (_.isNil(stack.stack)) {
                    next('Invalid configuration.  Must have a \'stack\' defined.');
                } else if (_.isNil(stack.stack.name)) {
                    next('Invalid configuration.  Must have a \'stack.name\' defined.');
                } else if (_.isNil(stack.stack.template)) {
                    next('Invalid configuration.  Must have a \'stack.template\' defined.');
                } else if (_.isNil(stack.stack.template.file) || _.isNil(stack._cim) || _.isNil(stack._cim.file)) {
                    next('Invalid configuration.  Must have a \'stack.template.file\' defined.');
                } else if (_.isNil(stack.stack.template.bucket)) {
                    next('Invalid configuration.  Must have a \'stack.template.bucket\' defined.');
                } else {
                    next(null);
                }
            },
            function(next) {
                //
                // Validate that the template is available.
                //
                var template = 'cloudformation.yml';
                if (!_.isNil(stack.stack) && !_.isNil(stack.stack.template) && !_.isNil(stack.stack.template.file)) {
                    template = stack.stack.template.file;
                }
                const template_path = path.resolve(path.dirname(stack._cim.file), template);
                if (!fs.existsSync(template_path)) {
                    next('Invalid configuration.  Missing CloudFormation template: '+template_path);
                } else {
                    stack.stack.template.file = template_path;
                    next(null)
                }
            },
            function(next) {
                //
                // Validate that parent references exists.
                //
                if (stack.stack.parents) {
                    var parents = {};
                    _.forEach(_.keys(stack.stack.parents), function(key) {
                        var parent_path = stack.stack.parents[key];
                        var parent_full_path = path.resolve(path.resolve(path.dirname(stack._cim.file), parent_path), '_cim.yml');
                        if (!fs.existsSync(parent_full_path)) {
                            return next('Invalid configuration.  Missing parent configuration: '+parent_full_path);
                        } else {
                            var parent = _.find(stacks, { _cim: { file: parent_full_path } });
                            if (parent) parents[key] = parent;
                            else parents[key] = parent_full_path;
                        }
                    });
                    stack.stack.parents = parents;
                }
                next(null);
            }
        ], eachNext);
    }, function(err) {
        done(err, stacks);
    });
};

functions.do_resolve_stack_params = function(traverse_this, obj, stack, params) {
    var compiled = _.template(obj);
    try {
        stack.env = process.env;
        stack.opt = params;
        traverse_this.update(compiled(stack));
        delete stack.env;
        delete stack.opt;
    } catch (err) {
        delete stack.env;
        delete stack.opt;
        throw err;
    }
};

functions.resolve_stack_params = function(input) {
    traverse(input.stack).forEach(function(obj) {
       if (!_.isNil(obj) && _.isString(obj) && _.includes(obj, '${') && !_.includes(obj, '${stack.outputs')) {
           functions.do_resolve_stack_params(this, obj, input.stack, input.params);
       }
    });
};

functions.resolve_params = function(input, done) {
    try {
        traverse(input.stacks).forEach(function (obj) {
            if (!_.isNil(obj.stack)) {
                this.after(function () {
                    functions.resolve_stack_params({stack: obj, params: input.params});
                });
            }
        });
        done(null, input.stacks);
    } catch (err) {
        return done(err, input.stacks);
    }
};

functions.merge_stage = function(input, done) {
    if (input.params.stage) {
        try {
            traverse(input.stacks).forEach(function (obj) {
                if (!_.isNil(obj.stack)) {
                    this.after(function () {
                        if (!_.isNil(obj.stage) && !_.isNil(obj.stage[input.params.stage]) && !_.isEmpty(obj.stage[input.params.stage])) {
                            _.merge(obj, obj.stage[input.params.stage]);
                            delete obj.stage;
                        }
                    });
                }
            });
            done(null, input);
        } catch (err) {
            return done(err, input);
        }
    } else {
        done(null, input);
    }
};

functions.validate_circular_stacks = function(stacks, done) {
    var err = null;
    traverse(stacks).forEach(function (obj) {
        if (this.circular) {
            err = 'Circular stacks';
            return;
        }
    });
    return done(err, stacks);
};

functions.load = function(cim, done) {
    async.waterfall([
        async.constant(cim),
        functions.find,
        functions.parse,
        functions.validate,
        functions.validate_circular_stacks,
        functions.load_missing_parents,
        function(stacks, next) {
            next(null, { stacks: stacks, params: cim.args});
        },
        functions.merge_stage,
        functions.resolve_params,
    ], function(err, stacks) {
        cim.stacks = stacks;
        done(err, stacks);
    });
};

module.exports = functions;