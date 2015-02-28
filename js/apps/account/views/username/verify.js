/* global Backbone */

define(function (require, exports, module) {
    'use strict';

    var Core             = require('core/app');
    var Marionette       = require('marionette');
    var BossView         = require('bossview');
    var HeadingView      = require('core/views/common/heading');
    var CopyView         = require('core/views/common/copy');
    var PasswordFormView = require('core/views/forms/password_enter');
    var SubmitView       = require('core/views/forms/submit');
    var EmailView        = require('core/views/forms/static_fieldsets');

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
            copy: CopyView,
            form: function() {
                return new PasswordFormView({
                    model: this.model
                });
            },
            submit: SubmitView
        },

        onRender: function() {
            // add the email address used by the hidden input field 'email'
            this.form.setValue({
                email: this.model.get('email')
            });
        },

        /**
         * subViewContainers
         *
         * Dump the subviews in the following areas of this view's template
         */
        subViewContainers: {
            heading:   '.heading-subregion',
            copy:     'form',
            form:      'form',
            submit:    'form'
        },

        subViewEvents: {
            'submit submit': 'onSubmit'
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
         * @name UsernameVerify#onSubmit
         * @function
         * @public
         */
        onSubmit: function(e) {
            var errs, that = this;

            errs = this.form.commit();

            if (_.isEmpty(errs)) {
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

        }

    });

    module.exports = View;
});