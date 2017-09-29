'use strict';

const Lambda = require('../../Lambda');
const path = require('path');

class LambdaNodeAPIGateway extends Lambda {
    constructor() {
        super();
    }

    commands() {
        return [];
    }

    hooks() {
        return null;
    }

    template() {
        return {
            name: 'lambda-node-api-gateway',
            description: 'Serverless backend API.  Lambda with API Gateway event trigger.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = LambdaNodeAPIGateway;