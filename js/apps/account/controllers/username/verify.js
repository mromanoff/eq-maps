define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var Model      = require('models/verify');
    var View       = require('views/username/verify');
    var Core       = require('core/app');
    var EmailModel = Backbone.Model.extend({
        url: Core.utils.getApi('/account/username/verify')
    });

    /**
     * Username Verify Controller
     *
     * Controller used to manage everything for the username/confirmation page
     *
     * @augments Backbone.Model
     * @name UsernameVerify
     * @class UsernameVerifyController
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
        init: function(token) {
            var model, view, email;

            email = new EmailModel();

            email.url = Core.utils.getApi('/account/username/verify/' + token);

            email.fetch().then(function (data) {
                model = new Model(data);
                view  = new View({ model: model });

                model.set({
                    email: data.email,
                    copy: '<p>Your new username/emaIl has been verified</p><p><strong>' + data.email + '</strong></p>'
                });

                Core.addRegions({ mainRegion: Core.el });
                Core.mainRegion.show(view);
            });
        }

    });

    module.exports = Controller;
});