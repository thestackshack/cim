'use strict';

const path = require('path');

class ServerlessWebApp {
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
            name: 'serverless-web-app',
            description: 'Static S3 website with SSL, CDN, and CI/CD.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = ServerlessWebApp;