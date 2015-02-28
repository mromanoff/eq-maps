define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Backbone = require('backbone');

    /**
     * PT Renewals Model
     *
     * Simple model for the renewals settings
     *
     * @augments Backbone.Model
     * @name Model
     * @class Model
     * @return model
     */
    var Model = Backbone.Model.extend({

        url: function () {
            return  consts.API + '/personal-training-purchase/packsize';
        },

        defaults: {
            '30': null,
            '60': null
        }

    });

    module.exports = Model;
});
