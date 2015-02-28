define(function (require, exports, module) {
    'use strict';

    var Core = require('core/app');
    var Backbone = require('backbone');

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

        url: Core.utils.getApi('/xid/register'),

        defaults: {
            title: 'Sign Up to XID',
            measurementUnit: 'Imperial/U.S.'
        }

    });

    module.exports = Model;
});
