define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var Model      = Backbone.Model.extend({});
    var View       = require('views/password/confirmation');
    var Core       = require('core/app');

    /**
     * Password Confirmation Controller
     *
     * Controller used to manage everything for the password/confirmation page
     *
     * @augments Backbone.Model
     * @name PasswordConfirmation
     * @class PasswordConfirmationController
     * @return model
     */
    var Controller = Marionette.Controller.extend({

        /**
         * Init
         *
         * @name Controller#init
         * @function
         * @public
         */
        init: function() {
            var model, view;

            model = new Model();
            view  = new View({ model: model });

            Core.addRegions({ mainRegion: Core.el });
            Core.mainRegion.show(view);
        }

    });

    module.exports = Controller;
});