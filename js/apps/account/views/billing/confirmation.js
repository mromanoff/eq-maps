define(function (require, exports, module) {
    'use strict';

    var Core                   = require('core/app');
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
                var autopay = this.isBillingOptOut ? 'OFF' : 'ON';
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
                return 'Thank you, ' + this.firstName() + '.';
            },

            msg: function() {
                return 'You have no balance due' + (this.autopay ? ', and your updated card will be used as your default payment option.' : '.');
            },

            confirmation: function() {
                return this.confirmationNumber ? this.confirmationNumber : '';
            }
        }
    });
    
    module.exports = BillingConfirmationView;
});