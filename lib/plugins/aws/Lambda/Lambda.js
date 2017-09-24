'use strict';

const Plugin = require('../../Plugin');

// Functions
const deploy_fn = require('./lib/deploy');
const logs_fn = require('./lib/logs');

class Lambda extends Plugin {
    constructor() {
        super();

        Object.assign(
            this,
            deploy_fn,
            logs_fn);
    }

    commands() {
        return [
            {
                command: 'lambda-deploy',
                description: 'Deploy the lambda functions',
                params: {
                    dir: {
                        describe: 'The directory this command will run in.  Must contain a _cim.yml file.',
                        required: false,
                        default: process.cwd()
                    },
                    alias: {
                        describe: 'Lambda function alias.',
                        required: false
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
            },
            {
                command: 'lambda-logs',
                description: 'Show the lambda function logs',
                params: {
                    dir: {
                        describe: 'The directory this command will run in.  Must contain a _cim.yml file.',
                        required: false,
                        default: process.cwd()
                    },
                    alias: {
                        describe: 'Lambda function alias.',
                        required: true
                    },
                    tail: {
                        describe: 'Tail the logs.',
                        required: false,
                        default: false
                    },
                    startTime: {
                        describe: 'Start fetching logs from this time.  Time in minutes.  Ex. \'30\' minutes ago.',
                        required: false,
                        default: '30'
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
                run: this.logs
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