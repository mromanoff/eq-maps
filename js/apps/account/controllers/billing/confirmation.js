define(function (require, exports, module) {
    'use strict';

    var Core                     = require('core/app');
    var Marionette               = require('marionette');
    var BillingConfirmationModel = require('models/billing/confirmation');
    var BillingConfirmationView  = require('views/billing/confirmation');
    
    /** 
     * Billing Confirmation Controller
     *
     * Controller used to manage everything for the billing/confirmation page
     *
     * @augments Backbone.Model
     * @name BillingConfirmation
     * @class BillingConfirmationController
     * @return model
     */
    var BillingConfirmationController = Marionette.Controller.extend({
       
        /**
         * Init
         *
         * @name BillingConfirmationController#init
         * @function
         * @public
         */
        init: function() {
            var model, view, store;

            store = Core.store.billing ? Core.store.billing.info : {};
            model = new BillingConfirmationModel(store);
            view  = new BillingConfirmationView({ model: model });

            Core.addRegions({ mainRegion: Core.el });
            Core.mainRegion.show(view);
        }
        
    });
    
    module.exports = BillingConfirmationController;
});