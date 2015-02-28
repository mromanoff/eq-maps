define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');
    var Core = require('core/app');

    /**
     * Billing Info Model
     *
     * Stores all the data used in the Billing & Account page, which
     * is the homepage for the Account > Billing section of the site
     *
     * @augments Backbone.Model
     * @name BillingInfo
     * @class BillingInfoModel
     * @return model
     */
    var Model = Backbone.Model.extend({

        url: Core.utils.getApi('/account/account-information'),

        defaults: {
            hello: null
        }

    });

    module.exports = Model;
});
