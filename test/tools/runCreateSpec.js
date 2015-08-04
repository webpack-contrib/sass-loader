'use strict';

var createSpec = require('./createSpec.js');

['scss', 'sass'].forEach(function (ext) {
    createSpec(ext);
});
