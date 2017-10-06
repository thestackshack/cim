'use strict';

const _ = require('lodash');
const async = require('async');
const fs = require("fs-extra");
const path = require('path');

var functions = {};

functions.validate = function(cim, done) {
    const template = _.find(cim.templates, {name: cim.args.template});
    if (!template) {
        done('Invalid \'template\', must be one of: '+JSON.stringify(cim.templates, null, 3), cim);
    } else if (fs.existsSync(path.resolve(cim.args.dir, '_cim.yml'))) {
        done('The following directory already contains a \'_cim.yml\' file:  '+cim.args.dir, cim);
    } else {
        done(null, cim);
    }
};

functions.create = function(cim, done) {
    const template = _.find(cim.templates, {name: cim.args.template});
    fs.copy(template.path, cim.args.dir, function(err) {
        if (!err) {
            console.log(' ______     __     __    __');
            console.log('/\\  ___\\   /\\ \\   /\\ "-./  \\');
            console.log('\\ \\ \\____  \\ \\ \\  \\ \\ \\-./\\ \\  ');
            console.log(' \\ \\_____\\  \\ \\_\\  \\ \\_\\ \\ \\_\\');
            console.log('  \\/_____/   \\/_/   \\/_/  \\/_/');
            console.log('');
            console.log(cim.args.template + ' has been created.  Thanks for using CIM!');
        }
        done(err);
    });
};

module.exports = {
    create(cim, done) {
        async.waterfall([
            async.constant(cim),
            functions.validate,
            functions.create
        ], done);
    }
};