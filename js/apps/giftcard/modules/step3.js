define(function (require, exports, module) {
    'use strict';

    var App = require('app');
    var Step3 = module.exports;
    
    var recipientInfoModel = App.store.recipientInfoModel;
    var transactionModel = App.store.transactionModel;
    var reviewOrderModel = App.store.reviewOrderModel;
    var giftcardResponseModel = App.store.giftcardResponseModel;
    
    var UpdatedPaymentInfoModel = Backbone.Model.extend({
        defaults: {
            country: 'USA'
        },
        url: App.envConfig.updatePaymentInfoUrl
    });

    var updatedPaymentInfoModel = new UpdatedPaymentInfoModel();


    var ConfirmPaymentInfoModel = Backbone.Model.extend({
        defaults: {
            expirationMonth: null,
            expirationYear: null,
            creditCardNumber: null,
            securityCode: null,
            tenderAmount: null,
            itemNumber: null,
            hasAgreedToTerms: null,
            buyer: {
                firstName: null,
                lastName: null,
                Address1: null,
                Address2: null,
                City: null,
                State: null,
                zipCode: null,
                email: null
            },
            recipient: {
                firstName: null,
                lastName: null,
                email: null,
                message: null
            }
        },
        url: App.envConfig.confirmPaymentInfoUrl
    });

    var confirmPaymentInfoModel = new ConfirmPaymentInfoModel();


    var GiftCardDetailView = Backbone.View.extend({
        template: _.template($('#tplGiftCardDetails').html()),

        events: {
            'click #editGiftCardDetail': 'editGiftCardDetail'
        },

        render: function () {
            this.$el.html(this.template(reviewOrderModel.toJSON()));

            return this;
        },

        editGiftCardDetail: function (e) {
            e.preventDefault();

            App.utils.Spinner(this.el);
            App.router.navigate('#step1', { trigger: true });
        }

    });

    var MemberPaymentInfoView = Backbone.View.extend({
        template: _.template($('#tplMemberReviewOrderPaymentInfo').html()),

        events: {
            'click #editMemberPaymentInfo': 'editMemberPaymentInfo'
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        editMemberPaymentInfo: function (e) {
            e.preventDefault();
            App.store.reviewOrderModel.set('fromReviewOrderPage', true);
            App.utils.Spinner(this.el);
            App.router.navigate('#step2', { trigger: true });
        }
    });

    var GuestPaymentInfoView = Backbone.View.extend({
        template: _.template($('#tplGuestReviewOrderPaymentInfo').html()),

        events: {
            'click #editGuestPaymentInfo': 'editGuestPaymentInfo'
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        editGuestPaymentInfo: function (e) {
            e.preventDefault();

            App.utils.Spinner(this.el);
            App.router.navigate('#step2', { trigger: true });
        }
    });

    var PaymentInfoView = Backbone.View.extend({

        render: function () {

            if (!_.isEmpty(window.user)) {
                // Logged In User

                var memberPaymentInfoView = new MemberPaymentInfoView({ model: this.model });
                this.$el.html(memberPaymentInfoView.render().$el);
            } else {
                // Logged Out User
                
                var guestPaymentInfoView = new GuestPaymentInfoView({ model: this.model });
                this.$el.html(guestPaymentInfoView.render().$el);
            }

            return this;
        }

    });

    var BaseView = Backbone.View.extend({
        id: 'step3',

        template: $('#tplStep3').html(),

        events: {
            'click .navigate': 'navigate',
            'click .confirm': 'confirm'
        },

        initialize: function () {
            this.dom = {};
            
        },

        render: function () {
            this.$el.append(this.template);
            this.dom.$giftCardDetails = this.$('#giftCardDetails');
            this.dom.$paymentInfo = this.$('#paymentInfo');

            this.processReviewOrderModel();

            var giftCardDetailView = new GiftCardDetailView({ model: reviewOrderModel });
            var paymentInfoView = new PaymentInfoView({ model: reviewOrderModel });
            
            this.dom.$giftCardDetails.html(giftCardDetailView.render().$el);
            this.dom.$paymentInfo.html(paymentInfoView.render().$el);
            
            return this;
        },

        confirm: function () {
            var self = this;

            confirmPaymentInfoModel.set({
                expirationMonth: transactionModel.get('shortExpirationDate').indexOf('NaN') === -1 ? transactionModel.get('shortExpirationDate').split('/')[0] : '',
                expirationYear: transactionModel.get('shortExpirationDate').indexOf('NaN') === -1 ? transactionModel.get('shortExpirationDate').split('/')[1] : '',
                creditCardNumber: transactionModel.get('creditCardNumber'),
                securityCode: transactionModel.get('securityCode'),
                tenderAmount: reviewOrderModel.get('price').split('$')[1]+'.00',
                itemNumber: recipientInfoModel.get('itemNumber'),
                hasAgreedToTerms: transactionModel.get('hasAgreedToTerms'),
                buyer: {
                    firstName: transactionModel.get('nameOnCard').split(' ')[0],
                    lastName: transactionModel.get('nameOnCard').split(' ')[1] !== 'undefined' ? transactionModel.get('nameOnCard').split(' ')[1] : '',
                    Address1: transactionModel.get('address1'),
                    Address2: transactionModel.get('address2'),
                    City: transactionModel.get('city'),
                    State: transactionModel.get('state'),
                    zipCode: transactionModel.get('zipCode'),
                    email: transactionModel.get('email')
                },
                recipient: {
                    firstName: recipientInfoModel.get('firstName'),
                    lastName: recipientInfoModel.get('lastName'),
                    email: recipientInfoModel.get('email'),
                    message: recipientInfoModel.get('message')
                }
            });

            App.utils.Spinner(this.el);

            var updateCardOnFile = App.store.transactionModel.get('updateCardOnFile');

            if (updateCardOnFile) {
                updatedPaymentInfoModel.set(_.extend({},
                    App.store.transactionModel.toJSON()
                ));

                updatedPaymentInfoModel.save()
                .success(function () {
                    confirmPaymentInfoModel.save()
                    .success(function (data) {
                        $('#server-error').html('');
                        giftcardResponseModel.set({
                            transactionNumber: data.transactionNumber,
                            giftCardNumber: data.giftCardNumber,
                            giftCardNumberEncrypted: data.giftCardNumberEncrypted
                        });
                        self.success();
                    })
                    .error(function (err) {
                        $('.spinner').remove();
                        $('#server-error').html(err.responseJSON.message);
                        console.log(err.responseText);
                    });
                })
                .error(function (err) {
                    $('.spinner').remove();
                    console.log(err.responseText);
                });
            } else {
                confirmPaymentInfoModel.save()
                .success(function (data) {
                    $('#server-error').html('');
                    giftcardResponseModel.set({
                        transactionNumber: data.transactionNumber,
                        giftCardNumber: data.giftCardNumber,
                        giftCardNumberEncrypted: data.giftCardNumberEncrypted
                    });
                    self.success();
                })
                .error(function (err) {
                    $('.spinner').remove();
                    $('#server-error').html(err.responseJSON.message);
                    console.log(err.responseText);
                });
            }
        },

        success: function () {
            App.router.navigate(this.$('.next').data('url'), { trigger: true });
        },

        processReviewOrderModel: function () {
            reviewOrderModel.set({
                cardType: transactionModel.get('cardType'),
                cardLastFourDigits: transactionModel.get('cardLastFourDigits'),
                expirationDate: transactionModel.get('expirationDate'),
                shortExpirationDate: transactionModel.get('shortExpirationDate'),
                address1: transactionModel.get('address1'),
                address2: transactionModel.get('address2'),
                city: transactionModel.get('city'),
                state: transactionModel.get('state'),
                zipCode: transactionModel.get('zipCode'),
                recipientName: recipientInfoModel.get('firstName') + ' ' + recipientInfoModel.get('lastName'),
                senderName: !_.isEmpty(window.user) ? (window.user.FirstName + ' ' + window.user.LastName) : transactionModel.get('nameOnCard'),
                recipientEmail: recipientInfoModel.get('email'),
                senderEmail: !_.isEmpty(window.user) ? window.user.EmailAddress : transactionModel.get('email'),
                price: recipientInfoModel.get('price'),
                cardImg: App.envConfig.giftCardImageUrl('05d4ba09-4e77-421b-b7f5-67f26593912d'),
                message: recipientInfoModel.get('message')
            });

            // To use in confirmation page
            App.store.reviewOrderModel = reviewOrderModel;
        },

        navigate: function (e) {
            var $target = $(e.target);
            var url = '';

            App.utils.Spinner(this.el);

            if ($target.hasClass('prev')) {
                url = this.$('.prev').data('url');
            } else if ($target.hasClass('next')) {
                url = this.$('.next').data('url');
            }

            App.router.navigate(url, { trigger: true });
        }
    });

    // init layout
    Step3.init = function () {
        window.EQ.Helpers.goToTop();

        var baseView = new BaseView();
        $('#app-main').html(baseView.render().$el);
    };

});
