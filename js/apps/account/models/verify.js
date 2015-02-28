define(function (require, exports, module) {
    'use strict';

    var Core     = require('core/app');
    var Backbone = require('backbone');

    /**
     * Username Verify Model
     *
     * Stores data used on verification page where users land
     * after clicking on verification link on their email accounts
     *
     * @augments Backbone.Model
     * @name UsernameVerify
     * @class UsernameVerifyModel
     * @return model
     */
    var Model = Backbone.Model.extend({

        url: Core.utils.getApi('/account/username/confirm'),

        defaults: {
            title: 'Welcome Back!',
            email: null,
            password: null,
            copy: null
        }

    });

    module.exports = Model;
});
