'use strict';

const path = require('path');

// Functions
const test_fn = require('./lib/test');

class TestPlugin {
    constructor() {
        Object.assign(
            this,
            test_fn);
    }

    /**
     * Get all the commands available for this plugin.
     *
     * @returns {Array}
     */
    commands() {
        return [
            {
                command: 'test',
                description: 'Test',
                params: {},
                run: this.test
            }
        ]
    }

    before_test(cim, done) {
        // Example hook.
        // Do something before the 'templates' command is executed.
        console.log('before_test');
        done();
    }

    after_test(cim, done) {
        // Example hook.
        // Do something after the 'templates' command is executed.
        console.log('after_test');
        done();
    }

    /**
     * Return all the before and after hooks this plugin exposes.
     *
     * @returns hooks
     */
    hooks() {
        // Example hooks.
        return {
            'before:templates': [
                this.before_test
            ],
            'after:templates': [
                this.after_test
            ]
        };
    }

    /**
     * Get the path to the template directory to copy during a 'create' command.
     *
     * @returns {null}
     */
    template() {
        return {
            name: 'test',
            description: 'Test CloudFormation setup.',
            path: path.resolve(__dirname, 'template')
        }
    }

}
module.exports = TestPlugin;