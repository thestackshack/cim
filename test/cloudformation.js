'use strict';

const assert = require('assert');
const _ = require('lodash');
const async = require('async');
const cloudformation = require('../lib/cloudformation');

describe('cloudformation', function() {
    it('is_ready', function(done) {
        var stack = {
            stack: {
                parents: {
                    base: {
                        _cim: {
                            status: 'complete'
                        }
                    }
                }
            }
        };
        assert.ok(cloudformation.is_ready(stack));
        var stack = {
            stack: {
                parents: {
                    base: {
                        _cim: {
                            status: 'failed'
                        }
                    }
                }
            }
        };
        assert.ok(!cloudformation.is_ready(stack));
        var stack = {
            stack: {
                parents: {
                    base: {
                        _cim: {
                        }
                    }
                }
            }
        };
        assert.ok(!cloudformation.is_ready(stack));
        var stack = {
            stack: {
                parents: {
                }
            }
        };
        assert.ok(cloudformation.is_ready(stack));
        done();
    });
});