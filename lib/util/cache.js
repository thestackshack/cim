'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');

const CACHE_FILE = '.cim.json';

var functions = {};

functions.get_cache = function(done) {
    fs.readFile(path.resolve(os.homedir(), CACHE_FILE), function (err, data) {
        if (err) {
            done(null, {});
        } else {
            done(null, JSON.parse(data));
        }
    });
};

functions.store_cache = function(cache, done) {
    fs.writeFile(path.resolve(os.homedir(), CACHE_FILE), JSON.stringify(cache, null, 3), function(err) {
        if (err) console.log(JSON.stringify(err, null, 3));
        done();
    });
};

module.exports = functions;