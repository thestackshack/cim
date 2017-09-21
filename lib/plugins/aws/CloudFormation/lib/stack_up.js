'use strict';

const async = require('async');

const configs = require('../../../../util/configs');
const cloudformation = require('../../../../util/cloudformation');

module.exports = {
    stack_up(cim, done) {
        async.waterfall([
            async.constant(cim),
            configs.load,
            function(stacks, next) {
                next(null, { stacks: stacks, params: cim.args});
            },
            cloudformation.stackup
        ], done);
    }
};