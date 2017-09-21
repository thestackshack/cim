'use strict';

const assert = require('assert');
const _ = require('lodash');
const CIM = require('../lib/classes/CIM');

describe('CloudFormation', function() {
    it('commands', function (done) {
        let cim = new CIM();
        cim.run();
        console.log(cim.args);
        done();
    });
});