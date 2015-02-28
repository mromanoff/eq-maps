define(function (require, exports, module) {
    'use strict';

    var App = require('app');
    var transaction = App.store.transaction; // Alias the model for easier identification.
    var Billing = module.exports;

    Billing.View = Backbone.View.extend({
        manage: true,
        template: 'billing',

        serialize: function () {
            return _.pick(transaction.toJSON(), 'useCardOnFile', 'cardType', 'cardLastFourDigits', 'cardLastFourDigitsNew');
        }
    });
});


