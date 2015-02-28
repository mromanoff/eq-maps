define(function (require, exports, module) {
    'use strict';

    /* global EQ */
    var App = require('app');
    var Analytics = require('analytics');
    var Order = require('order');
    var Billing = require('billing');
    var Repurchase = require('./repurchase');
    var Messages = require('messages');
    var Contact = require('./forms/contact');
    var ValidatePassword = require('./forms/validate_password');

    var isFB = EQ.Helpers.readCookie('IsFBLogin');
    isFB = (isFB !== null && isFB !== '' && isFB === 'true');

    var transaction = App.store.transaction; // Alias the model for easier identification.
    var submitOmnitureTags = function () {
        var omniture = new Analytics.Model.Omniture();
        var selectedPackage = transaction.getSelectedPackage();
        var pageVars = {
            step: 'review',
            productTier: selectedPackage.tier,
            productPack: selectedPackage.quantity,
            productDuration: selectedPackage.duration,
            productCost: selectedPackage.priceBeforeTax
        };
        omniture.set(pageVars);
    };

    var Step3 = module.exports; // Alias the module for easier identification.

    Step3.Model = {};
    Step3.Model.MakePurchase = Backbone.Model.extend();

    var contactForm = new Contact.Form().render();
    var validatePasswordForm = new ValidatePassword.Form().render();

    // Step3 Views
    Step3.Views = {};

    Step3.Views.Base = Backbone.View.extend({
        manage: true,
        model: transaction,
        className: 'step3',
        template: 'step3/index',

        events: {
            'click .navigate': 'navigate',
            'keypress form': 'onEnterKey',
            'click .validatePassword': 'validatePassword'
        },

        serialize: function () {
            return this.model.toJSON();
        },

        onEnterKey: function (e) {
            if (e.keyCode === 13) {
                // don't let user submit incomplete form by hitting enter key
                e.preventDefault();
                //this.navigate(e);
            }
        },

        navigate: function (e) {
            // create spinner
            App.utils.Spinner(this.el);

            $('#warning').slideUp(200);

            if (_.isUndefined($(e.currentTarget).data('url'))) {
                this.submitData();
            } else {
                App.router.navigate($(e.currentTarget).data('url'), {trigger: true});
            }
        },

        afterRender: function () {
            contactForm.setValue(this.model.toJSON());
            this.$('#contact').html(contactForm.el);

            // render password block
            if (this.model.get('validatePassword') && !isFB) {
                this.$('#password').html(validatePasswordForm.el);
            }
            else {
                if (isFB) {
                    this.$('.reset-password').hide();
                }
                // enable next button
                this.$('.next').removeAttr('disabled');
            }
        },

        validateData: function () {
            var errors = {};

            // validate password
            if (this.model.get('validatePassword') && !isFB) {
                _.extend(errors, validatePasswordForm.commit());
            }

            _.extend(errors, contactForm.commit());

            if (_.isEmpty(errors)) {
                this.model.set(_.extend(
                    contactForm.getValue(), validatePasswordForm.getValue()
                ));
                return true;
            }
            return false;
        },

        submitData: function () {
            var self = this;
            var selectedPackage = transaction.getSelectedPackage();

            // create spinner
            App.utils.Spinner(this.el);

            this.$('.next').attr('disabled', 'disabled');

            if (this.validateData()) {
                var makePurchase = new Step3.Model.MakePurchase();

                if (this.model.get('useCardOnFile')) {
                    makePurchase.url = App.envConfig.purchaseWithCardOnFileUrl;
                    makePurchase.set(_.extend({},
                        _.pick(this.model.toJSON(), 'password', 'phone', 'email', 'autoRenewDuration', 'autoRenewPackSize'),
                        _.pick(selectedPackage, 'sku', 'priceBeforeTax', 'priceAfterTax'),
                        {'skipPasswordValidation': isFB}
                    ));
                }
                else {
                    makePurchase.url = App.envConfig.purchaseUrl;
                    makePurchase.set(_.extend({},
                        _.pick(this.model.toJSON(),
                            'updateCardOnFile', 'phone', 'email',
                            'nameOnCard', 'creditCardNumber', 'securityCode', 'expirationDate',
                            'address1', 'address2', 'city', 'state', 'zipCode'
                        ),
                        _.pick(selectedPackage, 'sku', 'priceBeforeTax', 'priceAfterTax')
                    ));
                }

                makePurchase.save()
                    .success(function (model) {
                        self.success(model);
                    })
                    .error(function (err) {
                        self.error(err);
                    });
            }
            else {
                //in case if validation false then remove spinner and enable next button
                self.$('.spinner').remove();
                this.$('.next').removeAttr('disabled');
            }
        },

        validatePassword: function () {
            var self = this;

            if (this.validateData()) {
                var validatePassword = new ValidatePassword.Model();

                // create spinner
                App.utils.Spinner(this.el);

                validatePassword.set(_.pick(this.model.toJSON(), 'password'));
                validatePassword.save()
                    .success(function (response) {

                        self.$('.spinner').remove();

                        if (_.isEqual(response.status, true)) {
                            self.$('.next').removeAttr('disabled');
                            self.$('#warning').hide();
                            self.$('#password').slideUp(200);
                            self.$('.validatePassword').attr('disabled', 'disabled');
                        }

                        else {

                            var errorView = new Messages.Views.Warning({
                                model: {
                                    type: 'error',
                                    code: null,
                                    text: 'Invalid Password.'
                                }
                            });


                            self.$('.spinner').remove();
                            self.setView('#warning', errorView).render();
                            self.$('[data-fields="password"]').addClass('error');
                            self.$('#warning').show();

                        }
                    })
                    .error(function (err) {
                        self.$('.next').attr('disabled', 'disabled');
                        self.error(err);
                    });
            }
        },

        success: function (model) {
            transaction.set(model);
            App.router.navigate('#confirmation', {trigger: true});
        },

        error: function (err) {
            // filter errors
            // take care all 400 errors we want to show to user
            if (err.status === 400) {
                var errors = $.parseJSON(err.responseText);
                _.each(errors, function (error) {
                    if (error.code === 'EM001' || error.code === 'EM004') {
                        // this a password message error  OR Price change Error message
                        // stay on this page and print error message inline and highlight the field
                        if (error.code === 'EM001') {
                            this.$('.field-password').addClass('error');
                        }
                        this.setView('#warning', new Messages.Views.Warning({
                            model: {
                                text: error.message,
                                type: 'error'
                            }
                        })).render();

                        $('#warning').slideDown(200);
                        App.spinner.stop();
                        this.$('.block-view').remove();
                    }
                    else if (error.code === 'EM002') {
                        // Transaction tender is required
                        // print error message
                        App.useLayout('layouts/main').setViews({
                            '.pt-purchase': new Messages.Views.Warning({
                                model: {
                                    type: 'error',
                                    code: error.code,
                                    text: error.message
                                }
                            })
                        }).render();

                        $('#warning').slideDown(200);
                        App.spinner.stop();
                        this.$('.block-view').remove();
                    }
                    else if (error.code === 'EM003') {
                        // this is CC card error message
                        // go to step 2 and print error message inline
                        transaction.previousAttributes.errors = 'Cannot process credit card.';
                        App.router.navigate('#step2', {trigger: true});
                    }
                    else {
                        this.allOtherErrors(err);
                    }
                }, this);
            }
            else {
                this.allOtherErrors(err);
            }
        },

        allOtherErrors: function (err) {
            // this for all other errors
            if (_.isEqual(App.envConfig.env, 'prod')) {
                window.location.href = '/500';
            }
            else {
                App.useLayout('layouts/main').setViews({
                    '.pt-purchase': new Messages.Views.Warning({
                        model: {
                            type: 'error',
                            code: err.status,
                            text: err.responseText
                        }
                    })
                }).render();
            }
        }
    });


    var RepurchaseModel = Backbone.Model.extend({
        defaults: {
            label: null,
            val: null
        }
    });

    var RepurchaseCollection = Backbone.Collection.extend({
        model: RepurchaseModel,
        url:  function () {
            return App.envConfig.packsizeUrl + '/' + transaction.get('selectedDuration') + '/' + transaction.get('selectedTier');
        }
    });

    var repurchase = new RepurchaseCollection();

    var renderLayout = function () {
        // Use the main layout.
        App.useLayout('layouts/main').setViews({
            // Attach the root content View to the layout.
            '.pt-purchase': new Step3.Views.Base({
                views: {
                    '#order': new Order.View(),
                    '#billing': new Billing.View(),
                    '#repurchase': new Repurchase.Views.Base({
                        collection: repurchase
                    })
                }
            })
        }).render();
    };

    Step3.init = function () {
        submitOmnitureTags();

        // if packageId undefined or null redirect to step1
        if (_.isEmpty(transaction.get('selectedPackage').packageId)) {
            App.router.navigate('#step1', {trigger: true});
        }

        repurchase.fetch().then(function () {
            renderLayout();
        });
    };
});