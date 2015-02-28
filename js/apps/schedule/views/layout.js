define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Marionette = require('marionette');
    var template = require('text!templates/layout.tpl');

    module.exports = Marionette.Layout.extend({
        template: _.template(template),

        regions: {
            header: '.header',
            filter: '.trainer-filter',
            navigation: '.navigation',
            content: '.content'
        }
    });


});