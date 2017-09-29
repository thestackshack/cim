'use strict';

const Lambda = require('../../Lambda');
const path = require('path');

class LambdaNodeCloudwatchCron extends Lambda {
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
            name: 'lambda-node-cloudwatch-cron',
            description: 'Lambda with scheduled CloudWatch cron event trigger.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = LambdaNodeCloudwatchCron;