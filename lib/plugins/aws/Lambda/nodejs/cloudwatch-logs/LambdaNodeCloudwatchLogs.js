'use strict';

const Lambda = require('../../Lambda');
const path = require('path');

class LambdaNodeCloudwatchLogs extends Lambda {
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
            name: 'lambda-node-cloudwatch-logs',
            description: 'Lambda with CloudWatch Logs event trigger.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = LambdaNodeCloudwatchLogs;