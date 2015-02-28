define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');
    var Core = require('core/app');

    /**
     * Other Settings HP Model
     *
     * Model for the othersettings homepage
     *
     * @augments Backbone.Model
     * @name AccountHome
     * @class AccountHomeModel
     * @return model
     */
    var Model = Backbone.Model.extend({

        url: Core.utils.getApi('/xid/linkstatus'),

        defaults: {
            title: 'APPS & DEVICES',

            copy: '<p>To create a complete fitness profile, you can link your account to various health and fitness tracking apps. Linking your accounts takes about a minute. Just click on the LINK button of the app you\'d like to add and follow the prompts to authenticate.</p><p>Once you\'ve linked your accounts, all tracking will be synced to your web account the next time you log in.</p>'
        }

    });

    module.exports = Model;
});
