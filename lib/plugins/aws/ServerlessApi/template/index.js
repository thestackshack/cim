'use strict';

exports.handler = function(event, context, callback) {
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: `Hello CIM`,
            event: event
        })
    };

    callback(null, response);
};