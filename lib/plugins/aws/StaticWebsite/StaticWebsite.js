'use strict';

const path = require('path');

class StaticWebsite {
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
            name: 'static-website',
            description: 'Static S3 website with SSL & CDN.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = StaticWebsite;