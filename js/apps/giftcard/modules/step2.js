define(function (require, exports, module) {
    'use strict';

    require('jquery.cookie');

    var App = require('app');
    var PaymentInfoForm = require('./forms/billing');

    var Step2 = module.exports;
    var baseView, paymentInfoModel;
    var isMember = false;
    App.store.isRefreshed = false;

    // For testing purpose only remove it later
    window.app = App.store;

    var PaymentInfoModel = Backbone.Model.extend({
        url: App.envConfig.paymentInfoUrl
    });


    var UpdatedPaymentInfoModel = Backbone.Model.extend({
        defaults: {
            country: 'USA'
        }
    });

    var updatedPaymentInfoModel = new UpdatedPaymentInfoModel();


    /* Common Form */

    var PaymentInfoFormView = Backbone.View.extend({

        render: function () {
            console.log('PaymentInfoFormView');

            if (!App.store.transactionModel.get('isEmpty') && this.model && this.model.keys(this.model).length === 0) {
                this.model = App.store.transactionModel;
            } else if (!App.store.transactionModel.get('isEmpty') && this.model && this.model.keys(this.model).length > 0) {
                this.model.set(_.extend({},
                    App.store.transactionModel.toJSON()
                ));
            } else if (App.store.transactionModel.get('isEmpty') && this.model && this.model.keys(this.model).length === 0) {
                this.model = App.store.transactionModel;
            } else if (App.store.transactionModel.get('isEmpty') && this.model && this.model.keys(this.model).length > 0) {
                this.model.set(_.extend({},
                    App.store.transactionModel.toJSON(),
                    { 'expirationDate': '' }
                ));
            }

            this.paymentInfoForm = new PaymentInfoForm.Form({
                model: this.model,
                templateData: { 'isMember': isMember, 'eftAuthorizationMsg': this.model ? this.model.get('eftAuthorizationMsg') : '' }
            }).render();

            this.$el.html(this.paymentInfoForm.el);

            $('select', this.$('#payment-form'))[2].value = new Date().getMonth();
            $('select', this.$('#payment-form'))[3].value = new Date().getFullYear();

            _.each($('select', this.$('#payment-form')), function (el) {
                var value = $('option', $(el)).filter(':selected').text();
                $(el).prev('.option').text(value);
            });

            _.each($('.checkbox.checked', this.$('#payment-form')), function (el) {
                $(el).find(':checkbox').prop('checked', 'true');
            });

            this.paymentInfoForm.on('state:change', function (form, editor) {
                editor.$el.prev('.option').text(editor.getValue());
            });

            this.paymentInfoForm.on('expirationDate:change', function (form, editor) {
                editor.$month.prev('.option').text($('option:selected', editor.$month).text());
                editor.$year.prev('.option').text($('option:selected', editor.$year).text());
            });

            this.paymentInfoForm.on('updateCardOnFile:change', function (form, editor) {
                editor.$el.closest('.checkbox').toggleClass('checked');
            });

            this.paymentInfoForm.on('updateTermsCondition:change', function (form, editor) {
                editor.$el.closest('.checkbox').toggleClass('checked');
            });

            return this;
        }
    });


    /* Member Views */

    var MemberPaymentInfoView = Backbone.View.extend({
        template: $('#tplMemberPaymentInfo').html(),

        events: {
            'click .member-payment-info-navigate': 'navigate'
        },

        initialize: function () {
            this.dom = {};
        },

        render: function () {
            console.log('MemberPaymentInfoView');

            this.$el.html(this.template);
            this.dom.$memberPaymentInfoCOF = this.$('#memberPaymentInfoCOF');

            if (this.model.get('cardLastFourDigits')) {
                var memberPaymentInfoCOFView = new MemberPaymentInfoCOFView({ model: this.model });
                this.dom.$memberPaymentInfoCOF.prepend(memberPaymentInfoCOFView.render().$el);
            } else {
                var addMemberPaymentInfoView = new AddMemberPaymentInfoView({ model: this.model });
                this.dom.$memberPaymentInfoCOF.html(addMemberPaymentInfoView.render().$el);
            }

            return this;
        },

        navigate: function (e) {
            console.log('-MemberPaymentInfoView Navigate');
            var $target = $(e.target);
            var url = '';
            var formValue = paymentInfoModel.toJSON();

            App.utils.Spinner(baseView.el);

            if ($target.hasClass('prev')) {
                url = this.$('.prev').data('url');
            } else if ($target.hasClass('next')) {
                url = this.$('.next').data('url');
            }

            App.store.transactionModel.set(_.extend({},
                _.pick(formValue, 'creditCardNumber', 'cardType', 'securityCode', 'nameOnCard', 'address1', 'address2', 'city', 'state', 'zipCode', 'email', 'isBillingOptOut', 'cardLastFourDigits'), { 'expirationDate': jsDateToISO8601(formValue.expirationDate.toString()), 'shortExpirationDate': shortExpDate(formValue.expirationDate.toString()), 'isEmpty': false, 'hasAgreedToTerms': true }
                ));

            App.router.navigate(url, { trigger: true });
        }
    });

    var MemberPaymentInfoCOFView = Backbone.View.extend({
        template: _.template($('#tplMemberPaymentInfoCOF').html()),

        events: {
            //'click #editPaymentInfo': 'editPaymentInfo',
            'click #navigateWithExistingCard': 'navigateWithExistingCard',
            'click #addPaymentInfo': 'editPaymentInfo'
        },

        render: function () {
            console.log('MemberPaymentInfoCOFView');

            this.$el.html(this.template(this.model.toJSON()));

            if (App.store.reviewOrderModel.get('fromReviewOrderPage')) {
                this.$('#editPaymentInfo').trigger('click');
                App.store.reviewOrderModel.set('fromReviewOrderPage', false);
            }

            return this;
        },

        editPaymentInfo: function (e) {
            e.preventDefault();

            var editMemberPaymentInfoView = new EditMemberPaymentInfoView();
            baseView.dom.$editMemberPaymentInfoMain.html(editMemberPaymentInfoView.render().$el).show();

            baseView.dom.$paymentInfoMain.hide();
        },

        navigateWithExistingCard: function () {
            console.log('-MemberPaymentInfoView Navigate with existing card');
            //var $target = $(e.target);
            if (window.user.EmailAddress.toLowerCase() === App.store.recipientInfoModel.get('email').toLowerCase()) {
                $('#emailError').show('slow');
                window.EQ.Helpers.goToTop();
            } else {
                $('#emailError').hide('slow');
                var url = '';
                var formValue = paymentInfoModel.toJSON();

                App.utils.Spinner(baseView.el);

                url = this.$('.next').data('url');

                App.store.transactionModel.set(_.extend({},
                    _.pick(formValue, 'creditCardNumber', 'cardType', 'securityCode', 'nameOnCard', 'address1', 'address2', 'city', 'state', 'zipCode', 'email', 'isBillingOptOut', 'cardLastFourDigits'), { 'expirationDate': jsDateToISO8601(formValue.expirationDate.toString()), 'shortExpirationDate': shortExpDate(formValue.expirationDate.toString()), 'isEmpty': false, 'hasAgreedToTerms': true }
                    ));

                App.router.navigate(url, { trigger: true });
            }
        }

    });

    var EditMemberPaymentInfoView = Backbone.View.extend({

        template: $('#tplEditMemberPaymentInfo').html(),

        events: {
            'click .cancel': 'cancelForm',
            'click .save': 'saveForm',
            'click .toggle-agreement': 'toggleAgreement' 
        },

        initialize: function () {
            this.dom = {};
        },

        render: function () {
            console.log('EditMemberPaymentInfoView');

            this.$el.html(this.template);
            this.dom.$editMemberPaymentInfo = this.$('#editMemberPaymentInfo');

            this.paymentInfoFormView = new PaymentInfoFormView({ model: paymentInfoModel });
            this.dom.$editMemberPaymentInfo.html(this.paymentInfoFormView.render().$el);

            return this;
        },

        toggleAgreement: function () {
            $('.eftPolicy').toggle();
            $('span.icon-dropdown').toggleClass('flip-icon');
        },

        cancelForm: function () {
            baseView.dom.$editMemberPaymentInfoMain.hide();
            baseView.dom.$paymentInfoMain.show();
            window.EQ.Helpers.goToTop();
        },

        saveForm: function () {
            var self = this;
            var formValue = this.paymentInfoFormView.paymentInfoForm.getValue();


            if (this.validateData()) {
                if (window.user.EmailAddress.toLowerCase() === App.store.recipientInfoModel.get('email').toLowerCase()) {
                    $('#emailErrorMember').show('slow');
                    window.EQ.Helpers.goToTop();
                } else {
                    $('#emailErrorMember').hide('slow');

                    updatedPaymentInfoModel.set(_.extend({},
                        _.pick(formValue, 'creditCardNumber', 'securityCode', 'nameOnCard', 'address1', 'address2', 'city', 'state', 'zipCode'), { 'isBillingOptOut': formValue.updateCardOnFile, 'hasAgreedToTerms': formValue.updateTermsCondition, 'expirationDate': jsDateToISO8601(formValue.expirationDate.toString()), 'shortExpirationDate': shortExpDate(formValue.expirationDate.toString()) }
                    ));

                    App.utils.Spinner(baseView.el);
                    self.success();
                }


            }
        },

        validateData: function () {
            var errors = this.paymentInfoFormView.paymentInfoForm.commit();

            if (errors.email && _.keys(errors).length === 1) {
                errors = {};
            }

            console.log('Step2 Form Errors', errors);

            if (_.isEmpty(errors)) {
                return true;
            }

            return false;
        },

        success: function () {
            $('.spinner').remove();
            //renderMemberPaymentInfo();

            var formValue = this.paymentInfoFormView.paymentInfoForm.getValue();

            paymentInfoModel.set(_.extend({},
                updatedPaymentInfoModel.toJSON(), {
                    'cardLastFourDigits': getLastFourDigits(formValue.creditCardNumber),
                    'cardType': getCardType(formValue.creditCardNumber),
                    'expirationDate': jsDateToISO8601(formValue.expirationDate.toString()),
                    'eftAuthorizationMsg': formValue.eftAuthorizationMsg,
                    'updateCardOnFile': formValue.updateCardOnFile
                }));

            var memberPaymentInfoView = new MemberPaymentInfoView({ model: paymentInfoModel });
            baseView.dom.$paymentInfo.html(memberPaymentInfoView.render().$el);

            //this.cancelForm();
            // Code to send stap3 after sucessfull submission of edit form starts here 
            var url = '';
            formValue = paymentInfoModel.toJSON();

            App.utils.Spinner(baseView.el);

            url = this.$('.save').data('url');

            App.store.transactionModel.set(_.extend({},
                _.pick(formValue, 'creditCardNumber', 'cardType', 'securityCode', 'nameOnCard', 'address1', 'address2', 'city', 'state', 'zipCode', 'email', 'isBillingOptOut', 'cardLastFourDigits'), { 'expirationDate': jsDateToISO8601(formValue.expirationDate.toString()), 'updateCardOnFile': formValue.updateCardOnFile, 'shortExpirationDate': shortExpDate(formValue.expirationDate.toString()), 'isEmpty': false, 'hasAgreedToTerms': true }
                ));

            App.router.navigate(url, { trigger: true });
            // Code to send stap3 after sucessfull submission of edit form ends here
        }
    });

    var AddMemberPaymentInfoView = Backbone.View.extend({

        template: _.template($('#tplAddMemberPaymentInfo').html()),

        events: {
            'click .add-member-payment-info-navigate': 'navigate',
            'click .save': 'saveForm',
            'click .toggle-agreement': 'toggleAgreement'
        },

        initialize: function () {
            this.dom = {};
        },

        render: function () {
            console.log('AddMemberPaymentInfoView');

            this.$el.html(this.template(this.model.toJSON()));
            this.dom.$addMemberPaymentInfo = this.$('#addMemberPaymentInfo');

            this.paymentInfoFormView = new PaymentInfoFormView( { model: this.model } );
            this.dom.$addMemberPaymentInfo.html(this.paymentInfoFormView.render().$el);

            return this;
        },

        toggleAgreement: function () {
            $('.eftPolicy').toggle();
            $('span.icon-dropdown').toggleClass('flip-icon');
        },

        saveForm: function () {
            var self = this;
            var formValue = this.paymentInfoFormView.paymentInfoForm.getValue();

            if (this.validateData()) {
                if (window.user.EmailAddress.toLowerCase() === App.store.recipientInfoModel.get('email').toLowerCase()) {
                    $('#emailError').show('slow');
                    window.EQ.Helpers.goToTop();
                } else {
                    $('#emailError').hide('slow');

                    updatedPaymentInfoModel.set(_.extend({},
                        _.pick(formValue, 'creditCardNumber', 'expirationDate', 'securityCode', 'nameOnCard', 'address1', 'address2', 'city', 'state', 'zipCode'),
                        {
                            'isBillingOptOut': formValue.updateCardOnFile,
                            'hasAgreedToTerms': formValue.updateTermsCondition,
                            'updateCardOnFile': formValue.updateCardOnFile,
                            'cardLastFourDigits': getLastFourDigits(formValue.creditCardNumber),
                            'cardType': getCardType(formValue.creditCardNumber),
                            'expirationDate': jsDateToISO8601(formValue.expirationDate.toString()),
                            'shortExpirationDate': shortExpDate(formValue.expirationDate.toString())
                        }
                    ));

                    App.utils.Spinner(baseView.el);
                    self.success();
                }


            }
        },

        validateData: function () {
            var errors = this.paymentInfoFormView.paymentInfoForm.commit();

            if (errors.email && _.keys(errors).length === 1) {
                errors = {};
            }

            console.log('Step2 Form Errors', errors);

            if (_.isEmpty(errors)) {
                return true;
            }

            return false;
        },

        success: function () {
            console.log('Model', updatedPaymentInfoModel.toJSON());
            App.store.transactionModel.set(_.extend({},
                updatedPaymentInfoModel.toJSON(), { 'isEmpty': false }
                ));
            App.router.navigate(this.$('.next').data('url'), { trigger: true });
        },

        navigate: function (e) {
            console.log('-AddMemberPaymentInfoView Navigate');
            var $target = $(e.target);

            if ($target.hasClass('prev')) {
                App.utils.Spinner(baseView.el);
                App.router.navigate(this.$('.prev').data('url'), { trigger: true });
            } else if ($target.hasClass('next')) {
                this.saveForm();
            }
        }
    });


    /* Guest Views */

    var GuestPaymentInfoView = Backbone.View.extend({

        template: $('#tplGuestPaymentInfo').html(),

        events: {
            'click #login': 'login',
            'click #togglePurchaseGuestForm': 'togglePurchaseGuestForm'
        },

        initialize: function () {
            this.dom = {};
        },

        render: function () {
            console.log('GuestPaymentInfoView');

            this.$el.html(this.template);
            this.dom.$editGuestPaymentInfo = this.$('#editGuestPaymentInfo');
            this.dom.$editGuestPaymentInfo.hide();

            if (!App.store.transactionModel.get('isEmpty')) {
                this.togglePurchaseGuestForm();
            }

            return this;
        },

        login: function () {
            $.cookie('LoginFromGiftCard', true);
            location.href = '/login?ReturnUrl=' + encodeURIComponent('/gift-card/purchase/step2');
        },

        togglePurchaseGuestForm: function () {
            if (this.dom.$editGuestPaymentInfo.is(':visible')) {
                this.dom.$editGuestPaymentInfo.hide();
            } else {
                var editGuestPaymentInfoView = new EditGuestPaymentInfoView();
                this.dom.$editGuestPaymentInfo.html(editGuestPaymentInfoView.render().$el).show();
            }
            $('span.icon-dropdown').toggleClass('flip-icon');
        }
    });

    var EditGuestPaymentInfoView = Backbone.View.extend({

        template: $('#tplEditGuestPaymentInfo').html(),

        events: {
            'click .edit-guest-payment-info-navigate': 'navigate'
        },

        initialize: function () {
            this.dom = {};
        },

        render: function () {
            console.log('EditGuestPaymentInfoView');

            this.$el.html(this.template);

            this.paymentInfoFormView = new PaymentInfoFormView({ model: paymentInfoModel });
            this.$el.prepend(this.paymentInfoFormView.render().$el);

            return this;
        },

        saveForm: function () {
            var formValue = this.paymentInfoFormView.paymentInfoForm.getValue();

            if (this.validateData()) {
                if (formValue.email.toLowerCase() === App.store.recipientInfoModel.get('email').toLowerCase()) {
                    $('#emailError').show('slow');
                    window.EQ.Helpers.goToTop();
                } else {
                    $('#emailError').hide('slow');
                    console.log('Model', updatedPaymentInfoModel.toJSON());
                    updatedPaymentInfoModel.set(_.extend({},
                        _.pick(formValue, 'creditCardNumber', 'securityCode', 'nameOnCard', 'address1', 'address2', 'city', 'state', 'zipCode'),
                        {
                            'email': formValue.email,
                            'cardLastFourDigits': getLastFourDigits(formValue.creditCardNumber),
                            'cardType': getCardType(formValue.creditCardNumber),
                            'shortExpirationDate': shortExpDate(formValue.expirationDate.toString()),
                            'expirationDate': jsDateToISO8601(formValue.expirationDate.toString()),
                            'hasAgreedToTerms': true
                        }
                    ));

                    App.store.transactionModel.set(_.extend({},
                        updatedPaymentInfoModel.toJSON(), { 'isEmpty': false }
                        ));
                    App.router.navigate(this.$('.next').data('url'), { trigger: true });
                }
            }
        },

        validateData: function () {
            var errors = this.paymentInfoFormView.paymentInfoForm.commit();

            console.log('Step2 Form Errors', errors);

            if (_.isEmpty(errors)) {
                return true;
            }

            return false;
        },

        navigate: function (e) {
            console.log('-EditGuestPaymentInfoView Navigate');
            var $target = $(e.target);

            if ($target.hasClass('prev')) {
                App.utils.Spinner(baseView.el);
                App.router.navigate(this.$('.prev').data('url'), { trigger: true });
            } else if ($target.hasClass('next')) {
                this.saveForm();
            }
        }
    });


    /* Base View */

    var BaseView = Backbone.View.extend({
        id: 'step2',

        template: $('#tplStep2').html(),

        initialize: function () {
            this.dom = {};
        },

        render: function () {
            console.log('BaseView');

            this.$el.html(this.template);
            this.dom.$paymentInfoMain = this.$('#paymentInfoMain');
            this.dom.$editMemberPaymentInfoMain = this.$('#editMemberPaymentInfoMain');
            this.dom.$paymentInfo = this.$('#paymentInfo');

            return this;
        }
    });

    var getLastFourDigits = function (str) {
        return str.substr(str.length - 4);
    };

    var getCardType = function (number) {
        var re = {
            visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
            mastercard: /^5[1-5][0-9]{14}$/,
            amex: /^3[47][0-9]{13}$/,
            diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
            discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
            jcb: /^(?:2131|1800|35\d{3})\d{11}$/
        };
        if (re.visa.test(number)) {
            return 'visa';
        } else if (re.mastercard.test(number)) {
            return 'mastercard';
        } else if (re.amex.test(number)) {
            return 'amex';
        } else if (re.diners.test(number)) {
            return 'diners';
        } else if (re.discover.test(number)) {
            return 'discover';
        } else if (re.jcb.test(number)) {
            return 'jcb';
        }
    };

    var jsDateToISO8601 = function (date) {
        function padzero(n) {
            return n < 10 ? '0' + n : n;
        }

        function pad2zeros(n) {
            if (n < 100) {
                n = '0' + n;
            }
            if (n < 10) {
                n = '0' + n;
            }
            return n;
        }

        function toISOString(d) {
            return d.getUTCFullYear() + '-' + padzero(d.getUTCMonth() + 1) + '-' + padzero(d.getUTCDate()) + 'T' + padzero(d.getUTCHours()) + ':' + padzero(d.getUTCMinutes()) + ':' + padzero(d.getUTCSeconds()) + '.' + pad2zeros(d.getUTCMilliseconds()) + 'Z';
        }
        return toISOString(new Date(date));
    };

    var shortExpDate = function (date) {

        function padzero(n) {
            return n < 10 ? '0' + n : n;
        }

        function newDate(d) {
            return padzero(d.getUTCMonth() + 1) + '/' + d.getUTCFullYear();
        }

        return newDate(new Date(date));
    };

    var renderLayout = function () {
        window.EQ.Helpers.goToTop();

        baseView = new BaseView();
        $('#app-main').html(baseView.render().$el);
    };

    var getMemberPaymentInfo = function () {
        paymentInfoModel.fetch()
            .then(renderMemberPaymentInfo)
            .fail(function (xhr) {
                console.log(xhr.responseText);
            });
    };

    var renderMemberPaymentInfo = function () {
        renderLayout();

        var memberPaymentInfoView = new MemberPaymentInfoView({ model: paymentInfoModel });
        baseView.dom.$paymentInfo.html(memberPaymentInfoView.render().$el);
    };

    var renderGuestPaymentInfo = function () {
        renderLayout();

        var guestPaymentInfoView = new GuestPaymentInfoView();
        baseView.dom.$paymentInfo.html(guestPaymentInfoView.render().$el);
    };

    // init layout
    Step2.init = function () {

        paymentInfoModel = new PaymentInfoModel();

        if (!_.isEmpty(window.user)) {
            // Logged In User
            isMember = true;
            getMemberPaymentInfo();
        } else {
            // Logged Out User
            isMember = false;
            renderGuestPaymentInfo();
        }
    };

});
