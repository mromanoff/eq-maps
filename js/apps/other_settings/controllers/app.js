define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');

    /**
     * App Controller
     *
     * This is the base controller for the account app. In here, we simply manage
     * the firing of the appropriate sub-controller logic for each page. Note how
     * we do not require all Views, Models, Layouts and Forms on top. Instead, we
     * we load them only when needed via a require() call inside each method. This
     * will ensure the app does not load too much into memory.
     *
     * @augments Backbone.Model
     * @name AccountApp
     * @class AppController
     * @return model
     */
    var Controller = Marionette.Controller.extend({

        /**
         * Account Info
         *
         * @name AppController#otherSettings
         * @function
         * @public
         */
        otherSettings: function (id) {
            require(['other_settings/controllers/home'], function (Controller) {
                var controller = new Controller();

                controller.init(id);
            });
        },

        /**
         * XID Homepage
         *
         * @name AppController#xid
         * @function
         * @public
         */
        netpulse: function () {
            require(['other_settings/controllers/netpulse/home'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },

        /**
         * XID Error
         *
         * @name AppController#xidError
         * @function
         * @public
         */
        netpulseError: function () {
            require(['other_settings/controllers/netpulse/home'], function (Controller) {
                var controller = new Controller();

                controller.init({error: true});
            });
        },

        /**
         * XID Success
         *
         * @name AppController#xidSuccess
         * @function
         * @public
         */
        netpulseSuccess: function () {
            require(['other_settings/controllers/netpulse/home'], function (Controller) {
                var controller = new Controller();

                controller.init({ success: true });
            });
        },

        /**
         * XID Login
         *
         * @name AppController#xidLogin
         * @function
         * @public
         */
        netpulseLogin: function () {
            require(['other_settings/controllers/netpulse/login'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },

        /**
         * XID Register
         *
         * @name AppController#xidRegister
         * @function
         * @public
         */
        netpulseRegister: function () {
            require(['other_settings/controllers/netpulse/register'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },

        getQueryStringVariable: function (variable) {
            var query = window.location.search.substring(1);
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (pair[0] == variable) { return pair[1]; }
            }
            return false;
        },

        getURLParameter: function (name) {
            return decodeURI((RegExp('\\b' + name + '=' + '(.+?)(&|$)').exec(location.search) || [, ''])[1]);
        },

        netpulsePartnerResponse: function () {
            var params = {},
            serviceName = this.getURLParameter("name"),
                code = this.getURLParameter("code"),
                verifier = this.getURLParameter("oauth_verifier"),
                token = this.getURLParameter("oauth_token");

            if (serviceName && (code || verifier || token)) {
                if (verifier) {
                    params["verifier"] = verifier;
                } else if (token) {
                    params["verifier"] = token;
                } else if (code) {
                    params["code"] = code;
                }
                params["redirectUri"] = "/othersettings/xid";
                $.ajax({
                    url: Core.utils.getApi('/xid/link/') + serviceName,
                    data: $.param(params),
                    type: 'POST'
                }).always(function (data) {
                    window.location.href = "/othersettings/xid?status=" + data.status;
                });
            }
            else {
                window.location.href = "/othersettings/xid";
            }
        },

        /**
         * If the route does not exist AND you are on an SPA page
         * assume that you are trying to go to a MPA page; so,
         * we will cause a manual browser refresh to redirect to
         * the server side
         *
         * @todo: find a way to either run from coreController or extend
         * this controller with this method
         */
        goToBackEndRoute: function (path) {
            // if you get here do a full refresh
            window.location = "/" + path;
        }

    });

    module.exports = Controller;
});