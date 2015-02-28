define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');

    /**
     * Account HP Model
     *
     * Model for the account homepage
     *
     * @augments Backbone.Model
     * @name AccountHome
     * @class AccountHomeModel
     * @return model
     */
    var Model = Backbone.Model.extend({

        defaults: {
            title: 'Account Information',
            paymentType: null,
            errorMessage: null
        }

    });

    module.exports = Model;
});
