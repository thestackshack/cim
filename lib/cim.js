'use strict';

module.exports = function() {
    var args = require('yargs')
        .usage('cim <cmd> [args]')
        .command('stackup [dir] [recursive] [deploy] [stage] [profile]', 'Create or update the CloudFormation stack(s).', {
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
            deploy: {
                describe: 'Deploy the resources if available?',
                required: false,
                default: true
            },
            stage: {
                describe: 'Create or update the stack(s) using the give stage.',
                required: false
            },
            profile: {
                describe: 'Your AWS credentials profile.',
                required: false
            }
        }, function (argv) {
            require('./stackup')(argv);
        })
        .command('delete [dir] [recursive] [stage] [profile]', 'Delete the CloudFormation stack(s).', {
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
        }, function (argv) {
            require('./delete')(argv);
        })
        .command('deploy [dir] [recursive] [stage] [profile]', 'Deploy the lambda functions.', {
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
        }, function (argv) {
            require('./deploy')(argv);
        })
        .command('create [dir] [template]', 'Create a new CIM project.', {
            dir: {
                describe: 'The directory this command will create for your new CIM project.',
                required: false,
                default: process.cwd()
            },
            template: {
                describe: 'The project template to use.',
                required: false,
                default: 'stack'
            }
        }, function (argv) {
            require('./create')(argv);
        })
        .help()
        .argv;
};