define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Marionette = require('marionette');
    
    /** 
     * Billing Confirmation Model
     *
     * Stores all the data used in the confirmation page after a payment 
     * has been submitted and/or processed
     *
     * @augments Backbone.Model
     * @name BillingConfirmation
     * @class BillingConfirmationModel
     * @return model
     */
    var BillingConfirmationModel = Backbone.Model.extend({

        defaults: {
            title: 'Success!',
            confirmation: 'CONFIRMATION # 07-19247968'
        }
    });
    
    module.exports = BillingConfirmationModel;
});
