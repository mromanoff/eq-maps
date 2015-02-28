/* global define */

define(['marionette', 'other_settings/controllers/app'], function (Marionette, Controller) {

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
     * @return routes
     * @namespace OtherSettings.Router
     */
    var Router = Marionette.AppRouter.extend({

        controller: new Controller(),

        appRoutes: {
            '':             'otherSettings',
            'xid':          'netpulse',
            'xid/success': 'netpulseSuccess',
            'xid/error':    'netpulseError',
            'xid/login':    'netpulseLogin',
            'xid/register': 'netpulseRegister',
            'xid/entry.html': 'netpulsePartnerResponse',
            '*path':        'goToBackEndRoute'
        }

    });

    return Router;
});