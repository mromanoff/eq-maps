define(function (require, exports, module) {
    'use strict';

    var Marionette   = require('marionette');
    var BossView     = require('bossview');
    var SettingsView = require('views/settings/renew');
    var SubmitView   = require('core/views/forms/submit');

    /**
     * Renewals Master View
     *
     * This is the master view for the renewals settings page
     *
     * @name Renewals
     * @class RenewalsView
     * @return view
     */
    var PageView = Marionette.BossView.extend({

        template: function() {
            return '<div class="page-view"></div><form class="large white forms-spa"></form>';
        },

        subViews: {
            settings: SettingsView,

            submit: function(){
                return new SubmitView({  model: this.model });
            }
        },

        subViewEvents: {
            'submit submit': 'onSubmit'
        },

        /**
         * subViewContainers
         *
         * Dump the subviews in the following areas of this view's template
         */
        subViewContainers: {
            settings: '.page-view',
            submit: 'form'
        },

        /**
         * onSubmit
         *
         * When we submit to the server, we submit the model with the same structure
         * we originally got in the GET request.
         *
         * @name RenewalsView#onSubmit
         * @function
         * @public
         */
        onSubmit: function(e) {
            e.currentTarget.disabled = true;

            // change url since we are now doing a POST and not a GET
            this.model
                .save(undefined, {
                    url: consts.API + '/personal-training-purchase/updatepacksize'
                })
                .success(function () {
                //Core.router.navigate('', { trigger: true });
                window.location.href = '/personal-training';
            });
        }

    });

    module.exports = PageView;
});