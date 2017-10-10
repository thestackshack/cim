'use strict';

const path = require('path');

class VPC {
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
            name: 'vpc',
            description: 'VPC - Modular and scalable virtual networking foundation on the AWS Cloud.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = VPC;