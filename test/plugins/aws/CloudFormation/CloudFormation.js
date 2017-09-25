'use strict';

const assert = require('assert');
const _ = require('lodash');

const CloudFormation = require('../../../../lib/plugins/aws/CloudFormation/CloudFormation');

describe('CloudFormation', function() {
    it('commands', function (done) {
        let cloudFormation = new CloudFormation();
        console.log(JSON.stringify(cloudFormation.commands(), null, 3));
        done();
    });
});