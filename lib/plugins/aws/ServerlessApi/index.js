'use strict';

const path = require('path');

class ServerlessApi {
    constructor() {
    }

    commands() {
        return [];
    }

    hooks() {
        return null;
    }

    template() {
        return {
            name: 'serverless-api',
            description: 'API Gateway proxying calls to a Lambda backend.  Optional custom domain.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = ServerlessApi;