'use strict';

const winston = require('winston');

//
// Update this function as needed to support your business logic.
//
exports.handler = function(event, context, callback) {
    winston.info(JSON.stringify(event));
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: `Hello CIM`,
            event: event
        })
    };

    callback(null, response);
};