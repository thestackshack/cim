'use strict';

const _ = require('lodash');
const async = require('async');
const traverse = require("traverse");
const fs = require('fs');

var AWS = require('aws-sdk');
var cloudformation;
var s3;

var functions = {};

var fetch_statuses = function(input, done) {
    async.each(input.stacks, function(stack, next) {
        var params = {
            StackName: stack.stack.name /* required */
        };
        cloudformation.describeStacks(params, function(err, results) {
            if (err && err.message && err.message.indexOf('does not exist') > 0) {
                next(null);
            } else if (err) {
                next(err);
            } else {
                stack._cim.describe = results.Stacks[0];
                next(null);
            }
        });
    }, function(err) {
        done(err, input);
    });
};

var is_ready = function(stack) {
    // Make sure all parents are complete
    if (!_.isNil(stack.stack.parents) && _.size(stack.stack.parents) > 0) {
        var is_ready = true;
        _.forEach(stack.stack.parents, function(parent) {
            if (_.isNil(parent._cim.status) && _.isNil(parent._cim.skip)) {
                is_ready = false;
                return;
            } else if (!_.isNil(parent._cim.status) && !_.isEqual(parent._cim.status, 'complete')) {
                is_ready = false;
                return;
            }
        });
        console.log(stack.stack.name+' is ready: '+is_ready);
        return is_ready;
    } else {
        console.log(stack.stack.name+' is ready: true');
        return true;
    }
};

var queue_tasks = function(q, stacks, done) {

    _.forEach(stacks, function(stack) {
        // add some items to the queue
        if (_.isNil(stack._cim.status) && is_ready(stack)) {
            console.log('queue: '+stack.stack.name);
            stack._cim.status = 'queued';
            q.push(stack, function (err) {
                console.log('finished processing stack: ' + stack.stack.name);
                stack._cim.err = err;
            });
        }
    });

    done(null);
};

var create_bucket = function(stack, next) {
    //
    // Create the S3 bucket to upload the lambda's to.
    //
    var params = {
        Bucket: stack.stack.template.s3
    };
    s3.createBucket(params, function(err, results) {
        next(err, stack);
    });
};

var upload_template = function(stack, next) {
    //
    // Upload the cloudformation template to S3.
    //
    fs.readFile(stack.stack.template.file, function (err, data) {
        if (err) {
            throw err;
        }
        var base64data = new Buffer(data, 'binary');
        var params = {
            Body: base64data,
            Bucket: stack.stack.template.s3,
            Key: stack.stack.name+'.yml'
        };
        s3.putObject(params, function(err, result) {
            stack._cim.template_url = 'https://s3.amazonaws.com/'+stack.stack.template.s3+'/'+stack.stack.name+'.yml';
            next(err, stack);
        });
    });
};

var update_stack = function(stack, done) {
    async.waterfall([
        function(next) {
            // Update the stack.
            var params = {
                StackName: stack.stack.name, /* required */
                TemplateURL: stack._cim.template_url
            };
            if (!_.isNil(stack.stack.capabilities) && !_.isEmpty(stack.stack.capabilities)) {
                params.Capabilities = stack.stack.capabilities;
            }
            if (!_.isNil(stack.stack.parameters) && !_.isEmpty(stack.stack.parameters)) {
                params.Parameters = _.map(_.keys(stack.stack.parameters), function(key) {
                    return {
                        ParameterKey: key,
                        ParameterValue: stack.stack.parameters[key]
                    }
                });
            }
            if (!_.isNil(stack.stack.tags) && !_.isEmpty(stack.stack.tags)) {
                params.Tags = _.map(_.keys(stack.stack.tags), function(key) {
                    return {
                        Key: key,
                        Value: stack.stack.tags[key]
                    }
                });
            }
            console.log(JSON.stringify(params, null, 3));
            if (_.isNil(stack._cim.describe)) {
                console.log('create');
                cloudformation.createStack(params, next);
            } else {
                console.log('update');
                cloudformation.updateStack(params, function(err, results) {
                    if (err && err.message && _.isEqual(err.message, 'No updates are to be performed.')) {
                        stack._cim.noop = true;
                        next(null, results);
                    } else {
                        next(err, results);
                    }
                });
            }
        },
        function (data, next) {
            if (!stack._cim.noop) {
                //
                // Wait fo the stack.
                //
                var params = {
                    StackName: stack.stack.name
                };
                console.log(JSON.stringify(params, null, 3));
                if (_.isNil(stack._cim.describe)) {
                    cloudformation.waitFor('stackCreateComplete', params, next);
                } else {
                    cloudformation.waitFor('stackUpdateComplete', params, next);
                }
            } else {
                next(null, null);
            }
        }
    ], function(err, results) {
        console.log(err);
        done(err, stack);
    });
};

var process_task = function(stack, done) {
    console.log('process: '+stack.stack.name);
    stack._cim.status = 'processing';
    // process
    async.waterfall([
        async.constant(stack),
        create_bucket,
        upload_template,
        update_stack
    ], function(err, results) {
        // complete
        if (err) {
            stack._cim.status = 'failed';
            stack._cim.err = err;
        } else {
            stack._cim.status = 'complete';
        }
        done(err);
    });
};

var queue_stackup_tasks = function(input, done) {
    // create a queue object with concurrency 2
    var q = async.queue(function(stack, callback) {
        async.waterfall([
            async.constant(stack),
            process_task,
            async.constant(q, input.stacks),
            queue_tasks
        ], callback);
    }, 2);

    // assign a callback
    q.drain = function() {
        console.log('all items have been processed');
        done(null, input);
    };

    queue_tasks(q, input.stacks, function() { });
};

functions.stackup = function(input, done) {
    if (input.params.profile) {
        console.log('setting AWS profile: '+input.params.profile);
        var credentials = new AWS.SharedIniFileCredentials({profile: input.params.profile});
        AWS.config.credentials = credentials;
    }
    cloudformation = new AWS.CloudFormation();
    s3 = new AWS.S3();

    async.waterfall([
        async.constant(input),
        fetch_statuses,
        queue_stackup_tasks
    ], done);
};

module.exports = functions;