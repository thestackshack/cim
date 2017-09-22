'use strict';

const _ = require('lodash');
const async = require('async');

const load_3rd_party_plugins = require('./util/load-3rd-party-plugins');

class CIM {
    constructor() {
        // Init some vars.
        this.yargs;
        this.args;
        this.templates = [];
        this.stacks;
        this.npm_root_global;

        // Load the default plugins.
        this.plugins = [];
        this.third_party_plugins = [];
    }

    run() {
        let cim = this;
        async.waterfall([
            function(next) {
                cim._load_plugins(next);
            },
            function(next) {
                cim._run(next);
            }
        ], function (err) {
            if (err) console.log(err);
        });
    }

    _load_plugins(done) {
        let cim = this;

        // Load default plugins.
        cim.plugins = _.map(require('./plugins.json'), function(plugin) {
            return new (require(plugin))();
        });

        // Search for 3rd party plugins.
        load_3rd_party_plugins(cim, done);
    }

    _run(done) {
        let cim = this;

        //
        // Compile all the hooks
        //
        var hooks = {};
        _.forEach(cim.plugins, function(plugin) {
            hooks = _.mergeWith(hooks, plugin.hooks(),
                function(objValue, srcValue) {
                    if (_.isArray(objValue)) {
                        return objValue.concat(srcValue);
                    }
                }
            );
        });

        //
        // Compile all the templates
        //
        _.forEach(cim.plugins, function(plugin) {
            if (!_.isNil(plugin.template()) && !_.isEmpty(plugin.template())) {
                cim.templates.push(plugin.template());
            }
        });

        //
        // Setup the commands within the default plugins.
        //

        // Init yargs.
        cim.yargs = require('yargs')
            .usage('cim <cmd> [args]');

        // Loop through and add all the commands
        _.forEach(cim.plugins, function (plugin) {
            _.forEach(plugin.commands(), function (command) {
                var cmd_str = command.command;
                if (!_.isEmpty(command.params)) {
                    cmd_str += ' ' + _.map(_.keys(command.params), function (key) {
                        return '[' + key + ']';
                    }).join(' ');
                }
                cim.yargs.command(cmd_str, command.description, command.params, function (args) {
                    // Add the command to the args for easy reference later.
                    args.command = command.command;
                    cim.args = args;

                    async.waterfall([
                        function (next) {
                            // Run any 'before' hooks.
                            cim._run_hooks(hooks, 'before', command.command, next);
                        },
                        function (next) {
                            // Run the command.
                            //console.log(JSON.stringify(command, null, 3));
                            command.run(cim, next);
                        },
                        function (next) {
                            // Run any 'after' hooks.
                            cim._run_hooks(hooks, 'after', command.command, next);
                        }
                    ], done);
                });
            });
        });

        // Complete yargs
        cim.yargs.help()
            .argv;
    }

    _run_hooks(hooks, prefix, command, done) {
        let cim = this;
        const prefix_hooks = hooks[prefix+':'+command];
        if (prefix_hooks && !_.isEmpty(prefix_hooks)) {
            async.eachSeries(prefix_hooks, function(hook, next) {
                hook(cim, next);
            }, done);
        } else {
            done();
        }
    }

}
module.exports = CIM;