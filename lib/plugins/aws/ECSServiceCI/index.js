'use strict';

const path = require('path');

class ECSServiceCI {
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
            name: 'ecs-service-ci',
            description: 'Example ECS Service with continuous integration.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = ECSServiceCI;