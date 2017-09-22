'use strict';

const _ = require('lodash');
const async = require('async');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

var functions = {};

functions.npm_root_global = function(cim, done) {
    exec('npm root -g', {}, function(err, stdout, stderr) {
        if (stdout) {
            cim.npm_root_global = _.trim(stdout);
        }
        done(err, cim);
    });
};

functions.search = function(cim, done) {
    fs.readdir(cim.npm_root_global, function(err, files) {
        if (err) return done(err, cim);
        var plugins = [];
        _.forEach(files, function(file) {
            if (_.startsWith(file, 'cim_')) {
                plugins.push(file);
            }
        });
        cim.third_party_plugins = plugins;
        done(null, cim);
    });
};

functions.load = function(cim, done) {
    _.forEach(cim.third_party_plugins, function(plugin) {
         cim.plugins.push(new (require(plugin))());
    });
    done();
};

module.exports = function(cim, done) {
    async.waterfall([
        async.constant(cim),
        functions.npm_root_global,
        functions.search,
        functions.load
    ], done);
};