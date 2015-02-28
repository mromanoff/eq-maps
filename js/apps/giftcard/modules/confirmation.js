define(function (require, exports, module) {
    'use strict';

    var App = require('app');
    var Confirmation = module.exports;
    var giftcardResponseModel = App.store.giftcardResponseModel.toJSON();

    var CreditCardDetailView = Backbone.View.extend({
        template: _.template($('#tplConfirmationCreditCardDetails').html()),

        render: function () {
            this.$el.html(this.template(App.store.reviewOrderModel.toJSON()));

            return this;
        }
    });


    var GiftCardDetailView = Backbone.View.extend({
        template: _.template($('#tplConfirmationGiftCardDetails').html()),

        render: function () {
            this.$el.html(this.template(App.store.reviewOrderModel.toJSON()));

            return this;
        }
    });

    var BaseView = Backbone.View.extend({
        id: 'confirmation',

        template: _.template($('#tplConfirmation').html()),

        events: {
            'click #printGiftCard': 'printGiftCard'
        },

        initialize: function () {
            this.dom = {};
        },

        render: function () {
            this.$el.append(this.template(App.store.reviewOrderModel.toJSON()));
            this.dom.$thankYouGiftCardInfo = this.$('#thankYouGiftCardInfo');
            this.dom.$thankYouCreditCardInfo = this.$('#thankYouCreditCardInfo');

            var giftCardDetailView = new GiftCardDetailView();
            this.dom.$thankYouGiftCardInfo.html(giftCardDetailView.render().$el);

            var creditCardDetailView = new CreditCardDetailView();
            this.dom.$thankYouCreditCardInfo.html(creditCardDetailView.render().$el);

            return this;
        },
        
        printGiftCard: function () {
            //e.preventDefault();
             window.open(App.envConfig.printCardUrl(giftcardResponseModel.giftCardNumberEncrypted), '_blank');
            //window.open(App.envConfig.printCardUrl(), '_blank');
            window.focus();
        }
        
    });

    // init layout
    Confirmation.init = function () {
        window.EQ.Helpers.goToTop();

        var baseView = new BaseView();
        $('#app-main').html(baseView.render().$el);
    };

});
