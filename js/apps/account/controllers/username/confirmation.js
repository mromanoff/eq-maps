define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var Model      = Backbone.Model.extend({});
    var View       = require('views/username/confirmation');
    var Core       = require('core/app');

    /**
     * Username Confirmation Controller
     *
     * Controller used to manage everything for the username/confirmation page
     *
     * @augments Backbone.Model
     * @name UsernameConfirmation
     * @class UsernameConfirmationController
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
            var model, view, store;

            store = Core.store.account;
            model = new Model(store);
            view  = new View({ model: model });

            Core.addRegions({ mainRegion: Core.el });
            Core.mainRegion.show(view);
            if (userProfileJson.IsSocialRegistration !== null && userProfileJson.IsSocialRegistration === true) {
                view.$el.find('#emailConfirmMsg').css('display','none');
                view.$el.find('#fbUsernameChangeMsg').css('display', 'block');
            }
            
        }

    });

    module.exports = Controller;
});