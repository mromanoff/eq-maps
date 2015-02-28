define(function (require, exports, module) {
    'use strict';

    var Core             = require('core/app');
    var Marionette       = require('marionette');
    var BillingEditView  = require('views/billing/edit');
    var BillingEditModel = Backbone.Model.extend({
        url: Core.utils.getApi('/billing/update'),
        defaults: {
            "creditCardNumber": null,
            "cardType": null,
            "expirationDate": new Date(),
            "securityCode": null,
            "nameOnCard": null,
            "address1": null,
            "address2": null,
            "city": null,
            "state": null,
            "country": null,
            "zipCode": null,
            "isBillingOptOut": null
        }
    });
    
    /** 
     * Billing Edit Controller
     *
     * Controller used to manage everything for billing/add and billing/update pages
     *
     * @augments Backbone.Model
     * @name BillingEdit
     * @class BillingEditController
     * @return model
     */
    var BillingEditController = Marionette.Controller.extend({

        update: null,

        title: 'Add Card',

        addToRegion: function(view) {
            Core.addRegions({ mainRegion: Core.el });
            Core.mainRegion.show(view);
        },

        loadByStore: function() {
            var model, view, store;

            store = _.extend({'title': this.title, update: this.true }, Core.store.billing.info);
            model = new BillingEditModel(store);
            view  = new BillingEditView({ model: model });

            this.addToRegion(view);
        },


        loadByApi: function() {
            var InfoModel, infoModel, model, view, store, title = this.title, update = this.update, that = this;

            InfoModel = Backbone.Model.extend({ url: Core.utils.getApi('/billing/billing-information') });;
            infoModel = new InfoModel();

            infoModel.fetch().then(function () {
                Core.store.set('billing.info', infoModel);

                store = _.extend({'title': title, update: update }, infoModel.attributes);
                model = new BillingEditModel(store);
                view  = new BillingEditView({ model: model });

                that.addToRegion(view);
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
            if(Core.store.billing && Core.store.billing.info) {
                this.loadByStore();
            } else {
                this.loadByApi();
            }
        }
        
    });
    
    module.exports = BillingEditController;
});