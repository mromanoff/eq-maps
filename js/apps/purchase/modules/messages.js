define(function (require, exports, module) {
    'use strict';

    // Alias the module for easier identification.
    var Messages = module.exports;
    Messages.Views = {};

    Messages.Views.Warning = Backbone.View.extend({
        manage: true,
        el: false,
        template: 'warning',
        serialize: function () {
            return this.model;
        }
    });

    Messages.Views.MemberMessage = Backbone.View.extend({
        manage: true,
        el: false,
        template: 'message',
        serialize: function () {
            return this.model;
        }
    });
});
