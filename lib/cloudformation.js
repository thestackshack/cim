'use strict';

const _ = require('lodash');
const async = require('async');
const traverse = require("traverse");
const fs = require('fs');

const lambda = require('./lambda');

var AWS = require('aws-sdk');
var cloudformation;
var s3;

var functions = {};

var init = function(input) {
  if (!cloudformation) {
      if (input.params.profile) {
          console.log('Setting AWS profile: '+input.params.profile);
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
            if (err && err.message && err.message.indexOf('does not exist') > 0) {
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
        return is_ready;
    } else {
        return true;
    }
};

var queue_tasks = function(q, input, done) {

    _.forEach(input.stacks, function(stack) {
        // add some items to the queue
        if (_.isNil(stack._cim.status) && is_ready(stack)) {
            stack._cim.status = 'queued';
            q.push({stack: stack, params: input.params}, function (err) {
                stack._cim.err = err;
            });
        }
    });

    done(null);
};

var create_bucket = function(task_input, next) {
    //
    // Create the S3 bucket to upload the lambda's to.
    //
    var params = {
        Bucket: task_input.stack.stack.template.s3
    };
    s3.createBucket(params, function(err, results) {
        next(err, task_input);
    });
};

var upload_template = function(task_input, next) {
    //
    // Upload the cloudformation template to S3.
    //
    fs.readFile(task_input.stack.stack.template.file, function (err, data) {
        if (err) {
            throw err;
        }
        var base64data = new Buffer(data, 'binary');
        var params = {
            Body: base64data,
            Bucket: task_input.stack.stack.template.s3,
            Key: task_input.stack.stack.name+'.yml'
        };
        s3.putObject(params, function(err, result) {
            task_input.stack._cim.template_url = 'https://s3.amazonaws.com/'+task_input.stack.stack.template.s3+'/'+task_input.stack.stack.name+'.yml';
            next(err, task_input);
        });
    });
};

var wait_for = function(input, done) {
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
                next(err, results);
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

var update_stack = function(task_input, done) {
    console.log('');
    console.log('Updating stack: '+task_input.stack.stack.name);
    async.waterfall([
        function(next) {
            // Update the stack.
            var params = {
                StackName: task_input.stack.stack.name, /* required */
                TemplateURL: task_input.stack._cim.template_url
            };
            if (!_.isNil(task_input.stack.stack.capabilities) && !_.isEmpty(task_input.stack.stack.capabilities)) {
                params.Capabilities = task_input.stack.stack.capabilities;
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
            if (_.isNil(task_input.stack._cim.describe)) {
                cloudformation.createStack(params, next);
            } else {
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
                // Wait fo the stack.
                //
                if (_.isNil(task_input.stack._cim.describe)) {
                    wait_for({
                        stack_name: task_input.stack.stack.name,
                        wait_for: [
                            'CREATE_COMPLETE',
                            'CREATE_FAILED',
                            'ROLLBACK_COMPLETE'
                        ]
                    }, next);
                } else {
                    wait_for({
                        stack_name: task_input.stack.stack.name,
                        wait_for: [
                            'UPDATE_COMPLETE',
                            'UPDATE_FAILED',
                            'UPDATE_ROLLBACK_COMPLETE'
                        ]
                    }, next);
                }
            } else {
                next(null, null);
            }
        },
        function (results, next) {
            if (!task_input.stack._cim.noop) {
                task_input.stack._cim.describe = results.Stacks[0];
                task_input.stack.stack.outputs = {};
                _.forEach(task_input.stack._cim.describe.Outputs, function (Output) {
                    task_input.stack.stack.outputs[Output.OutputKey] = Output.OutputValue;
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
                        if (_.includes(event.ResourceStatus, 'FAILED')) {
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
            done(err, results);
        }
    });
};

var process_stackup_task = function(task_input, done) {
    task_input.stack._cim.status = 'processing';
    // process
    async.waterfall([
        async.constant(task_input),
        create_bucket,
        upload_template,
        update_stack,
        lambda.deploy
    ], function(err, results) {
        // complete
        if (err) {
            task_input.stack._cim.status = 'failed';
            task_input.stack._cim.err = err;
        } else {
            task_input.stack._cim.status = 'complete';
        }
        done(err);
    });
};

var queue_stackup_tasks = function(input, done) {
    // create a queue object with concurrency 2
    var q = async.queue(function(task_input, callback) {
        async.waterfall([
            async.constant(task_input),
            process_stackup_task,
            async.constant(q, input),
            queue_tasks
        ], callback);
    }, 1);

    // assign a callback
    q.drain = function() {
        done(null, input);
    };

    queue_tasks(q, input, function() { });
};

var queue_delete_tasks = function(input, done) {
    // create a queue object with concurrency 2
    var q = async.queue(function(task_input, callback) {
        async.waterfall([
            async.constant(task_input),
            process_delete_task,
            async.constant(q, input),
            queue_tasks
        ], callback);
    }, 1);

    // assign a callback
    q.drain = function() {
        done(null, input);
    };

    queue_tasks(q, input, function() { });
};

var delete_stack = function(stack, done) {
    async.waterfall([
        function(next) {
            // Update the stack.
            var params = {
                StackName: stack.stack.name /* required */
            };
            if (!_.isNil(stack._cim.describe)) {
                cloudformation.deleteStack(params, next);
            } else {
                stack._cim.noop = true;
                stack._cim.err = 'Stack does not exist.';
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
                cloudformation.waitFor('stackDeleteComplete', params, next);
            } else {
                next(null, null);
            }
        }
    ], done);
};

var process_delete_task = function(task_input, done) {
    task_input.stack._cim.status = 'processing';
    // process
    delete_stack(task_input.stack, function(err) {
        // complete
        if (err) {
            task_input.stack._cim.status = 'failed';
            task_input.stack._cim.err = err;
        } else {
            task_input.stack._cim.status = 'complete';
        }
        done(err);
    });
};

functions.stackup = function(input, done) {
    init(input);
    async.waterfall([
        async.constant(input),
        functions.fetch_statuses,
        queue_stackup_tasks
    ], done);
};

functions.delete = function(input, done) {
    init(input);
    async.waterfall([
        async.constant(input),
        functions.fetch_statuses,
        queue_delete_tasks
    ], done);
};

module.exports = functions;