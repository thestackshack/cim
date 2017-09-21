'use strict';

const Lambda = require('../Lambda');
const path = require('path');

class LambdaNode extends Lambda {
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
            name: 'lambda-node',
            description: 'Single Lambda.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = LambdaNode;