define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');

    var Transaction = Backbone.Model.extend({
        defaults: {
            country: 'USA',
            isEmpty: true
        }
    });

    module.exports = Transaction;
});