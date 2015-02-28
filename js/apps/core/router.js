/* global define, Marionette */

define(['marionette', 'core/controllers/app'], function (Marionette, Controller) {

    /**
     * Router class
     *
     * This is the Marionette AppRouter class. In here, you should not see any heavy logic; it
     * all has been delegated to the appController. The router is simply directing all routing
     * to the corresponding method in the appController. For instance, if a user hits the url
     * '/billing/overview' it will fire the appController method `billingOverview`.
     *
     * @augments Backbone.Router
     * @name Router
     * @class Router
     * @return routes
     */
    var Router = Marionette.AppRouter.extend({

        controller: new Controller(),

        appRoutes: {
        }

    });

    return Router;
});
