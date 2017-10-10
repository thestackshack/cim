'use strict';

const path = require('path');

class ECS {
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
            name: 'ecs',
            description: 'ECS - AWS EC2 Docker Container Service.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = ECS;