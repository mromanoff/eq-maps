define(function (require, exports, module) {
    'use strict';

    var Core            = require('core/app');
    var Marionette      = require('marionette');
    var BossView        = require('bossview');
    var HeadingView     = require('core/views/common/heading');
    var AccountFormView = require('core/views/forms/account');
    var SubmitView      = require('core/views/forms/submit');
    var NameView        = require('core/views/forms/static_fieldsets');

    /**
     * Account Homepage View
     *
     * This is the master view for the account homepage
     *
     * @name Page
     * @class PageView
     * @return view
     */
    var View = Marionette.BossView.extend({

        template: function() {
            return '<div class="heading-subregion"></div><form class="large black forms-spa"></form>';
        },

        subViews: {
            heading: HeadingView,
            name: function() {

                this.model.set({
                    fieldsets: [
                        { label: 'Member Name', content: this.model.get('name') }
                    ]
                });

                return new NameView({
                    model: this.model
                });
            },
            form: AccountFormView,
            submit: SubmitView
        },

        /**
         * subViewContainers
         *
         * Dump the subviews in the following areas of this view's template
         */
        subViewContainers: {
            heading:   '.heading-subregion',
            name:      'form',
            form:      'form',
            submit:    'form'
        },

        subViewEvents: {
            'submit submit': 'onSubmit'
        },

        /**
         * onRender
         *
         * onRender set the default phone number from one of the phone numbers
         * returned from the API
         */
        onRender: function() {

            var mobileNo = this.form.$el.find('[name="mobilePhone"]').val();
            var defaultPhoneType = 'Mobile';
            this.$phoneTypeDropdown = this.form.$el.find('[name="phoneTypes"]');
            var $phoneField = this.form.$el.find('[name="phone"]');

            // Set mobile as default value
            $phoneField.val(mobileNo);

            // Set mobile as default phone type and show its carrier
            this.$phoneTypeDropdown.val(defaultPhoneType);
            this.$phoneTypeDropdown.prev('.option').text(defaultPhoneType);
            this.$(".fancy-select").css("opacity", 1).show();

            // Change event on phone type
            this.$phoneTypeDropdown.on('change', function () {
                var $this = $(this);
                var $hiddenField = $('[name="' + $this.val().toLowerCase() + 'Phone' + '"]');

                $phoneField.val($hiddenField.val());
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
         * @name BillingPaymentView#onSubmit
         * @function
         * @public
         */
        onSubmit: function(e) {
            var errs, phoneErr, that = this;
            var phoneType = this.$phoneTypeDropdown.val().toLowerCase() + 'Phone';
            var phoneValue = $('[name="phone"]').val();

            errs = this.form.commit();
            phoneErr = this.phoneValidation();

            this.model.set(phoneType, phoneValue);

            if (phoneType == 'mobilePhone') {
                this.model.set('mobileCarrierName', $("[name='phoneCarrier']").val());
            }

            Core.store.set('account', this.model.attributes);

            if (_.isEmpty(errs) && _.isEmpty(phoneErr)) {

                this.form.model.save()
                    .success(function(model, response) {
                        Core.account.router.navigate('', {trigger: true});
                    })
                    .error(function(data) {
                        that.$el.find('.form-error').text(data.responseJSON.message);
                        console.log('error:', data);
                    });
            } else {
                console.warn('Form validation error. Aborting form submission...', errs)
            }

        },

        phoneValidation: function () {
           var  isPhoneNumber,
                        $phoneNumber = $("[name='phone']"),
                        $errorField = $phoneNumber.parent().next(),
                  $errorTitle = $phoneNumber.parent().parent().parent().parent().prev(),
                        err = {};

            if ($.trim($("[name='phone']").val()) == "") {
                err.message = "Required";
                $phoneNumber.addClass("error").css("color", "black");
                $errorTitle.addClass("error");
                $errorField.html(err.message);
                $errorField.addClass("error");
                return err;
            }

            if (window.user.SourceSystem == 1 || window.user.SourceSystem == 5) {
                var usPhoneNumberValidation = /^([01]?[- .]?(\([2-9]\d{2}\)|[2-9]\d{2})[- .]?\d{3}[- .]?\d{4})+$/;
                isPhoneNumber = usPhoneNumberValidation.test($("[name='phone']").val());
            } else {
                var ukPhoneNumberValidation = /^(\(?(?:(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?\(?(?:0\)?[\s-]?\(?)?|0)(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}|\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4}|\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3})|\d{5}\)?[\s-]?\d{4,5}|8(?:00[\s-]?11[\s-]?11|45[\s-]?46[\s-]?4\d))(?:(?:[\s-]?(?:x|ext\.?\s?|\#)\d+)?))+$/;
                isPhoneNumber = ukPhoneNumberValidation.test($("[name='phone']").val());
            }

            if (!isPhoneNumber) {
                err.message = "Invalid phone number";

                $phoneNumber.addClass("error").css("color", "black");
                $errorTitle.addClass("error");
                $errorField.html(err.message);
                $errorField.addClass("error");
                return err;
            } else {
                $phoneNumber.removeClass("error");
                $errorTitle.removeClass("error");
                $errorField.html("");
                $errorField.removeClass("error");
                return;
            }
        },

        submitForm: function(that, opts) {
            var errs = that.form.commit();

            Core.store.set(opts.store, that.model.attributes);

            if (_.isEmpty(errs)) {
                that.form.model.save()
                    .success(function(model, response) {
                        if(opts.next) {
                            Core.account.router.navigate(opts.next, {trigger: true});
                        }
                        opts.success();
                    })
                    .error(function(data) {
                        that.$el.find('.form-error').text(data.responseJSON.message);
                        opts.error();
                        console.log('error:', data);
                    });
            } else {
                console.warn('Form validation error. Aborting form submission...', errs)
            }
        },

        onSubmitv2: function() {

            function submitForm(next, opts) {};

            submitForm(this, {
                next: 'confirmation',
                store: Core.store.billing, // optional
                success: function() {}, // optional
                error: function() {} // optional
            });
        }

    });

    module.exports = View;
});