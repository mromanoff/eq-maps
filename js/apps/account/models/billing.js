/* global define, Backbone, App */

define(function (require, exports, module) {
    'use strict';

    var Core = require('core/app');

    /**
     * Billing Model
     *
     * Stores all the data used in the about the user billing, which
     * is the homepage for the Account > Billing section of the site
     *
     * @augments Backbone.Model
     * @name Billing
     * @class BillingModel
     * @return model
     */
    var Model = Backbone.Model.extend({

        url: Core.utils.getApi('/billing/billing-information'),

        defaults: {
            cardLastFourDigits: null,
            nameOnCard: null,
            address1: null,
            address2: null,
            city: null,
            state: null,
            zipCode: null,
            email: null,
            cardType: null,
            isBillingOptOut: null,
            hasAgreedToTerms: null
        }

    });
    
    module.exports = Model;
});
