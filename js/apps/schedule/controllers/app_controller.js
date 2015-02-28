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
 * @name ScheduleApp
 * @class AppController
 * @return module
 */

define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');

    module.exports = Marionette.Controller.extend({
        /**
         * render index page for schedule appointment flow
         * @param {string} [date] - date in 2014-05-31 format
         */
        create: function (date) {
            require(['controllers/create/index'], function (Controller) {
                var controller = new Controller();
                controller.index(date);
            });
        },

        /**
         * render review page for schedule appointment flow
         * @param {object} appointment - Selected Appointment model
         */
        createReview: function (appointment) {
            require(['controllers/create/index'], function (Controller) {
                var controller = new Controller();
                controller.review(appointment);
            });
        },


        /**
         * render confirmation page for schedule appointment flow
         * @param {object} appointment - Selected Appointment model
         */
        createConfirmation: function (appointment) {
            require(['controllers/create/index'], function (Controller) {
                var controller = new Controller();
                controller.confirmation(appointment);
            });
        },

        /**
         * render index page for cancel appointment flow
         * @param {id} id - Appointment ID
         */
        cancel: function (id) {
            require(['controllers/cancel/index'], function (Controller) {
                var controller = new Controller();
                controller.index(id);
            });
        },

        /**
         * render review page for cancel appointment flow
         * @param {object} appointment - Selected Appointment model
         */
        cancelReview: function (appointment) {
            require(['controllers/cancel/index'], function (Controller) {
                var controller = new Controller();
                controller.review(appointment);
            });
        },

        /**
         * render confirmation page for cancel appointment flow
         * @param {object} appointment - Selected Appointment model
         */
        cancelConfirmation: function (appointment) {
            require(['controllers/cancel/index'], function (Controller) {
                var controller = new Controller();
                controller.confirmation(appointment);
            });
        },

        /**
         * render index page for update appointment flow
         * @param {string} id - Selected Appointment ID
         */
        update: function (id) {
            require(['controllers/update/index'], function (Controller) {
                var controller = new Controller();
                controller.index(id);
            });
        },

        /**
         * render review page for update appointment flow
         * @param {object} appointment - Selected Appointment model
         */
        updateReview: function (appointment) {
            require(['controllers/update/index'], function (Controller) {
                var controller = new Controller();
                controller.review(appointment);
            });
        },

        /**
         * render confirmation page for update appointment flow
         * @param {object} appointment - Selected Appointment model
         */
        updateConfirmation: function (appointment) {
            require(['controllers/update/index'], function (Controller) {
                var controller = new Controller();
                controller.confirmation(appointment);
            });
        },

        /**
         * render index page for detail appointment flow
         * @param {string} id - Selected Appointment ID
         */
        detail: function (id) {
            require(['controllers/detail/index'], function (Controller) {
                var controller = new Controller(id);
                controller.index(id);
            });
        },

        /**
         * render calendar component
         */
        calendar: function () {
            require(['controllers/calendar/index'], function (Controller) {
                var controller = new Controller();
                controller.index();
            });
        },

        /**
         * Create calendar navigation component
         * @param {object} options - Options object
         */
        navigation: function (options) {
            require(['controllers/calendar/navigation'], function (Controller) {
                var controller = new Controller(options);
                controller.index(options);
            });
        },

        /**
         * Create header component
         * @param {object} options - Options object
         */
        header: function (options) {
            require(['controllers/header/index'], function (Controller) {
                var controller = new Controller(options);
                controller.initialize(options);
            });
        },

        /**
         * Create filter component, filter by Trainer and Duration
         */
        trainerFilter: function () {
            require(['controllers/filter/trainer'], function (Controller) {
                var controller = new Controller();
                controller.initialize();
            });
        },

        /**
         * Render an error page
         * @param {object} options - Options object
         */
        error: function (model, response, options) {
            require(['controllers/error/index'], function (Controller) {
                console.log('IN APP_CONTROLLER - ERROR model response options :: ', model, response, options);
                //var controller = new Controller(response);
                var controller = new Controller(model);
                //controller.initialize(response);
                controller.initialize(model);
            });
        },

        /**
         *   Scroll page to the top.
         *   TODO: move to helper file
         */
        scroll: function () {
            $(document).scrollTop(0);
            $('#app-main').css({ opacity: 0 }).animate({ opacity: 1 }, 600);
        },

        /**
         *   Route to default page. Full app reload
         */
        defaultPage: function () {
            // update url if there is route doesn't exist. go to schedule default page
            Backbone.history.navigate('', {trigger: true});
        }

    });
});