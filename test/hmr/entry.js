'use strict';

//require('../scss/language.scss');
require('./simple.css');

setInterval(function () {
    document.body.innerHTML += '<br>this text should not suddenly disappear because the style is replaced on-the-fly';
}, 2000);
