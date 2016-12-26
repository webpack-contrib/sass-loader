"use strict";

const sass = require("node-sass");

module.exports = {
    "headings($from: 0, $to: 6)"(from, to) {
        const f = from.getValue();
        const t = to.getValue();
        const list = new sass.types.List(t - f + 1);
        let i;

        for (i = f; i <= t; i++) {
            list.setValue(i - f, new sass.types.String("h" + i));
        }

        return list;
    }
};
