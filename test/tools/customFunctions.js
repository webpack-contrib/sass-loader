'use strict';

var sass = require('node-sass');

module.exports = {
    'headings($from: 0, $to: 6)': function (from, to) {
        var f = from.getValue();
        var t = to.getValue();
        var list = new sass.types.List(t - f + 1);
        var i;

        for (i = f; i <= t; i++) {
            list.setValue(i - f, new sass.types.String('h' + i));
        }

        return list;
    }
};
