/* global Backbone , EQ */

define(function (require, exports, module) {
    'use strict';

    var Core             = require('core/app');
    var Marionette       = require('marionette');
    var BossView         = require('bossview');
    var HeadingView      = require('core/views/common/heading');
    var UsernameFormView = require('core/views/forms/username');
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
            email: function() {

                this.model.set({
                    fieldsets: [
                        { label: 'Current Username', content: window.userProfileJson.Username }
                    ]
                });

                return new EmailView({
                    model: this.model
                });
            },
            form: UsernameFormView,
            submit: SubmitView
        },

        /**
         * subViewContainers
         *
         * Dump the subviews in the following areas of this view's template
         */
        subViewContainers: {
            heading:   '.heading-subregion',
            email:     'form',
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
                var $emailMsg = this.form.$el.find('[name="emailMsg"]');
                $emailMsg.hide();
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
            var errs, attrs, that = this;

            errs  = this.form.commit();
            attrs = _.omit(this.model.attributes, ['title', 'narrow']); // remove these buggers

            Core.store.set('account', attrs);

            if (_.isEmpty(errs)) {
                this.form.model.save()
                    .success(function (model, response) {
                        EQ.Helpers.refreshUserCacheData();
                        Core.account.router.navigate('username/confirmation', {trigger: true});
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