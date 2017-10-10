'use strict';

const path = require('path');

class ECR {
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
            name: 'ecr',
            description: 'ECR - AWS Docker Container Registry.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = ECR;