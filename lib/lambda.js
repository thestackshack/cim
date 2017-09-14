'use strict';

const _ = require('lodash');
const async = require('async');
const traverse = require("traverse");
const path = require('path');

const exec = require('child_process').exec;

var functions = {};

var resolve_stack_params = function(input, done) {
    try {
        traverse(input.stack).forEach(function (obj) {
            if (!_.isNil(obj) && _.isString(obj) && _.includes(obj, '${')) {
                var compiled = _.template(obj);
                try {
                    this.update(compiled(input.stack));
                } catch (err) {
                    throw err;
                }
            }
        });
        done(null, input);
    } catch (err) {
        done(err, input);
    }
};

var process_commands = function(input, done) {
    var commands = [];
    if (input.stack.lambda.phases) {
        _.forEach(['pre_deploy', 'deploy', 'post_deploy'], function(phase) {
            if (input.stack.lambda.phases[phase] && input.stack.lambda.phases[phase].commands &&
                !_.isEmpty(input.stack.lambda.phases[phase].commands)) {
                input.stack.lambda.phases[phase].commands = _.map(input.stack.lambda.phases[phase].commands, function(str) {
                   if (_.startsWith(str, 'aws') && !_.includes(str, '--profile') && input.params.profile) {
                       return str + ' --profile '+input.params.profile;
                   } else {
                       return str;
                   }
                });
                commands = commands.concat(input.stack.lambda.phases[phase].commands);
            }
        });
    }
    async.eachSeries(commands, function(command, next) {
        exec(command, {cwd: path.dirname(input.stack._cim.file) }, function(err, stdout, stderr) {
            process.stdout.write('.');
            next(err);
        });
    }, function(err) {
        console.log('.');
        done(err, input);
    });
};

functions.deploy = function(input, done) {
    if (input.stack.lambda && _.isEqual(input.params.deploy, 'true')) {
        console.log('Deploying Lambda');
        async.waterfall([
            async.constant(input),
            resolve_stack_params,
            process_commands
        ], done);
    } else {
        done(null, input);
    }
};

functions.deploy_stacks = function(input, done) {
  async.eachSeries(input.stacks, function(stack, next) {
      functions.deploy({stack: stack, params: input.params}, next);
  }, function(err) {
      done(err, input);
  });
};

module.exports = functions;