'use strict';

const Lambda = require('../../Lambda');
const path = require('path');

class LambdaNodeSNS extends Lambda {
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
            name: 'lambda-node-sns',
            description: 'Lambda with SNS event trigger.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = LambdaNodeSNS;