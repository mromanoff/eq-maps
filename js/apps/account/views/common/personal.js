define(function (require, exports, module) {
    'use strict';

    var Core = require('core/app');
    var Marionette = require('marionette');
    var Template = require('text!templates/common/personal.tpl');

    /**
     * Partial View Sample
     *
     * Regular Marionette ItemView Partial
     *
     * @name Partial1
     * @class PartialView1
     * @return view
     */
    var View = Marionette.ItemView.extend({

        template: _.template(''),

        /**
         * create
         *
         * If API succeeds, then show this view
         */
        create: function () {
            this.template = _.template(Template);
            this.render();
        },

        /**
         * destroy
         *
         * If for whatever reason the API fails, destroy this view and show nothing
         */
        destroy: function () {
            this.remove();
        },

        /**
         * initialize
         *
         * First thing we do is listen for changes and based on that we either populate
         * the view with an actual template and show to the user. If for whatever reason
         * it fails, then destroy this view and show nothing
         */
        initialize: function () {
            var that = this;

            Core.vent.on('account:membership:data:success', function () {
                that.create();
            });

            Core.vent.on('account:membership:data:fail', function () {
                that.destroy();
            });
        },

        events: {
            'click .deLink': 'deLinkFBAccount'
        },

        deLinkFBAccount: function (e) {
            $.ajax(APIEndpoint + '/registration/delinkwithfacebook', {
                contentType: 'application/json',
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                }
            })
                    .done(function () {
                        //TODO :  omniture calls for disconnect FB account to EQ account.
                        if (typeof (window.track) === 'function') {
                            window.track('regDisConnectedWithFB');
                        }
                        debug('[disConnect] Ready');
                        //Hack to refresh user cached data.
                        EQ.Helpers.refreshUserCacheData(function () { Core.vent.trigger('account:membership:data:success'); });
                    }).fail(function (jqXHR) {
                        var errorText = jqXHR.responseJSON && jqXHR.responseJSON.message;
                        debug('[FB Delink] Failed', errorText);
                        if (errorText) {
                            $('.is-error').removeClass('hidden').text(errorText);
                        }
                    });
            return false;
        }
    });

    module.exports = View;
});