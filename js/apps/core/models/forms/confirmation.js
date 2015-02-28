/* global define, Backbone */

define(function (require, exports, module) {
    'use strict';

    var Model
    var Marionette = require('marionette');

    /**
     * Confirmation Model
     *
     * Provide some defaults for a generic confirmation; but also,
     * store any custom data that might be passed.
     *
     * @augments Backbone.Model
     * @name Confirmation
     * @class ConfirmationModel
     * @return model
     */
    Model = Backbone.Model.extend({

        defaults: {
            title: 'Saved!',
            body: 'Form sent successfully!'
        }
    });

    module.exports = Model;
});
