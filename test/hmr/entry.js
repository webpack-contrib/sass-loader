"use strict";

/* global document */

require("./simple.scss");

setInterval(() => {
    document.body.innerHTML += "<br>Now we just change the DOM, so that we can ensure that webpack is not just reloading the page";
}, 2000);
