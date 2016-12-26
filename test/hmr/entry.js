"use strict";

/* global document */

require("../scss/language.scss");
require("./simple.css");

setInterval(() => {
    document.body.innerHTML += "<br>Now we just change the DOM, so that we can ensure that webpack is not just reloading the page";
}, 2000);
