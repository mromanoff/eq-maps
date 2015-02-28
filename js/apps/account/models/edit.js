define(function (require, exports, module) {
    'use strict';

    var Model;
    var Backbone = require('backbone');
    var Core     = require('core/app');

    /**
     * Account HP Model
     *
     * Model for the account homepage
     *
     * @augments Backbone.Model
     * @name AccountHomeModel
     * @module AccountHomeModel
     * @namespace Account.AccountHomeModel
     * @return model
     */
    Model = Backbone.Model.extend({

        url: Core.utils.getApi('/account/account-information/update'),

        defaults: {
            title: 'Edit Personal Info:',
            name: null,
            address1: null,
            address2: null,
            city: null,
            state: null,
            zip: null,
            homePhone: null,
            mobilePhone: null,
            workPhone: null,
            workPhoneExt: null,
            fieldsets: null,
            agreementCopy: null,
            isBillingOptOut: null,
            phoneCarrier: 'AT&T',
            country: 'USA'
        }

    });

    module.exports = Model;
});
