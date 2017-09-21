'use strict';

const Plugin = require('../../Plugin');
const _ = require('lodash');
const path = require('path');

// Functions
const stack_up_fn = require('./lib/stack_up');
const stack_delete_fn = require('./lib/stack_delete');

class CloudFormation extends Plugin {
    constructor() {
        super();

        Object.assign(
            this,
            stack_up_fn,
            stack_delete_fn);
    }

    commands() {
        return [
            {
                command: 'stack-up',
                description: 'Create or update the CloudFormation stack(s).',
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
                plugin: 'CloudFormation',
                run: this.stack_up
            },
            {
                command: 'stack-delete',
                description: 'Delete the CloudFormation stack(s).',
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
                plugin: 'CloudFormation',
                run: this.stack_delete
            }
        ];
    }

    hooks() {
        return null;
    }

    template() {
        return {
            name: 'cloudformation',
            description: 'Basic CloudFormation setup.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = CloudFormation;