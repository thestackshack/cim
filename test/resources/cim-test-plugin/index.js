'use strict';

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

    hooks() {
        // Example hooks.
        return {
            'before:test': [
                this.before_test
            ],
            'after:test': [
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
        return null;
    }

}
module.exports = TestPlugin;