/* global define */

define(function (require, exports, module) {
    'use strict';

    var Controller;
    var Marionette = require('marionette');
    var Model      = require('models/edit');
    var View       = require('views/edit');
    var Core       = require('core/app');

    /**
     * Edit Profile Controller
     *
     * Controller used to manage /account/profile/edit
     *
     * @augments Backbone.Model
     * @name ProfileEdit
     * @class ProfileEditController
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
         * loadByStore
         *
         * We assume the user came from a page like the billing/info page which stores all the
         * balance info needed including whether the card has expired or not.
         *
         */
        loadByStore: function() {
            var model, view, store;

            store = _.extend({}, Core.store.account);
            model = new Model(store);
            view  = new View({ model: model });

            this.addToRegion(view);
        },


        /**
         * loadByApi
         *
         * If the user lands directly on the payment page, then load the billing info API to
         * try to find out if there is a balance or not.
         *
         * @todo maybe we should just show a "no balance" view instead of this method or redirect to hp
         *
         */
        loadByApi: function() {
            var AccountInfoModel, accountInfoModel, model, view, store, opts, title = this.title, that = this;

            AccountInfoModel = Backbone.Model.extend({ url: Core.utils.getApi('/account/account-information') });;
            accountInfoModel = new AccountInfoModel();

            accountInfoModel.fetch().then(function () {
                Core.store.set('account', accountInfoModel);

                store = _.extend({}, accountInfoModel.attributes);
                model = new Model(store);
                view  = new View({ model: model });

                that.addToRegion(view);
            });

        },

        /**
         * Init
         *
         * @name ProfileEditController#init
         * @function
         * @public
         */
        init: function () {

            if(Core.store.account && Core.store.account.name) {
                this.loadByStore();
            } else {
                this.loadByApi();
            }
        }

    });

    module.exports = Controller;
});