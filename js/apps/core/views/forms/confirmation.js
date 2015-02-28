define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Marionette             = require('marionette');
    var billingConfirmationTpl = require('text!templates/billing/confirmation.tpl');

    /**
     * Billing Confirmation View class
     *
     * This is the view, template helpers and bindings for the billing confirmation page
     * which is shown after a user submits the a billing add/update form
     *
     * @name BillingConfirmation
     * @class BillingConfirmationView
     * @return view
     */
    var BillingConfirmationView = Marionette.ItemView.extend({
        template : _.template(billingConfirmationTpl),

        templateHelpers: {
            autoPurchase: function() {
                var autopay = this.autopay ? 'ON' : 'OFF';
                return 'Auto Purchase: ' + autopay;
            },

            cardEnding: function() {
                return Core.utils.getCardType(this.creditCardNumber) + ' ending - ' + Core.utils.getLastFourDigits(this.creditCardNumber);
            },

            firstName: function() {
                var str = this.nameOnCard.split(' ');

                return str[0];
            },

            thanks: function() {
                return 'Thank you, ' + this.firstName() + '!';
            },

            msg: function() {
                return 'YOU HAVE NO BALANCE DUE' + (this.autopay ? ', AND YOUR UPDATED CARD WILL BE SET TO USE AS A DEFAULT PAYMENT OPTION.' : '.');
            },

            confirmation: function() {
                return this.confirmationNumber ? this.confirmationNumber : '';
            }
        }
    });

    module.exports = BillingConfirmationView;
});