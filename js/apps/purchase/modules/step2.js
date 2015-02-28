define(function (require, exports, module) {
    'use strict';

    // get purchase App
    var App = require('app');
    var Analytics = require('analytics');
    var Messages = require('messages');
    var Billing = require('./forms/billing');

    require('modal'); // #modal
    require('jquery.cookie');

    var transaction = App.store.transaction; // Alias the model for easier identification.


    // #modal
    var Modal = Backbone.Modal.extend({
        events: {
            'click .close-modal': 'closeModal',
            'click .is-auto-renew-on': 'setAutoRenewOn'
        },
        setAutoRenewOn: function (e) {
            e.preventDefault();
            App.trigger('update:renewal:on');
            $(this.cancelEl).click();
        },
        closeModal: function (e) {
            e.preventDefault();
            App.trigger('update:renewal:off');
            $.cookie('renewalMsgOff', true, {expires: 90});
            $(this.cancelEl).click();
        },
        template: _.template('<div class="bbm-centered-text"><div class="bbm-modal__topbar"><h3 class="bbm-modal__title">Would you like to purchase sessions automatically in the future?</h3></div><div class="bbm-modal__section"><p>When your sessions run out, we will automatically add you the same pack, so you don\'t have to think about it again</p><p><a target="_blank" href="/personal-training/renew-policy">view auto purchase policy</a></p><p><a class="is-auto-renew-on button box black small">YES, automatically purchase next time</a></p><p><a class="close-modal">No, thanks</a></p></div><div class="bbm-modal__bottombar hidden"><a class="bbm-button">Close</a></div></div>'),
        cancelEl: '.bbm-button'
    });

    var submitOmnitureTags = function () {
        var omniture = new Analytics.Model.Omniture();
        var selectedPackage = transaction.getSelectedPackage();
        var pageVars = {
            step: 'billing',
            productTier: selectedPackage.tier,
            productPack: selectedPackage.quantity,
            productDuration: selectedPackage.duration,
            productCost: selectedPackage.priceBeforeTax
        };
        omniture.set(pageVars);
    };

    // Alias the module for easier identification.
    var Step2 = module.exports;

    Step2.Model = {};

    // Model.
    Step2.Model.BillingInfo = Backbone.Model.extend({
        defaults: {
            nameOnCard: null,
            address1: null,
            address2: null,
            city: null,
            state: null,
            zipCode: null,
            email: null,
            phone: null,
            cardType: null,
            hasCardOnFile: null,
            isCardExpired: null,
            cardExpiredOn: null,
            cardLastFourDigits: null,
            cardLastFourDigitsNew: null,
            isAutoRenewOn: null  // // #modal
        },
        url: App.envConfig.billingInfoUrl,

        initialize: function () {
            this.on('change', this.updateTransaction);
            this.on('change', this.populateFormFields);
        },

        updateTransaction: function () {
            transaction.set(this.toJSON());
        },

        populateFormFields: function () {
            billingForm.setValue(this.toJSON());
        }
    });

    var billingForm = new Billing.Form().render();

    // trigger all these events to update View
    billingForm.on('state:change', function (form, editor) {
        App.trigger('update:option:state', editor);
    });

    billingForm.on('expirationDate:change', function (form, editor) {
        App.trigger('update:option:expirationDate', editor);
    });

    billingForm.on('updateCardOnFile:change', function (form, editor) {
        App.trigger('update:checkbox:cardOnFile', editor);
    });

    // Default View.
    Step2.Views = {};

    Step2.Views.Base = Backbone.View.extend({
        manage: true,
        className: 'step2',
        template: 'step2/index',
        events: {
            'click .js-card-on-file': 'cardOnFile',
            'click .js-new-card': 'newCard',
            'click .navigate': 'navigate',
            'keypress form': 'onEnterKey'
        },

        initialize: function () {
            this.listenTo(App, 'update:option:state', this.updateSelectEditor);
            this.listenTo(App, 'update:option:expirationDate', this.updateDateEditor);
            this.listenTo(App, 'update:checkbox:cardOnFile', this.updateCheckBoxEditor);
            this.listenTo(App, 'update:renewal:on', this.enableAutoRenewal); // #modal
            this.listenTo(App, 'update:renewal:off', this.disableAutoRenewal); // #modal
        },

        disableAutoRenewal: function () {
            this.showModal = false;

            this.model.set('isAutoRenewOn', false);
            transaction.set('isAutoRenewOn', false);

            if (this.modalView.e) {
                $(this.modalView.e.target).click();
            }
        },

        // #modal
        enableAutoRenewal: function () {
            if ($('#billing-updateCardOnFile').length > 0) {
                $('#billing-updateCardOnFile').click();
            }

            this.model.set('isAutoRenewOn', true);
            transaction.set('isAutoRenewOn', true);

            // the way we determine the next step is not great, basically
            // we check the value of the data-url of the button clicked
            // instead of setting some value of the current step in the
            // wizard. Therefore, i have no choice but to store the event in
            // an attribute and trigger that element here after modalShow is false
            if (this.modalView.e) {
                $(this.modalView.e.target).click();
            }
            //this.navigate();
        },

        updateSelectEditor: function (editor) {
            // update option span tag with selected value
            // unable next select drop down
            editor.$el.prev('.option').text(editor.getValue());
        },

        updateDateEditor: function (editor) {
            // update option span tag with selected value
            // unable next select drop down
            editor.$month.prev('.option').text($('option:selected', editor.$month).text());
            editor.$year.prev('.option').text($('option:selected', editor.$year).text());
        },

        updateCheckBoxEditor: function (editor) {
            editor.$el.closest('.checkbox').toggleClass('checked');
        },

        onEnterKey: function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                this.navigate(e);
            }
        },

        beforeRender: function () {
            if (!_.isNull(transaction.get('errors'))) {
                var err = transaction.get('errors');
                this.insertView('#warning', new Messages.Views.Warning({
                    model: {
                        text: err.text,
                        type: 'alert-error'
                    }
                }));
            }
        },

        afterRender: function () {
            if (!_.isNull(transaction.get('errors'))) {
                this.$('#warning').show();
                this.$('#payment-form').show();
                this.$('.js-new-card').trigger('click');
            }

            // if no card on file. show form and hide 'new card' button
            // if no card is expired. show form and hide 'new card' button
            // if user clicked use 'new card' and go to step 3, then click back button from step 3. show form and hide 'new card' button
            if (_.isEqual(transaction.get('hasCardOnFile'), false) ||
                _.isEqual(transaction.get('isCardExpired'), true) ||
                _.isEqual(transaction.get('useCardOnFile'), false)) {
                this.$('#payment-form').show();
                this.$('.js-new-card').trigger('click').hide();
            }

            this.modalView = new Modal();
        },

        serialize: function () {
            return transaction.toJSON();
        },

        showModal: true,

        navigate: function (e) {
            // create spinner
            //App.utils.Spinner();
            //App.utils.Spinner().spin(this.el);

            //var that = this;
            //var $isSaveCheckboxChecked = $('#billing-updateCardOnFile').prop('checked');
            //var isBillingFormOn = ($('.forms-spa').length > 0) ? true : false;  // ghetto way of knowing if we are on step2.2 with billing form
            //
            //// #modal
            //if (isBillingFormOn && !$.cookie('renewalMsgOff') && this.showModal && !$isSaveCheckboxChecked && this.model.get('isAutoRenewOn') === false) {
            //    console.warn('showing navigate modal');
            //    //var modalView = new Modal();
            //    that.modalView.e = e;
            //
            //    $('html, body').animate({scrollTop: 0}, 'slow');
            //
            //    $('#app-main').append(this.modalView.render().el);
            //
            //    this.showModal = false;
            //
            //    return;
            //}

            // App.spinner.spin(this.el);
            // $('<div class="block-view">').appendTo(this.el);

            //validate data if use new card else use card on file (no validation needed)
            if (this.validateData()) {
                App.router.navigate(this.$('.next').data('url'), {trigger: true});
            }

            else if (transaction.get('useCardOnFile')) {
                App.router.navigate($(e.currentTarget).data('url'), {trigger: true});
            }
            else {
                return false;
            }
        },

        // @codereview: this should be externalized into a helper library for reusability
        jsDateToISO8601: function (date) {
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
        },

        validateData: function () {
            var errors = billingForm.commit();

            if (_.isEmpty(errors)) {
                // update last 4 digit and 'CC' for new card (we don't know what card type at this moment)
                transaction.set(_.extend(
                    billingForm.getValue(),
                    {
                        cardLastFourDigitsNew: billingForm.getValue().creditCardNumber.replace(/.(?=.{4})/g, ''),
                        cardType: 'CC',
                        expirationDate: this.jsDateToISO8601(billingForm.getValue().expirationDate.toString())
                    }
                ));
                return true;
            }
            //// stop spinner
            //App.utils.Spinner().stop();
            //// App.spinner.stop();
            //// this.$('.block-view').remove();
            return false;
        },

        // 1 case. if user clicked on use card on file. navigate to step 3
        cardOnFile: function (e) {
            e.preventDefault();
            var that = this;

            // #modal
            if (this.showModal && !$.cookie('renewalMsgOff') && this.model.get('isAutoRenewOn') === false) {
                window.setTimeout(function () {
                    that.modalView.e = e;

                    $('#app-main').append(that.modalView.render().el);
                }, 600);

                this.showModal = false;

            } else {
                transaction.set({
                    useCardOnFile: true,
                    validatePassword: true
                });
                this.$('#payment-form').hide();
                this.$('#warning').hide();
            }
        },

        // 2 case. if user clicked on use new card
        // validate user input before going to next step
        newCard: function () {
            //var that = this;

            //if (this.showModal && !$.cookie('renewalMsgOff') && this.model.get('isAutoRenewOn') === false) {
            //    window.setTimeout(function () {
            //        that.modalView.e = e;
            //        $('#app-main').append(that.modalView.render().el);
            //    }, 600);
            //    this.showModal = false;
            //}
            // create form
            this.$('#payment-form').html(billingForm.el);

            // #modal
           // window.setTimeout(function () {
               // $('#billing-updateCardOnFile').click(); // trigger checkbox by default
                transaction.set({useCardOnFile: false});
           // }, 600);

            // update .option container with selected option in dropdown.
            _.each($('select', $('#payment-form')), function (el) {
                var value = $('option', $(el)).filter(':selected').text();
                $(el).prev('.option').text(value);
            });

            transaction.set({validatePassword: false});

            window.tr = transaction.toJSON();

            this.$('.payment-method').hide();
            this.$('.payment-new-card').slideDown(400);
            this.$('.error').removeClass('error');
            this.$('[data-error]').empty();
            this.$('.next').removeAttr('disabled');
        }
    });

    var billingInfo = new Step2.Model.BillingInfo();

    var renderLayout = function () {
        // Use the main layout.
        App.useLayout('layouts/main').setViews({
            // Attach the root content View to the layout.
            '.pt-purchase': new Step2.Views.Base({
                model: billingInfo
            })
        }).render();
        if (transaction.previousAttributes.errors !== undefined) {
            billingForm.fields.creditCardNumber.setError(transaction.previousAttributes.errors);
            transaction.previousAttributes.errors = undefined;
        }
    };


    Step2.init = function () {
        submitOmnitureTags();

        // if packageId undefined or null redirect to step1
        if (_.isEmpty(transaction.get('selectedPackage').packageId)) {
            App.router.navigate('#step1', { trigger: true });
        }

        // check if billing info already exist in transaction model
        if (_.isNull(transaction.get('nameOnCard'))) {
            billingInfo.fetch().then(
                function () {
                    renderLayout();
                },
                function (err) {
                    if (_.isEqual(App.envConfig.env, 'prod')) {
                        var omniture = new Analytics.Model.Omniture();
                        omniture.set(_.extend(Step2.omniturePageVars, {
                            eVar39: 'PTP API_URL: ' + App.envConfig.billingInfoUrl,
                            eVar40: 'STACK TRACE:  error'
                        }));
                        window.location.href = '/500';
                    }
                    else {
                        App.useLayout('layouts/main').setViews({
                            '.pt-purchase': new Messages.Views.Warning({
                                model: {
                                    type: 'alert-error',
                                    code: err.status,
                                    text: err.responseText
                                }
                            })
                        }).render();
                    }
                }
            );
        } else {
            renderLayout();
        }
    };
});
