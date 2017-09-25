'use strict';

const _ = require('lodash');
const async = require('async');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

const cache_service = require('./cache');

var functions = {};

functions.npm_root_global = function(cim, done) {
    async.waterfall([
        cache_service.get_cache,
        function(cache, next) {
            if (cache && cache.npm_root_global) {
                cim.npm_root_global = cache.npm_root_global;
                next(null, cim, cache);
            } else {
                exec('npm root -g', {}, function(err, stdout, stderr) {
                    if (stdout) {
                        cim.npm_root_global = _.trim(stdout);
                    }
                    next(err, cim, cache);
                });
            }
        },
        function(cim, cache, next) {
            if (!cache) {
                cache_service.store_cache({npm_root_global: cim.npm_root_global}, next);
            } else if (cache && !cache.npm_root_global) {
                cache.npm_root_global = cim.npm_root_global;
                cache_service.store_cache(cache, next);
            } else {
                next();
            }
        }
    ], function(err) {
        done(err, cim);
    });
};

functions.search = function(cim, done) {
    fs.readdir(cim.npm_root_global, function(err, files) {
        if (err) return done(err, cim);
        var plugins = [];
        _.forEach(files, function(file) {
            if (_.startsWith(file, 'cim_') || _.startsWith(file, 'cim-')) {
                plugins.push(file);
            }
        });
        cim.third_party_plugins = plugins;
        done(null, cim);
    });
};

functions.load = function(cim, done) {
    _.forEach(cim.third_party_plugins, function(plugin) {
         cim.plugins.push(new (require(path.resolve(cim.npm_root_global, plugin)))());
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