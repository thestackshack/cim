'use strict';

const winston = require('winston');

//
// Update this function as needed to support your business logic.
//
exports.handler = function(event, context) {
    winston.info(JSON.stringify(event));
    context.succeed('Hello CIM');
};