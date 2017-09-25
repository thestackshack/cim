'use strict';

// Functions
const create_fn = require('./lib/create');
const templates_fn = require('./lib/templates');

class Plugin {
    constructor() {
        Object.assign(
            this,
            create_fn,
            templates_fn);
    }

    /**
     * Get all the commands available for this plugin.
     * 
     * @returns {Array}
     */
    commands() {
        return [
            {
                command: 'create',
                description: 'Create a new CIM project',
                params: {
                    dir: {
                        describe: 'The directory this command will create for your new CIM project.',
                        required: false,
                        default: process.cwd()
                    },
                    template: {
                        describe: 'The project template to use.',
                        required: false,
                        default: 'stack'
                    }
                },
                run: this.create
            },
            {
                command: 'templates',
                description: 'Show the available templates',
                params: {},
                run: this.templates
            }
        ]
    }

    before_templates(cim, done) {
        // Example hook.
        // Do something before the 'templates' command is executed.
        done();
    }

    after_templates(cim, done) {
        // Example hook.
        // Do something after the 'templates' command is executed.
        done();
    }

    hooks() {
        // Example hooks.
        return {
            'before:templates': [
                this.before_templates
            ],
            'after:templates': [
                this.after_templates
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
module.exports = Plugin;