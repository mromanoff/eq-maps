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

        url: Core.utils.getApi('/xid/account'),

        defaults: {
            isLinked: null,
            clientLoginId: null
        }

    });

    module.exports = Model;
});
