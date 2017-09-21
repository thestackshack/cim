'use strict';

const _ = require('lodash');

module.exports = {
    templates(cim, done) {
        _.forEach(cim.templates, function(template) {
            console.log('Name: '+template.name);
            console.log('Description: '+template.description);
            console.log('');
        });
        done();
    }
};