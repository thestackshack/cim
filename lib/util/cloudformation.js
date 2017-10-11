'use strict';

const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const moment = require('moment');

var AWS = require('aws-sdk');
var cloudformation;
var s3;

var functions = {};

var init = function(input) {
  if (!cloudformation) {
      if (input.params.profile) {
          var credentials = new AWS.SharedIniFileCredentials({profile: input.params.profile});
          AWS.config.credentials = credentials;
      }
      cloudformation = new AWS.CloudFormation();
      s3 = new AWS.S3();
  }
};

functions.fetch_statuses = function(input, done) {
    init(input);
    async.each(input.stacks, function(stack, next) {
        var params = {
            StackName: stack.stack.name /* required */
        };
        cloudformation.describeStacks(params, function(err, results) {
            if (err && (_.includes(input.params._, 'stack-up') || _.includes(input.params._, 'stack-show') || _.includes(input.params._, 'stack-delete')) &&
                err.message && err.message.indexOf('does not exist') > 0) {
                next(null);
            } else if (err) {
                next(err);
            } else {
                stack._cim.describe = results.Stacks[0];
                stack.stack.outputs = {};
                _.forEach(stack._cim.describe.Outputs, function(Output) {
                    stack.stack.outputs[Output.OutputKey] = Output.OutputValue;
                });
                next(null);
            }
        });
    }, function(err) {
        done(err, input);
    });
};

functions.is_ready = function(stack) {
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
        return is_ready;
    } else {
        return true;
    }
};

functions.queue_tasks = function(q, input, done) {
    _.forEach(input.stacks, function(stack) {
        // add some items to the queue
        if (_.isNil(stack._cim.status) && functions.is_ready(stack)) {
            stack._cim.status = 'queued';
            q.push({stack: stack, params: input.params}, function (err) {
                stack._cim.err = err;
            });
        }
    });

    done(null);
};

functions.create_bucket = function(task_input, next) {
    //
    // Create the S3 bucket to upload the lambda's to.
    //
    const params = {
        Bucket: task_input.stack.stack.template.bucket
    };
    s3.createBucket(params, function(err, results) {
        next(err, task_input);
    });
};

const upload_asset = function(key, task_input, next) {
    //
    // Upload the cloudformation template to S3.
    //
    if (!_.isNil(task_input.stack.stack[key]) && !_.isNil(task_input.stack.stack[key].file) && !_.isNil(task_input.stack.stack[key].bucket)) {
        fs.readFile(task_input.stack.stack[key].file, function (err, data) {
            if (err) {
                throw err;
            }
            const base64data = new Buffer(data, 'binary');
            const params = {
                Body: base64data,
                Bucket: task_input.stack.stack[key].bucket,
                Key: task_input.stack.stack.name + '-' + task_input.stack.stack[key].file
            };
            s3.putObject(params, function (err, result) {
                task_input.stack._cim[key + '_url'] = 'https://s3.amazonaws.com/' + task_input.stack.stack[key].bucket + '/' + task_input.stack.stack.name + '-' + task_input.stack.stack[key].file;
                next(err, task_input);
            });
        });
    } else {
        next(null, task_input);
    }
};

functions.upload_template = function(task_input, next) {
    upload_asset('template', task_input, next);
};

functions.upload_policy = function(task_input, next) {
    upload_asset('policy', task_input, next);
};

functions.upload_policy_during_update = function(task_input, next) {
    upload_asset('policyDuringUpdate', task_input, next);
};

functions.wait_for = function(input, done) {
    var params = {
        StackName: input.stack_name
    };
    var until_done = false;
    var WAIT = 5 * 1000;
    const MAX_TIMES = 720;
    var times = 0;
    async.until(function(){return until_done;}, function(next) {
        process.stdout.write('.');
        cloudformation.describeStacks(params, function(err, results) {
            if (err || _.includes(input.wait_for, results.Stacks[0].StackStatus)) {
                until_done = true;
                if (err && _.includes(input.success, 'DELETE_COMPLETE') && _.includes(err.message, 'does not exist')) {
                    next(null, results);
                } else if (!err && !_.includes(input.success, results.Stacks[0].StackStatus)) {
                    err = 'Stack update failed. '+results.Stacks[0].StackStatus;
                    console.log('');
                    console.log(err);
                    next(err, results);
                } else {
                    next(err, results);
                }
            } else {
                times++;
                if (times >= MAX_TIMES) {
                    until_done = true;
                    next('Timed out waiting for stack to complete.  It is still processing though.', results);
                } else {
                    setTimeout(function () {
                        next(err, results);
                    }, WAIT);
                }
            }
        });
    }, function(err, results) {
        console.log('');
        done(err, results);
    });
};

const UPDATE_PARAMS = [
    'capabilities',
    'notificationARNs',
    'resourceTypes',
    'rollbackConfiguration',
    'roleARN'
];

const CREATE_PARAMS = [
    'capabilities',
    'rollbackConfiguration',
    'disableRollback',
    'timeoutInMinutes',
    'notificationARNs',
    'resourceTypes',
    'roleARN',
    'onFailure',
    'enableTerminationProtection'
];

const add_params = function(keys, stack, params) {
    _.forEach(keys, function(key) {
        const upper = _.upperFirst(key);
        if (!_.isNil(stack[key]) && !_.isEmpty(stack[key])) {
            params[upper] = stack[key];
        } else if (!_.isNil(stack[upper]) && !_.isEmpty(stack[upper])) {
            params[upper] = stack[upper];
        }
    });
};

functions.update_stack = function(task_input, done) {
    console.log('Updating stack: '+task_input.stack.stack.name);
    async.waterfall([
        function(next) {
            // Update the stack.
            const params = {
                StackName: task_input.stack.stack.name, /* required */
                TemplateURL: task_input.stack._cim.template_url
            };
            if (!_.isNil(task_input.stack._cim.policy_url)) {
                params.StackPolicyURL = task_input.stack._cim.policy_url;
            }
            if (!_.isNil(task_input.stack.stack.parameters) && !_.isEmpty(task_input.stack.stack.parameters)) {
                params.Parameters = _.map(_.keys(task_input.stack.stack.parameters), function(key) {
                    return {
                        ParameterKey: key,
                        ParameterValue: task_input.stack.stack.parameters[key]
                    }
                });
            }
            if (!_.isNil(task_input.stack.stack.tags) && !_.isEmpty(task_input.stack.stack.tags)) {
                params.Tags = _.map(_.keys(task_input.stack.stack.tags), function(key) {
                    return {
                        Key: key,
                        Value: task_input.stack.stack.tags[key]
                    }
                });
            }
            task_input.stack._cim.start_update = new Date();
            if (_.isNil(task_input.stack._cim.describe)) {
                add_params(CREATE_PARAMS, task_input.stack.stack, params);
                cloudformation.createStack(params, next);
            } else {
                add_params(UPDATE_PARAMS, task_input.stack.stack, params);
                if (!_.isNil(task_input.stack._cim.policyDuringUpdate_url)) {
                    params.StackPolicyDuringUpdateURL = task_input.stack._cim.policyDuringUpdate_url;
                }
                cloudformation.updateStack(params, function(err, results) {
                    if (err && err.message && _.isEqual(err.message, 'No updates are to be performed.')) {
                        console.log(err.message);
                        task_input.stack._cim.noop = true;
                        next(null, results);
                    } else {
                        next(err, results);
                    }
                });
            }
        },
        function (data, next) {
            if (!task_input.stack._cim.noop) {
                //
                // Wait for the stack.
                //
                if (_.isNil(task_input.stack._cim.describe)) {
                    functions.wait_for({
                        stack_name: task_input.stack.stack.name,
                        wait_for: [
                            'CREATE_COMPLETE',
                            'CREATE_FAILED',
                            'ROLLBACK_COMPLETE',
                            'ROLLBACK_FAILED'
                        ],
                        success: [
                            'CREATE_COMPLETE'
                        ]
                    }, next);
                } else {
                    functions.wait_for({
                        stack_name: task_input.stack.stack.name,
                        wait_for: [
                            'UPDATE_COMPLETE',
                            'UPDATE_FAILED',
                            'UPDATE_ROLLBACK_COMPLETE',
                            'UPDATE_ROLLBACK_FAILED'
                        ],
                        success: [
                            'UPDATE_COMPLETE'
                        ]
                    }, next);
                }
            } else {
                next(null, null);
            }
        },
        function (results, next) {
            if (!task_input.stack._cim.noop) {
                if (task_input.stack._cim.describe) {
                    console.log('Stack has been updated!');
                } else {
                    console.log('Stack has been created!');
                }
                task_input.stack._cim.describe = results.Stacks[0];
                task_input.stack.stack.outputs = {};
                _.forEach(task_input.stack._cim.describe.Outputs, function (Output) {
                    task_input.stack.stack.outputs[Output.OutputKey] = Output.OutputValue;
                    console.log(Output.OutputKey+' = '+Output.OutputValue);
                });
            }
            next(null, task_input);
        }
    ], function(err, results) {
        if (err) {
            // Fetch the events so we can show the user what is wrong.
            cloudformation.describeStackEvents({StackName: task_input.stack.stack.name}, function(dErr, data) {
                if (!dErr) {
                    task_input.stack._cim.events = data.StackEvents;

                    _.forEach(task_input.stack._cim.events, function(event) {
                        if (moment(event.Timestamp).isAfter(moment(task_input.stack._cim.start_update)) &&
                            _.includes(event.ResourceStatus, 'FAILED')) {
                            console.log(event.ResourceType);
                            console.log(event.PhysicalResourceId);
                            console.log(event.ResourceStatusReason);
                            console.log('');
                        }
                    });
                }
                done(err, results);
            });
        } else {
            console.log('');
            done(err, results);
        }
    });
};

functions.process_stackup_task = function(task_input, done) {
    task_input.stack._cim.status = 'processing';
    // process
    async.waterfall([
        async.constant(task_input),
        functions.create_bucket,
        functions.upload_template,
        functions.upload_policy,
        functions.upload_policy_during_update,
        functions.update_stack
    ], function(err, results) {
        // complete
        if (err) {
            console.log(JSON.stringify(err, null, 3));
            task_input.stack._cim.status = 'failed';
            task_input.stack._cim.err = err;
        } else {
            task_input.stack._cim.status = 'complete';
        }
        done(err);
    });
};

functions.queue_stackup_tasks = function(input, done) {
    // create a queue object with concurrency 2
    var q = async.queue(function(task_input, callback) {
        async.waterfall([
            async.constant(task_input),
            functions.process_stackup_task,
            async.constant(q, input),
            functions.queue_tasks
        ], callback);
    }, 1);

    // assign a callback
    q.drain = function() {
        done(null, input);
    };

    functions.queue_tasks(q, input, function() { });
};

functions.show_statuses = function(input, done) {

    _.forEach(input.stacks, function(stack) {
        console.log('Show stack: '+stack.stack.name);
        // add some items to the queue
        if (_.isNil(stack._cim.describe)) {
            console.log('not found')
        } else {
            console.log(JSON.stringify(stack._cim.describe, null, 3));
        }
        console.log('')
    });
    done();
};

functions.queue_delete_tasks = function(input, done) {
    // create a queue object with concurrency 2
    var q = async.queue(function(task_input, callback) {
        async.waterfall([
            async.constant(task_input),
            functions.process_delete_task,
            async.constant(q, input),
            functions.queue_tasks
        ], callback);
    }, 1);

    // assign a callback
    q.drain = function() {
        done(null, input);
    };

    functions.queue_tasks(q, input, function() { });
};

functions.delete_stack = function(stack, done) {
    console.log('Delete stack: '+stack.stack.name);
    async.waterfall([
        function(next) {
            // Update the stack.
            var params = {
                StackName: stack.stack.name /* required */
            };
            if (!_.isNil(stack._cim.describe)) {
                stack._cim.start_update = new Date();
                cloudformation.deleteStack(params, next);
            } else {
                stack._cim.noop = true;
                stack._cim.err = 'Stack does not exist.';
                console.log(stack._cim.err);
                next(null, null);
            }
        },
        function (data, next) {
            if (!stack._cim.noop) {
                //
                // Wait fo the stack.
                //
                functions.wait_for({
                    stack_name: stack.stack.name,
                    wait_for: [
                        'DELETE_COMPLETE',
                        'DELETE_FAILED'
                    ],
                    success: [
                        'DELETE_COMPLETE'
                    ]
                }, next);
            } else {
                next(null, null);
            }
        }
    ], function(err, results) {
        if (err) {
            // Fetch the events so we can show the user what is wrong.
            cloudformation.describeStackEvents({StackName: stack.stack.name}, function(dErr, data) {
                if (!dErr) {
                    stack._cim.events = data.StackEvents;

                    _.forEach(stack._cim.events, function(event) {
                        if (moment(event.Timestamp).isAfter(moment(stack._cim.start_update)) &&
                            _.includes(event.ResourceStatus, 'FAILED')) {
                            console.log(event.ResourceType);
                            console.log(event.PhysicalResourceId);
                            console.log(event.ResourceStatusReason);
                            console.log('');
                        }
                    });
                }
                done(err, results);
            });
        } else {
            console.log('');
            done(err, results);
        }
    });
};

functions.process_delete_task = function(task_input, done) {
    // process
    if (task_input.stack._cim.describe) {
        task_input.stack._cim.status = 'processing';
        functions.delete_stack(task_input.stack, function (err) {
            // complete
            if (err) {
                console.log(JSON.stringify(err, null, 3));
                task_input.stack._cim.status = 'failed';
                task_input.stack._cim.err = err;
            } else {
                task_input.stack._cim.status = 'complete';
            }
            done(err);
        });
    } else {
        console.log('Stack does not exist: '+task_input.stack.name);
        console.log('');
        done(null);
    }
};

functions.stackup = function(input, done) {
    init(input);
    async.waterfall([
        async.constant(input),
        functions.fetch_statuses,
        functions.queue_stackup_tasks
    ], function(err) { done(err); });
};

functions.delete = function(input, done) {
    init(input);
    async.waterfall([
        async.constant(input),
        functions.fetch_statuses,
        functions.queue_delete_tasks
    ], function(err) { done(err); });
};

functions.show = function(input, done) {
    init(input);
    async.waterfall([
        async.constant(input),
        functions.fetch_statuses,
        functions.show_statuses
    ], function(err) { done(err); });
};

module.exports = functions;