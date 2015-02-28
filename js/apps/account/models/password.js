define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Backbone = require('backbone');
    var Core     = require('core/app');

    /**
     * Password Edit Model
     *
     * Stores membership information prefetch from the server
     * and submits to the server new password
     *
     * @augments Backbone.Model
     * @name Password
     * @class PasswordModel
     * @return model
     */
    var Model = Backbone.Model.extend({

        url: Core.utils.getApi('/account/password/update'),

        defaults: {
            title: 'Change Password'
        }

    });

    module.exports = Model;
});
