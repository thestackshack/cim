'use strict';

module.exports = function() {
    var args = require('yargs')
        .usage('cim <cmd> [args]')
        .command('stackup [dir] [recursive] [stage] [profile]', 'Create or update the CloudFormation stack(s).', {
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
            require('./stackup')(argv);
        })
        .help()
        .argv;
};