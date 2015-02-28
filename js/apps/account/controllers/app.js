/**
 * Account App Controller Module
 *
 * This is the base controller for the account app. In here, we simply manage
 * the firing of the appropriate sub-controller logic for each page. Note how
 * we do not require all Views, Models, Layouts and Forms on top. Instead, we
 * we load them only when needed via a require() call inside each method. This
 * will ensure the app does not load too much into memory.
 *
 * @name AppController
 * @module AppController
 * @namespace Account.AppController
 */
define(function (require, exports, module) {
    'use strict';

    var Marionette  = require('marionette');
    var BasicLayout = require('layouts/basic_layout');
    
    /** 
     * App Controller Class
     *
     * This is the base controller for the account app. In here, we simply manage
     * the firing of the appropriate sub-controller logic for each page. Note how
     * we do not require all Views, Models, Layouts and Forms on top. Instead, we
     * we load them only when needed via a require() call inside each method. This
     * will ensure the app does not load too much into memory.
     *
     * @augments Backbone.Controller
     * @name AppController
     * @class AppController
     * @namespace Account.AppController
     */
    var Controller = Marionette.Controller.extend({

        /**
         * Account Info
         *
         * @name AppController#account
         * @function
         * @public
         */
        account: function(id) {
            require(['controllers/home'], function (Controller) {
                var controller = new Controller();

                controller.init(id);
            });
        },

        /**
         * Edit Account
         *
         * @name AppController#edit
         * @function
         * @public
         */
        edit: function() {
            require(['controllers/edit'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },

        /**
         * Username Edit
         *
         * @name AppController#usernameEdit
         * @function
         * @public
         */
        usernameEdit: function() {
            require(['controllers/username/edit'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },

        /**
         * Username Confirmation
         *
         * @name AppController#usernameConfirmation
         * @function
         * @public
         */
        usernameConfirmation: function() {
            require(['controllers/username/confirmation'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },

        /**
         * Username Verify
         *
         * @name AppController#usernameVerify
         * @function
         * @public
         */
        usernameVerify: function(token) {
            require(['controllers/username/verify'], function (Controller) {
                var controller = new Controller();

                controller.init(token);
            });
        },

        /**
         * Password Edit
         *
         * @name AppController#password
         * @function
         * @public
         */
        passwordEdit: function() {
            require(['controllers/password/edit'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },

        /**
         * Password Confirmation
         *
         * @name AppController#confirmation
         * @function
         * @public
         */
        passwordConfirmation: function() {
            require(['controllers/password/confirmation'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },

        /**
         * Confirmation
         *
         * @name AppController#confirmation
         * @function
         * @public
         */
        confirmation: function() {
            require(['controllers/confirmation'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },
        
        /**
         * Billing Add
         *
         * @name AppController#BillingAdd
         * @function
         * @public
         */
        billingAdd: function() {
            require(['controllers/billing/edit'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },

        /**
         * Billing Edit
         *
         * This method gets the view for billing/add or billing/update
         *
         * @name AppController#BillingEdit
         * @function
         * @public
         */
        billingUpdate: function() {
            require(['controllers/billing/edit'], function (Controller) {
                var controller = new Controller();

                controller.title  = 'Update Card';
                controller.update = true;

                controller.init();
            });
        },

        billingPayment: function () {
            require(['controllers/billing/payment'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },

        /**
         * Billing Confirmation
         *
         * @name AppController#billingConfirmation
         * @function
         * @public
         */
        billingConfirmation: function () {
            require(['controllers/billing/confirmation'], function (BillingConfirmationController) {
                var controller = new BillingConfirmationController();
                
                controller.init();
            });
        },


        /**
         *  PT Renew
         *
         * @name AppController#billingConfirmation
         * @function
         * @public
         */
        ptrenew: function () {
            require(['controllers/renewals'], function (Controller) {
                var controller = new Controller();

                controller.init();
            });
        },

        /**
         * initialize
         *
         * @name AppController#initialize
         * @function
         * @public
         */
        initialize: function(){
            $('body').addClass('v2'); //tmp for new styles without conflicting existing styles
            $('#app-main').addClass('account-app'); // tmp;
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
        goToBackEndRoute: function(path){
            // if you get here do a full refresh
            window.location = "/" + path;
        }
        
    });

    module.exports = Controller;
});