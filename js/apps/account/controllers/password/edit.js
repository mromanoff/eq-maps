/* global define, App, _ */

define(function (require, exports, module) {
    'use strict';

    var Controller;
    var Marionette = require('marionette');
    var Model      = require('models/password');
    var View       = require('views/password/edit');
    var Core       = require('core/app');

    /**
     * Edit Password Controller
     *
     * Controller used to edit /username/edit
     *
     * @augments Backbone.Model
     * @name Username
     * @class UsernameController
     * @return model
     */
    Controller = Marionette.Controller.extend({

        /**
         * addToRegion
         *
         * add to the Marionette Layout
         * @param view
         */
        addToRegion: function (view) {
            Core.addRegions({ mainRegion: Core.el });
            Core.mainRegion.show(view);
        },

        /**
         * Init
         *
         * @name ProfileEditController#init
         * @function
         * @public
         */
        init: function () {
            var model, view;

            model = new Model();
            if (userProfileJson.IsSocialRegistration !== null && userProfileJson.IsSocialRegistration === true) {
                model.url = Core.utils.getApi('/account/fbregistrant/password/update');
            }
            console.log('URL: ', model.url);
            view  = new View({ model: model });

            this.addToRegion(view);
        }

    });

    module.exports = Controller;
});