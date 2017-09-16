'use strict';

const assert = require('assert');
const _ = require('lodash');
const async = require('async');
const lambda = require('../lib/lambda');

describe('lambda', function() {
    it('resolve_stack_params', function(done) {
        var obj = {
            foo: 'bar',
            param: '${foo}'
        };
        lambda.resolve_stack_params({stack: obj}, function(err, input) {
            //console.log(JSON.stringify(obj, null, 3));
            assert.equal(input.stack.param, 'bar');
            done();
        });
    });
    it('parse_commands', function(done) {
        var stack = {
            deploy: {
                phases: {
                    pre_deploy: {
                        commands: [
                            'npm install'
                        ]
                    }
                }
            }
        };
        var commands = lambda.parse_commands({stack: stack}, 'pre_deploy');
        //console.log(JSON.stringify(commands, null, 3));
        assert.equal(commands[0], 'npm install');
        done();
    });
    it('process_commands', function(done) {
        var stack = {
            _cim: {
                file: __dirname+'/resources/s3/_cim.yml'
            },
            deploy: {
                phases: {
                    pre_deploy: {
                        commands: [
                            'ls'
                        ]
                    }
                }
            }
        };
        lambda.process_commands({stack: stack}, 'pre_deploy', function(err, input) {
            //console.log(JSON.stringify(commands, null, 3));
            done(err);
        });
    });
});