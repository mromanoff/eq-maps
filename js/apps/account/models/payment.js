define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');

    /**
     * Billing Payment Model
     *
     * Model for updating and paying at the same time
     *
     * @augments Backbone.Model
     * @name BillingPayment
     * @class BillingPaymentModel
     * @return model
     */
    var Model = Backbone.Model.extend({

        url: Core.utils.getApi('/billing/updatewithpay'),

        defaults: {
            "city": null,
            "country": 'boo',
            "state": null,
            "address1": null,
            "address2": null,
            "zipCode": null,
            "email": null,
            "creditCardNumber": null,
            "securityCode": null,
            "nameOnCard": null,
            "expirationDate": null,
            "hasAgreedToTerms": null,
            "currentBalance": null
        }

    });

    module.exports = Model;
});
