'use strict';

const _ = require('lodash');
const async = require('async');

var functions = {};

functions.stackup = function(stacks, done) {
    done(null, stacks);
};

module.exports = functions;