/* global define, Marionette */

/**
 * Account Router
 *
 * All routing definitions for account go here. Remember to use #hash based links in your anchor tags
 * instead of /forward-slashes because we are still targeting IE9. Backbone will know how to
 * convert the hashes to normal urls.
 *
 * @name AccountRouter
 * @module AccountRouter
 */
define(["marionette", "controllers/app"], function (Marionette, Controller) {

    /** 
     * Router class
     *
     * This is the Marionette AppRouter class. In here, you should not see any heavy logic; it 
     * all has been delegated to the appController. The router is simply directing all routing
     * to the corresponding method in the appController. For instance, if a user hits the url
     * '/billing/overview' it will fire the appController method `billingOverview`.
     *
     * @augments Backbone.Router
     * @name AccountRouter
     * @class AccountRouter
     * @namespace Account.Router
     */
    var Router = Marionette.AppRouter.extend({

        controller: new Controller(),
        
        appRoutes: {
            '':                      'account',
            'c/:id':                 'account',
            'edit':                  'edit',
            'ptrenew':               'ptrenew',
            'confirmation':          'confirmation',
            'username/edit':         'usernameEdit',
            'username/confirmation': 'usernameConfirmation',
            'username/verify/:token':'usernameVerify',
            'password/edit':         'passwordEdit',
            'password/confirmation': 'passwordConfirmation',
            'billing/payment':       'billingPayment',
            'billing/add':           'billingAdd',
            'billing/update':        'billingUpdate',
            'billing/confirmation':  'billingConfirmation',
            '*path':                 'goToBackEndRoute'
        }

    });
    
    return Router;
});