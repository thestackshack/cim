'use strict';

const Lambda = require('../../Lambda');
const path = require('path');

class LambdaNodeS3 extends Lambda {
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
            name: 'lambda-node-s3',
            description: 'Lambda with S3 event trigger.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = LambdaNodeS3;