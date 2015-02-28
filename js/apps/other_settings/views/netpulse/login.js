define(function (require, exports, module) {
    'use strict';

    var Core         = require('core/app');
    var Marionette   = require('marionette');
    var BossView     = require('bossview');
    var HeadingView  = require('core/views/common/heading');
    var FormView     = require('other_settings/views/forms/login');
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

        /**
         * subViewEvents
         *
         * Manage events coming from the child views
         */
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
         * @name BillingPaymentView#onSubmit
         * @function
         * @public
         */
        onSubmit: function(e) {
            var errs, that = this;

            errs = this.form.commit();

            if (_.isEmpty(errs)) {
                this.form.model.save()
                    .success(function(model, response) {
                        Core.other_settings.router.navigate('xid', {trigger: true});
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