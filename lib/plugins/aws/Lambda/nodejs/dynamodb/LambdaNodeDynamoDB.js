'use strict';

const Lambda = require('../../Lambda');
const path = require('path');

class LambdaNodeDynamoDB extends Lambda {
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
            name: 'lambda-node-dynamodb',
            description: 'Lambda with DynamoDB stream event trigger.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = LambdaNodeDynamoDB;