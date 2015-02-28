define(function (require, exports, module) {
    'use strict';

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

        defaults: {
            title: 'Settings',
            fbShare: null,
            isConfirmationOptOut: null
        }

    });

    module.exports = Model;
});
