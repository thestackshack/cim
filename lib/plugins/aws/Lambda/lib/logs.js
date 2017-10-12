'use strict';

const _ = require('lodash');
const async = require('async');
const moment = require("moment");

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

functions.show_logs = function(input, done) {
    //console.log(JSON.stringify(input.params, null, 3));
    init(input);

    const params = {
        logGroupName: '/aws/lambda/' + input.params.function,
        interleaved: true,
        startTime: input.params.startTime,
    };

    if (input.params.filterPattern) params.filterPattern = input.params.filterPattern;
    if (input.params.nextToken) params.nextToken = input.params.nextToken;
    if (input.params.startTime) {
        const since = (['s', 'm', 'h', 'd']
            .indexOf(input.params.startTime[input.params.startTime.length - 1]) !== -1);
        if (since) {
            params.startTime = moment().subtract(input.params.startTime.replace(/\D/g, ''),
                input.params.startTime.replace(/\d/g, '')).unix();
        } else if (!_.isNumber(input.params.startTime)) {
            params.startTime = moment(input.params.startTime).unix();
        }
    }

    //console.log(JSON.stringify(params, null, 3));
    cloudwatchlogs.filterLogEvents(params, function(err, data) {
        if (err) return done(err);
        _.forEach(data.events, function(event) {
            //console.log(JSON.stringify(event, null, 3));
            var ts = new Date(event.timestamp);
            console.log(ts + ' : ' + _.trim(event.message));
        });

        if (data.nextToken) {
            input.params.nextToken = data.nextToken;
        } else {
            delete input.params.nextToken;
        }

        if (input.params.tail) {
            if (data.events && data.events.length) {
                input.params.startTime = _.last(data.events).timestamp + 1;
            }

            if (input.params.tail) {
                return setTimeout(function() {
                    functions.show_logs(input, done);
                }, input.params.interval);
            }
        } else {
            done();
        }
    });
};

module.exports = {
    logs(cim, done) {
        async.waterfall([
            async.constant({params: cim.args}),
            functions.show_logs
        ], done);
    }
};