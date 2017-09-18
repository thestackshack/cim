'use strict';

const _ = require('lodash');
const async = require('async');
const fs = require("fs-extra");
const path = require('path');

const TEMPLATES = [
    'stack',
    'lambda-nodejs'
];

var functions = {};

functions.validate = function(params, done) {
    if (!_.includes(TEMPLATES, params.template)) {
        done('Invalid \'template\', must be one of: '+JSON.stringify(TEMPLATES, null, 3));
    } else if (fs.existsSync(path.resolve(params.dir, '_cim.yml'))) {
        done('The following directory already contains a \'_cim.yml\' file:  '+params.dir);
    } else {
        done(null, params);
    }
};

functions.create = function(params, done) {
    fs.copy(path.resolve(path.resolve(__dirname, 'templates'), params.template), params.dir, done);
};

//
// Update the stacks.
//
module.exports = function(params) {
    console.log('/////////////////////////');
    console.log('// CREATE ');
    console.log('/////////////////////////');
    console.log('');

    async.waterfall([
        async.constant(params),
        functions.validate,
        functions.create
    ], function(err) {
        if (err) {
            console.log('');
            console.log('*************************');
            console.log('** ERROR');
            console.log('*************************');
            console.log(err);
        } else {
            console.log(params.template +' project created at '+params.dir);
            console.log('');
            console.log('/////////////////////////');
            console.log('// COMPLETE');
            console.log('/////////////////////////');
        }
    });
};