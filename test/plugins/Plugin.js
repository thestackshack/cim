'use strict';

const assert = require('assert');
const _ = require('lodash');

const Plugin = require('../../lib/plugins/Plugin');

describe('Plugin', function() {
    it('commands', function (done) {
        let plugin = new Plugin();
        console.log(JSON.stringify(plugin.commands(), null, 3));
        done();
    });
    it('hooks', function (done) {
        let plugin = new Plugin();
        console.log(JSON.stringify(plugin.hooks(), null, 3));
        plugin.hooks()['before:templates'][0]('', done);
    });
});