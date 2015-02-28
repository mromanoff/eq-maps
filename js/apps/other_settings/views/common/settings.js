/* global, define, _ */

define(function (require, exports, module) {
    'use strict';
    var Core       = require('core/app');
    var Marionette = require('marionette');
    var Template   = require('text!other_settings/templates/common/settings.tpl');

    /**
     * Username Confirmation View
     *
     * This is the view, template helpers and bindings for the username confirmation page
     * which is shown after a user submits the a username/edit form
     *
     * @name UsernameConfirmation
     * @class UsernameConfirmationView
     * @return view
     */
    var View = Marionette.ItemView.extend({

        template : _.template(Template),

        /**
         * ui
         *
         * store ui elements in memory
         */
        ui: {
            toggleFBShare: '.toggle-fb-share',
            toggleEmailConfirmations: '.toggle-email-confirmations'
        },

        /**
         * events
         *
         * all dom events for settings
         */
        events: {
            'click .toggle-fb-share': 'toggleFbShare',
            'click .toggle-email-confirmations' : 'emailConfirmations'
        },

        /**
         * emailConfirmations
         *
         * I have this view. Really rushed and it shows. Should have turned this into a
         * backbone.form or model save.
         *
         * @param e
         */
        emailConfirmations: function(e) {
            e.preventDefault();

            var that = this;
            var isConfirmationOptOut = this.model.get('isConfirmationOptOut') == true ? false : true;
            var toggleClass = isConfirmationOptOut ? 'off' : 'on';

            this.model.set('isConfirmationOptOut', isConfirmationOptOut);
            this.ui.toggleEmailConfirmations.removeClass('on off').addClass(toggleClass);

            $.ajax({
                type: 'POST',
                url: Core.utils.getApi('/personal-training-schedule/confirmationoptout/update'),
                data: { isConfirmationOptOut: isConfirmationOptOut }
            }).fail(function(){
                // if it fails, then reset it
                isConfirmationOptOut = that.model.get('isConfirmationOptOut') === true ? false : true;
                toggleClass = isConfirmationOptOut ? 'off' : 'on';

                that.model.set('isConfirmationOptOut', isConfirmationOptOut);
                that.ui.toggleEmailConfirmations.removeClass('on off').addClass(toggleClass);
            });
        },


        /**
         * toggleFbShare
         *
         * Toggle sharing of Equinox status with Facebook. Rushed work as everything on
         * this damn file... i hate myself.
         *
         * @param e
         */
        toggleFbShare: function(e) {
            e.preventDefault();

            var that = this;
            var shareMyClasses = this.model.get('fbShare') === true ? false : true;
            var toggleClass = shareMyClasses ? 'on' : 'off';

            this.model.set('fbShare', shareMyClasses);
            this.ui.toggleFBShare.removeClass('on off').addClass(toggleClass);

            $.ajax({
                type: 'POST',
                url: Core.utils.getApi('/social/sharemyclasses/update'),
                data: { shareMyClasses: shareMyClasses }
            }).fail(function(){
                // if it fails, then reset it
                shareMyClasses = that.model.get('fbShare') === true ? false : true;
                toggleClass = shareMyClasses ? 'on' : 'off';

                that.model.set('fbShare', shareMyClasses);
                that.ui.toggleFBShare.removeClass('on off').addClass(toggleClass);
            });
        },

        /**
         * onRender
         *
         * This is... rushed work. Tight deadline and we should have made this into a backbone.form
         * or at least a model that saves.
         */
        onRender: function() {
            var that = this;

            // todo: create editor instead
            if (user.FacebookId !== null) {
                $.ajax({
                    url: Core.utils.getApi('/social/sharemyclasses')
                }).done(function(data) {
                    var toggleClass = data.shareMyClasses ? 'on' : 'off';

                    that.model.set('fbShare', data.shareMyClasses);
                    that.ui.toggleFBShare.removeClass('on off').addClass(toggleClass);
                });
            }

            $.ajax({
                url: Core.utils.getApi('/personal-training-schedule/confirmationoptout')
            }).done(function(data) {
                var toggleClass = data.isConfirmationOptOut ? 'off' : 'on';

                that.model.set('isConfirmationOptOut', data.isConfirmationOptOut);
                that.ui.toggleEmailConfirmations.removeClass('on off').addClass(toggleClass);
            });

        }
    });

    module.exports = View;
});