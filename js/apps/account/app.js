/* global, define */

/**
 * Account App Module
 *
 * We define our application here, instantiate the router and fire off the Backbone history. Do note
 * that we explicitly add the app object to the window object so we can access it easily
 * throughout the app. Also, we use to module systems to define an app: AMD Module & Marionette
 * Module. The reason for this is, we want to use AMD for loading this file bur we want to use
 * Marionette's module to declare the module as an application to Marionette so we can later
 * take full advantage of some neat features it has like starting/stopping an app.
 *
 * @name Account
 * @module Account
 * @namespace Account
 */
define(function (require, exports, module) {
    'use strict';

    var Core   = require('core/app');
    var Router = require('account/router');

    Core.module('account', function (App) {
        App.startWithParent = false;

        App.router = new Router();
    });

    module.exports = Core.account;
});

