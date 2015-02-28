define(function (require, exports, module) {
    'use strict';

    var App = require('app');

    var transaction = App.store.transaction; // Alias the model for easier identification.
    var Inventory = module.exports; // Alias the module for easier identification.

    Inventory.Model = Backbone.Model.extend({
        defaults: {
            name: null,
            duration: null,
            remaining: null,
            isEquifitEligible: null
        },
        url: App.envConfig.inventoryUrl
    });

    // Default View.
    Inventory.Views = {};

    Inventory.Views.Equifit = Backbone.View.extend({
        manage: true,
        className: 'equifit',
        template: 'step1/equifit',
        events: {
            'click .icon-close': 'closeView'
        },

        closeView: function (e) {
            var self = this;
            e.preventDefault();
            transaction.attributes.inventory.set({isEquifitEligible: false});
            this.$el.slideUp(300, function () {
                self.remove();
            });
        }
    });

    Inventory.Views.Inventory = Backbone.View.extend({
        manage: true,
        el: false,
        template: 'inventory',

        initialize: function () {
            this.model = transaction.attributes.inventory.clone();
        },

        serialize: function () {
            return this.model.toJSON();
        }
    });
});