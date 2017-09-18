'use strict';

const assert = require('assert');
const _ = require('lodash');
const async = require('async');
const configs = require('../lib/configs');

describe('configs', function() {
    it('find', function(done) {
        configs.find(
            {
                recursive: true,
                dir: __dirname+'/resources/'
            },
            function(err, files) {
                if (err) return done(err);
                //console.log(JSON.stringify(files, null, 3));
                assert.ok(_.includes(files, __dirname+'/resources/base/_cim.yml'));
                assert.ok(_.size(files) >= 2);
                done();
            });
    });
    it('parse', function(done) {
        configs.parse(
            [
                __dirname+'/resources/s3/_cim.yml'
            ],
            function(err, data) {
                if (err) return done(err);
                //console.log(JSON.stringify(data, null, 3));
                assert.ok(data[0].version);
                done();
            });
    });
    it('validate - stack', function(done) {
        configs.validate(
            [
                {}
            ],
            function(err, data) {
                if (!err) return done('Should be invalid.');
                //console.log(JSON.stringify(data, null, 3));
                assert.ok(_.includes(err, 'Must have a \'stack\''));
                done();
            });
    });
    it('validate - name', function(done) {
        configs.validate(
            [
                {
                    stack: {

                    }
                }
            ],
            function(err, data) {
                if (!err) return done('Should be invalid.');
                //console.log(JSON.stringify(data, null, 3));
                assert.ok(_.includes(err, 'Must have a \'stack.name\''));
                done();
            });
    });
    it('validate - template', function(done) {
        configs.validate(
            [
                {
                    stack: {
                        name: 'test'
                    }
                }
            ],
            function(err, data) {
                if (!err) return done('Should be invalid.');
                //console.log(JSON.stringify(data, null, 3));
                assert.ok(_.includes(err, 'Must have a \'stack.template\''));
                done();
            });
    });
    it('validate - template.file', function(done) {
        configs.validate(
            [
                {
                    stack: {
                        name: 'test',
                        template: {

                        }
                    }
                }
            ],
            function(err, data) {
                if (!err) return done('Should be invalid.');
                //console.log(JSON.stringify(data, null, 3));
                assert.ok(_.includes(err, 'Must have a \'stack.template.file\''));
                done();
            });
    });
    it('validate - template.bucket', function(done) {
        configs.validate(
            [
                {
                    stack: {
                        name: 'test',
                        template: {
                            file: 'cf.yml'
                        }
                    },
                    _cim: {
                        file: 'cf.yml'
                    }
                }
            ],
            function(err, data) {
                if (!err) return done('Should be invalid.');
                //console.log(JSON.stringify(data, null, 3));
                assert.ok(_.includes(err, 'Must have a \'stack.template.bucket\''));
                done();
            });
    });
    it('validate - missing template', function(done) {
        configs.validate(
            [
                {
                    stack: {
                        name: 'test',
                        template: {
                            file: 'notfound.yml',
                            bucket: 'bucket'
                        }
                    },
                    _cim: {
                        file: 'cf.yml'
                    }
                }
            ],
            function(err, data) {
                if (!err) return done('Should be invalid');
                //console.log(JSON.stringify(data, null, 3));
                assert.ok(_.includes(err, 'Missing CloudFormation template'));
                done();
            });
    });
    it('validate - missing template file', function(done) {
        async.waterfall([
            async.constant(
                {
                    dir: __dirname+'/resources/missing_cf'
                }),
            configs.find,
            configs.parse,
            configs.validate,
        ], function(err, stacks) {
            if (!err) return done('Should be invalid.');
            assert.ok(_.includes(err, 'Missing CloudFormation template'));
            done();
        });
    });
    it('validate - missing parent file', function(done) {
        async.waterfall([
            async.constant(
                {
                    dir: __dirname+'/resources/missing_parent'
                }),
            configs.find,
            configs.parse,
            configs.validate,
        ], function(err, stacks) {
            if (!err) return done('Should be invalid.');
            assert.ok(_.includes(err, 'Missing parent'));
            done();
        });
    });
    it('validate - valid', function(done) {
        async.waterfall([
            async.constant(
                {
                    dir: __dirname+'/resources/s3'
                }),
            configs.find,
            configs.parse,
            configs.validate,
        ], function(err, stacks) {
            if (err) return done(err);
            done();
        });
    });
    it('resolve_stack_params', function(done) {
        var obj = {
            foo: 'bar',
            param: '${foo}'
        };
        configs.resolve_stack_params(obj);
        //console.log(JSON.stringify(obj, null, 3));
        assert.equal(obj.param, 'bar');
        done();
    });
    it('resolve_params', function(done) {
        var stacks = [
            {
                stack:
                    {
                        foo: 'bar',
                        param: '${stack.foo}'
                    }
            }
        ];
        configs.resolve_params(stacks, function(err, stacks) {
            if (err) return done(err);
            //console.log(JSON.stringify(stacks, null, 3));
            assert.equal(stacks[0].stack.param, 'bar');
            done();
        });
    });
    it('resolve_params - env', function(done) {
        var stacks = [
            {
                stack:
                    {
                        foo: 'bar',
                        param: '${stack.foo}',
                        env: '${env.test}'
                    }
            }
        ];
        process.env.test = 'yes';
        configs.resolve_params(stacks, function(err, stacks) {
            if (err) return done(err);
            //console.log(JSON.stringify(stacks, null, 3));
            assert.equal(stacks[0].stack.param, 'bar');
            assert.equal(stacks[0].stack.env, 'yes');
            done();
        });
    });
    it('resolve_params - missing', function(done) {
        var stacks = [
            {
                stack:
                    {
                        foo: 'bar',
                        param: '${stack.missing}'
                    }
            }
        ];
        configs.resolve_params(stacks, function(err, stacks) {
            if (!err) return done(err);
            done();
        });
    });
    it('validate_circular_stacks - valid', function(done) {
        var stacks = [
            {
                stack:
                    {
                        foo: 'bar',
                        param: '${stack.foo}'
                    }
            }
        ];
        configs.validate_circular_stacks(stacks, function(err, stacks) {
            if (err) return done(err);
            done();
        });
    });
    it('validate_circular_stacks - invalid', function(done) {
        var stacks = [
            {
                stack:
                    {
                        foo: 'bar',
                        param: '${stack.foo}'
                    }
            }
        ];
        var obj = {
            stacks: stacks
        };
        stacks.obj = obj;
        configs.validate_circular_stacks(stacks, function(err, stacks) {
            if (!err) return done(err);
            done();
        });
    });
});