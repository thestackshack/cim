'use strict';

const Plugin = require('../../Plugin');

// Functions
const deploy_fn = require('./lib/deploy');

class Lambda extends Plugin {
    constructor() {
        super();

        Object.assign(
            this,
            deploy_fn);
    }

    commands() {
        return [
            {
                command: 'deploy-lambda',
                description: 'Deploy the lambda functions',
                params: {
                    dir: {
                        describe: 'The directory this command will run in.  Must contain a _cim.yml file.',
                        required: false,
                        default: process.cwd()
                    },
                    recursive: {
                        describe: 'Recursively search for nested stacks to create or update.  Any nested directory with a valid _cim.yml file.  Default is \'false\'.',
                        required: false,
                        default: false
                    },
                    stage: {
                        describe: 'Create or update the stack(s) using the give stage.',
                        required: false
                    },
                    profile: {
                        describe: 'Your AWS credentials profile.',
                        required: false
                    }
                },
                run: this.deploy
            }
        ];
    }

    hooks() {
        return null;
    }

    template() {
        return null
    }

}
module.exports = Lambda;