define(function (require, exports, module) {
    'use strict';

    var Marionette      = require('marionette');
    var BillingPayModel = require('models/payment');
    var BillingPayView  = require('views/billing/payment');
    var Core            = require('core/app');

    /**
     * Billing Payment Controller
     *
     * Controller used to manage everything for billing/add and billing/update pages
     *
     * @augments Backbone.Model
     * @name BillingPayment
     * @class BillingPaymentController
     * @return model
     */
    var BillingPaymentController = Marionette.Controller.extend({

        title: 'Pay Balance',

        addToRegion: function(view) {
            Core.addRegions({ mainRegion: Core.el });
            Core.mainRegion.show(view);
        },

        /**
         * getPaymentApi
         *
         * The API is different depending on whether or not the user has an expired card or not.
         *
         * @param attributes
         * @returns {string}
         */
        getPaymentApi: function(attributes) {
            return attributes.isCardExpired ? '/billing/updatewithpay' : '/V1/billing/pay';

        },

        /**
         * loadByStore
         *
         * We assume the user came from a page like the billing/info page which stores all the
         * balance info needed including whether the card has expired or not.
         *
         */
        loadByStore: function() {
            var model, view, store, opts;

            opts = {
                'title': this.title
            };

            store = _.extend(opts, Core.store.billing.info);
            model = new BillingPayModel(store);
            view  = new BillingPayView({ model: model });

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
            var InfoModel, infoModel, model, view, store, opts, title = this.title, that = this;

            InfoModel = Backbone.Model.extend({ url: Core.utils.getApi('/billing/billing-information') });;
            infoModel = new InfoModel();

            infoModel.fetch().then(function () {
                Core.store.set('billing.info', infoModel);

                opts = {
                    'title': title
                };

                store = _.extend(opts, infoModel.attributes);
                model = new BillingPayModel(store);
                view  = new BillingPayView({ model: model });

                that.addToRegion(view);
                if (view) {
                    view.$el.find('#remBal').text('$'+store.currentBalance);
                }
            });

        },

        /**
         * Init
         *
         * @name BillingEditController#init
         * @function
         * @public
         */
        init: function() {
            if (Core.store.billing && Core.store.billing.info) {
                this.loadByStore();
            } else {
                this.loadByApi();
            }
        }

    });

    module.exports = BillingPaymentController;
});