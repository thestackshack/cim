'use strict';

const _ = require('lodash');
const async = require('async');

const configs = require('./configs');
const cloudformation = require('./cloudformation');

// const AWS = require('aws-sdk');

//
// Update the stacks.
//
module.exports = function(params) {
    console.log('/////////////////////////');
    console.log('// STACKUP');
    console.log('/////////////////////////');
    console.log('');

    // if (params.profile) {
    //     console.log('Setting AWS profile: '+params.profile);
    //     var credentials = new AWS.SharedIniFileCredentials({profile: params.profile});
    //     AWS.config.credentials = credentials;
    // }
    // const s3 = new AWS.S3();
    // const cloudformation = new AWS.CloudFormation();
    // const lambda = new AWS.Lambda();

    async.waterfall([
        async.constant(params),
        configs.find,
        configs.parse,
        configs.validate,
        configs.validate_circular_stacks,
        configs.load_missing_parents,
        configs.resolve_params,
        function(stacks, next) { next(null, { stacks: stacks, params: params}); },
        cloudformation.stackup,
        function(stacks, next) {
            // TODO Start updating stacks.
            // TODO use async.queue to process the stack update tasks.
            console.log(JSON.stringify(stacks, null, 3));
            next(null, null);
        }
    ], function(err) {
        if (err) {
            console.log('*************************');
            console.log('** ERROR');
            console.log('*************************');
            console.log(JSON.stringify(err, null, 3));
        } else {
            console.log('/////////////////////////');
            console.log('// COMPLETE');
            console.log('/////////////////////////');
        }
    });

    //
    // Asynchronously update the tree structure of stacks.  Each child stack will be queued until its parents are complete.
    //

};