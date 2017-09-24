'use strict';

const async = require('async');

const configs = require('../../../../util/configs');
const cloudformation = require('../../../../util/cloudformation');

module.exports = {
    stack_delete(cim, done) {
        async.waterfall([
            async.constant(cim),
            configs.load,
            function(stacks, next) {
                console.log(JSON.stringify(stacks, null, 3));
                next(null, { stacks: stacks, params: cim.args});
            },
            cloudformation.delete
        ], done);
    }
};