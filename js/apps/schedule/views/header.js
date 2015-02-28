define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var template = require('text!templates/header.tpl');

    module.exports = Marionette.ItemView.extend({
        //className: 'classes-filter',
        template: _.template(template)
    });
});