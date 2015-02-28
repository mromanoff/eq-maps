define(function (require, exports, module) {
    /* EQ */
    'use strict';

    var Core         = require('core/app');
    var Marionette   = require('marionette');
    var BossView     = require('bossview');
    var HeadingView  = require('core/views/common/heading');
    var FormView     = require('core/views/forms/password');
    var SubmitView   = require('core/views/forms/submit');

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
            form: FormView,
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
        * onRender
        *
        * onRender set the default phone number from one of the phone numbers
        * returned from the API
        */
        onRender: function () {
            if (userProfileJson.IsSocialRegistration !== null && userProfileJson.IsSocialRegistration === true) {
                this.form.$el.find('[name="currentPassword"]').closest("div .fieldset-row").hide();
             this.form.$el.find('#fbRegistrantMsg').css('display','block');              
            }
        },
        /**
         * onSubmit
         *
         * There is a click event on the .submit button which we listen to.
         * If clicked, we first run the form.commit() which does the form
         * validation. If no object is returned in the errors object, we
         * save to the model and submit the form via ajax. If successful,
         * go to the confirmation page. If it fails, show error to user.
         *
         * @name BillingPaymentView#onSubmit
         * @function
         * @public
         */
        onSubmit: function(e) {
            var errs,errMessage,currentPwdError, that = this;

            errs = this.form.commit();
            currentPwdError = this.currentPasswordValidation();
            if (_.isEmpty(errs)) {
                this.form.model.save()
                    .success(function (model, response) {
                        EQ.Helpers.refreshUserCacheData();
                        Core.account.router.navigate('password/confirmation', {trigger: true});
                    })
                    .error(function (data) {
                        errMessage = data.responseJSON.message;
                        if (errMessage.indexOf("password must match ^.*(?=.*") >= 0)
                            errMessage = 'Invalid Password format, Password should be of 6-20 characters including at least one letter and one number.';

                        that.$el.find('.form-error').text(errMessage);
                        console.log('error:', data);
                    });
            } else {
                that.$el.find('.form-error').text("");
                console.warn('Form validation error. Aborting form submission...', errs)
            }

        },
        currentPasswordValidation: function() {
            var isPhoneNumber,
                $currentPassword = $("[name='currentPassword']"),
                  $errorField = $currentPassword.parent().next(),
                  $errorTitle = $currentPassword.parent().parent().prev(),
               err = {};
            if ($.trim($currentPassword.val()) == "") {
                err.message = "Required";
                $currentPassword.addClass("error").css("color", "black");
                $errorTitle.addClass("error");
                $errorField.html(err.message);
                $errorField.addClass("error");
                return err;
            } else {
                $currentPassword.removeClass("error");
                $errorTitle.removeClass("error");
                $errorField.html("");
                $errorField.removeClass("error");
                return;
            }
        }

    });

    module.exports = View;
});