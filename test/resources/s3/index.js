'use strict';

const winston = require('winston');

exports.handler = function(event, context) {
    winston.info(JSON.stringify(event));
    context.succeed('Complete 2');
};