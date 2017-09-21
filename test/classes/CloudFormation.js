'use strict';

const assert = require('assert');
const _ = require('lodash');

const CloudFormation = require('../../lib/classes/CloudFormation');

describe('CloudFormation', function() {
    it('commands', function (done) {
        let cloudFormation = new CloudFormation();
        console.log(JSON.stringify(cloudFormation.commands(), null, 3));
        done();
    });
    it('hooks', function (done) {
        let cloudFormation = new CloudFormation();
        console.log(JSON.stringify(cloudFormation.hooks(), null, 3));
        cloudFormation.hooks()['before:help'][0]('');
        done();
    });
});