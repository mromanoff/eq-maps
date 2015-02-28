define(function (require, exports, module) {
    'use strict';

    // get purchase App
    var App = require('app');
    var Analytics = require('analytics');
    var Order = require('order');
    var Billing = require('billing');

    var transaction = App.store.transaction; // Alias the model for easier identification.

    // Alias the module for easier identification.
    var Confirmation = module.exports;

    var submitOmnitureTags = function () {
        var omniture = new Analytics.Model.Omniture();
        var selectedPackage = transaction.getSelectedPackage();
        var pageVars = {
            step: 'thankyou',
            productTier: selectedPackage.tier,
            productPack: selectedPackage.quantity,
            productDuration: selectedPackage.duration,
            productCost: selectedPackage.priceBeforeTax,
            orderId: transaction.get('orderNumber')
        };
        omniture.set(pageVars);
    };

    // Conformation Views
    Confirmation.Views = {};

    Confirmation.Views.Base = Backbone.View.extend({
        manage: true,
        model: transaction,
        className: 'confirmation',
        template: 'confirmation/index',

        events: {
            'click .navigate': 'navigate',
            'click .js-print-page': 'printPage'
        },

        navigate: function (e) {
            App.router.navigate($(e.currentTarget).data('url'), {trigger: true});
        },

        // set defaults Transaction model. prevent user use back button and resubmit the purchase.
        afterRender: function () {
            this.model.clear();
            this.model.set(this.defaults);
        },

        serialize: function () {
            return this.model.toJSON();
        },

        printPage: function (e) {
            e.preventDefault();
            window.print();
        }
    });

    Confirmation.init = function () {
        submitOmnitureTags();

        var renderLayout = function () {
            // Use the main layout.
            App.useLayout('layouts/main').setViews({
                // Attach the root content View to the layout.
                '.pt-purchase': new Confirmation.Views.Base({
                    views: {
                        '#order': new Order.View(),
                        '#billing': new Billing.View()
                        //,
                        //'#inventory': new Inventory.Views.Inventory()
                    }
                })
            }).render();
        };

        // if packageId undefined or null redirect to step1
        if (_.isEmpty(transaction.get('selectedPackage').packageId)) {
            App.router.navigate('#step1', { trigger: true });
        }
        else {
            renderLayout();
        }
    };
});