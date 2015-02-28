define(function (require, exports, module) {
    'use strict';

    var Marionette        = require('marionette');
    var BossView          = require('bossview');
    var HeadingView       = require('core/views/common/heading');
    var BillingForm       = require('core/views/forms/billing');
    var SubmitView        = require('core/views/forms/submit');
    var Core              = require('core/app');

    /**
     * Billing Edit View class
     *
     * This is the master view for the billing page & which then calls other views
     * like the form view
     *
     * @name BillingEdit
     * @class BillingEditView
     * @return view
     */
    var BillingEditView = Marionette.BossView.extend({

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
                    title: 'I have read and understand the <a class="toggle-agreement">eft authorization policy.</a><span class="icon-dropdown"></span>',
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
            empty:     '.heading-subregion',
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
        fields: ['creditCardNumber', 'cardType', 'expirationDate', 'securityCode', 'nameOnCard', 'address1', 'address2', 'city', 'state', 'country', 'zipCode', 'isBillingOptOut'],

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

        /**
         * onRender
         *
         * For some reason the model inside the form view is coming up undefined; so
         * the solution has been to define a that model here and instantiate it to
         * this.form.model as it expects it. Seems like a bug in Backbone-forms...
         *
         * @name BillingCardView#onRender
         * @function
         * @public
         */
        onRender: function() {
            var that = this;

            // ESB doesn't like when you send key/values it is not expecting
            var autofilled = _.extend({}, _.pick(this.model.toJSON(), this.fields));

            if(this.model.get('update')) {

                var FormModel  = Backbone.Model.extend({
                    url: this.model.url
                });

                this.form.model = new FormModel(autofilled);
            }

            this.setAutoPayCheckbox();

            Core.vent.on('billing:form:empty', function() {
                that.model.clear().set(that.model.defaults);
                that.form.setValue(that.model.defaults);
            });
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
         * @name BillingEditView#onSubmit
         * @function
         * @public
         */
        onSubmit: function(e) {
            var errs, isBillingOptOut, paymentType, that = this;

            // set isBillingOptOut to the opposite of autopay
            isBillingOptOut = $('#billing-autopay').prop('checked') ? false : true;

            this.form.model.unset('title');
            this.form.model.unset('accountType');
            this.form.model.unset('cardLastFourDigits');
            this.form.model.unset('company');
            this.form.model.unset('errorMessages');
            this.form.model.unset('isCardExpired');

            // add isBillingOptOut before submitting
            this.form.model.set('isBillingOptOut', isBillingOptOut);

            errs = this.form.commit();

            // we need to store this to later tell the user cardType in confirmation page
            this.model.set('creditCardNumber', this.form.model.attributes.creditCardNumber);

            Core.store.set('billing.info', this.model.attributes);

            if (_.isEmpty(errs)) {
                this.form.model.save()
                    .success(function(model, response) {
                        // if user is updating card cause it expire, call it update.
                        // If first time adding/paying, then 'new'
                        if (Core.store.get('billing') && Core.store.get('billing.info')) {
                            paymentType = Core.store.get('billing.info.isCardExpired') ? 'new' : 'update';
                            
                            Core.store.set('billing', { paymentType: paymentType });
                            Core.account.router.navigate('', {trigger: true});
                        }
                    })
                    .error(function(data) {
                        that.$el.find('.form-error').text(data.responseJSON.message);
                        console.log('error:', data);
                    });
            } else {
                console.warn('Form validation error. Aborting form submission...', errs)
            }
        }

    });

    module.exports = BillingEditView;
});