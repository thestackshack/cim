'use strict';

var AWS = require('aws-sdk');
var lambda;

var functions = {};

functions.deploy = function(input, done) {
    if (input.params.profile) {
        console.log('setting AWS profile: '+input.params.profile);
        var credentials = new AWS.SharedIniFileCredentials({profile: input.params.profile});
        AWS.config.credentials = credentials;
    }
    lambda = new AWS.Lambda();

};

module.exports = functions;