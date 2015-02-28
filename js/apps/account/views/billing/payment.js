define(function (require, exports, module) {
    'use strict';

    var Core              = require('core/app');
    var Marionette        = require('marionette');
    var BossView          = require('bossview');
    var HeadingView       = require('core/views/common/heading');
    var BillingForm       = require('core/views/forms/billing');
    var SubmitView        = require('core/views/forms/submit');

    /**
     * Billing Payment View class
     *
     * This is the master view for the pay a balance page
     *
     * @name BillingPayment
     * @class BillingPaymentView
     * @return view
     */
    var BillingPaymentView = Marionette.BossView.extend({

        template: function() {
            return '<div class="heading-subregion"></div><form class="large black forms-spa"></form>'
        },

        subViews: {

            heading: function(){
                return new HeadingView({  model: this.model });
            },

            form: function() {

                // todo: move to a shareable object??
                BillingForm.prototype.schema.hasAgreedToTerms = {
                    title: 'I have read and understand the <a class="toggle-agreement">eft authorization policy</a>. <span class="icon-dropdown"></span>',
                    copy: this.model.get('eftAuthorizationMsg'),
                    type: 'Agreement',
                    validators: ['required']
                };

                return new BillingForm({model: this.model});
            },

            submit: SubmitView
        },

        /**
         * subViewContainers
         *
         * Dump the subviews in the following areas of this view's template
         */
        subViewContainers: {
            heading:   '.heading-subregion',
            form:      'form',
            submit:    'form'
        },

        subViewEvents: {
            'submit submit': 'onSubmit'
        },

        /**
         * Fields
         *
         * These are the fields ESB expects for the billing/add. We will extract, right before submitting
         * any attribute from the model that is not in this list or ESB will complaint
         *
         * @public
         */
        fields: ['currentBalance', 'creditCardNumber', 'cardType', 'expirationDate', 'securityCode', 'nameOnCard', 'address1', 'address2', 'city', 'state', 'country', 'zipCode', 'isBillingOptOut'],

        setAutoPayCheckbox: function() {
            var that = this;

            // todo: fixme wait till the elem is in dom
            window.setTimeout(function(){
                // set autopay to the opposite of isBillingOptOut
                var autopay = that.model.get('isBillingOptOut') ? false : true;

                if (autopay){
                    $('#billing-autopay').prop('checked', true)
                    $('#billing-autopay').closest('.checkbox').addClass('checked');
                }
            }, 800);
        },

        onRender: function() {
            this.setAutoPayCheckbox();
        },

        /**
         * onSubmit
         *
         * There is a click event on the .submit button which we listen to.
         * If clicked, we first run the form.commit() which does the form
         * validation. If no object is returned in the errors object, we
         * save to the model and submit the form via ajax. If successfull,
         * go to the confirmation page. If it fails, show error to user.
         *
         * @name BillingPaymentView#onSubmit
         * @function
         * @public
         */
        onSubmit: function(e) {
            var errs, isBillingOptOut, that = this;
            e.currentTarget.disabled = true;
            // set isBillingOptOut to the opposite of autopay
            isBillingOptOut = $('#billing-autopay').prop('checked') ? false : true;

            // do not do this if possible
            this.form.model.unset('title');
            this.form.model.unset('accountType');
            this.form.model.unset('cardLastFourDigits');
            this.form.model.unset('company');
            this.form.model.unset('errorMessages');
            this.form.model.unset('isCardExpired');

            // add isBillingOptOut before submitting
            this.form.model.set('isBillingOptOut', isBillingOptOut);

            errs = this.form.commit();

            Core.store.set('billing.info', this.model.attributes);

            if (_.isEmpty(errs)) {
                this.form.model.save()
                    .success(function(model, response) {
                        Core.store.billing.info.confirmationNumber = response.confirmationNumber;
                        Core.router.navigate('billing/confirmation', {trigger: true});
                    })
                    .error(function (data) {
                        e.currentTarget.disabled = false;
                        that.$el.find('.form-error').text(data.responseJSON.message);
                        console.log('error:', data);
                    });
            } else {
                e.currentTarget.disabled = false;
                console.warn('Form validation error. Aborting form submission...', errs)
            }
        }

    });

    module.exports = BillingPaymentView;
});