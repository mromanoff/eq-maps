define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var template = require('text!templates/spinner.tpl');
    var Spinner = require('spin');

    module.exports = Marionette.ItemView.extend({
        template: _.template(template),
        id: 'spinner',

        initialize: function (options) {
            options = (options || {});
            this.title = options.title || null; //'Loading Data';
            this.message = options.message || null; //'Please wait, data is loading.';
        },

        serializeData: function () {
            return {
                title: this.title,
                message: this.message
            };
        },

        onShow: function () {

            var opts = {
                lines: 13, // The number of lines to draw
                length: 7, // The length of each line
                width: 2, // The line thickness
                radius: 10, // The radius of the inner circle
                corners: 0, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                color: '#000', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 52, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: '50%', // Top position relative to parent in px
                left: '50%' // Left position relative to parent in px
            };

            var target = document.getElementById(this.el.id);
            new Spinner(opts).spin(target);
        }
    });
});