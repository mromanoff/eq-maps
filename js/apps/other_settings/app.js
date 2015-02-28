/**
 * Other Settings App Module
 *
 * TWe define our application here, instantiate the router and fire off the Backbone history. Do note
 * that explicitly add the app object to the window object so we can access it easily throughout
 * the app
 *
 * @name Other Settings
 * @module OtherSettings
 * @namespace OtherSettings
 */
define(function (require, exports, module) {
    'use strict';

    var Core   = require('core/app');
    var Router = require('other_settings/router');

    Core.module("other_settings", function (App) {
        App.startWithParent = false;

        App.router = new Router();
    });

    module.exports = Core.account;
});


/**
 * Other Settings Models
 *
 * All child models of Other Settings are listed below
 *
 * @name Other Settings Models
 * @module OtherSettingsModels
 * @namespace OtherSettings.Models
 */

/**
 * Other Settings Views
 *
 * All child views of Other Settings are listed below
 *
 * @name Other Settings View
 * @module OtherSettingsViews
 * @namespace OtherSettings.Views
 */

/**
 * Other Settings Controllers
 *
 * All child controllers of Other Settings are listed below
 *
 * @name Other Settings Controllers
 * @module OtherSettingsControllers
 * @namespace OtherSettings.Controllers
 */
