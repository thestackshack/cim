'use strict';

const _ = require('lodash');
const async = require('async');
const traverse = require("traverse");

const configs = require('../../../../util/configs');
const cloudformation = require('../../../../util/cloudformation');

var AWS = require('aws-sdk');
var cloudwatchlogs;

var init = function(input) {
    if (!cloudwatchlogs) {
        if (input.params.profile) {
            var credentials = new AWS.SharedIniFileCredentials({profile: input.params.profile});
            AWS.config.credentials = credentials;
        }
        cloudwatchlogs = new AWS.CloudWatchLogs();
    }
};

var functions = {};

functions.resolve_stack_params = function(input, done) {
    try {
        traverse(input.stacks[0]).forEach(function (obj) {
            if (!_.isNil(obj) && _.isString(obj) && _.includes(obj, '${')) {
                configs.do_resolve_stack_params(this, obj, input.stack[0], input.params);
            }
        });
        done(null, input);
    } catch (err) {
        done(err, input);
    }
};

functions.show_logs = function(input, done) {
    init(input);
    const lambda = _.find(input.stacks[0].lambda.functions, {alias: input.params.alias});
    var params = {
        logGroupName: '/aws/lambda/' + lambda.function_name,
        interleaved: true,
    };

    params.startTime = new Date().getTime() - input.params.startTime * 60 * 1000;
    params.endTime = new Date().getTime();
    cloudwatchlogs.filterLogEvents(params, function(err, data) {
        if (err) return done(err);
        _.forEach(data.events, function(event) {
            var ts = new Date(event.timestamp);
            console.log(ts + ' : ' + _.trim(event.message));
        });
        done();
    });
};

module.exports = {
    logs(cim, done) {
        async.waterfall([
            async.constant(cim),
            configs.load,
            function(stacks, next) {
                next(null, { stacks: stacks, params: cim.args});
            },
            cloudformation.fetch_statuses,
            functions.resolve_stack_params,
            functions.show_logs
        ], done);
    }
};