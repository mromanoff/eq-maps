define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Backbone = require('backbone');

    /**
     * Model
     *
     * Sample boilerplate model
     *
     * @augments Backbone.Model
     * @name Model
     * @class Model
     * @return model
     */
    var Model = Backbone.Model.extend({

        url: consts.API + '/V1/billing/billing-information',

        defaults: {
            attribute1: null,
            attribute2: null
        }

    });

    module.exports = Model;
});
