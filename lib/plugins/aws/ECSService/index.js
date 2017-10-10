'use strict';

const path = require('path');

class ECSService {
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
            name: 'ecs-service',
            description: 'Example ECS Service.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = ECSService;