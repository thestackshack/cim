'use strict';

const Lambda = require('../../Lambda');
const path = require('path');

class LambdaNodeKinesis extends Lambda {
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
            name: 'lambda-node-kinesis',
            description: 'Lambda with Kinesis stream event trigger.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = LambdaNodeKinesis;