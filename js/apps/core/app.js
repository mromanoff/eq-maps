/* global define, require */

/**
 * Core Module
 *
 * We define our application here, instantiate the router and fire off the Backbone history. Do note
 * that explicitly add the app object to the window object so we can access it easily
 * throughout the app
 *
 * @name Core
 * @module Core
 * @namespace Core
 */
define(function (require, exports, module) {
    'use strict';

    require('debug');
    require('marionette');
    require('core/helpers/backbone/forms/extensions');
    require('core/helpers/marionette/extensions'); // todo: change to 1 extension for all modules

    var Core   = new Marionette.Application();
    var Router = require('core/router');
    var Utils  = require('core/helpers/utils');
    var Store  = require('core/helpers/store');

    Core.utils = new Utils(); // random utils we will use throughout the app
    Core.store = new Store(); // place to store data that persists throughout the app

    Core.utils.setupAjax();

    Core.el = '#app-main';

    Core.addRegions({
        headerRegion: '#header-region',
        mainRegion: '#main-region'
    });

    Core.navigate = function(route, options) {
        options || (options = {});
        Backbone.history.navigate(route, options);
    }

    Core.getCurrentRoute = function() {
        return Backbone.history.fragment;
    }

    Core.startSubApp = function(appName, args){
        var currentApp = appName ? Core.module(appName) : null;

        if (Core.currentApp === currentApp){
            return;
        }

        if (Core.currentApp){
            Core.currentApp.stop();
        }

        Core.currentApp = currentApp;

        if(currentApp){
            currentApp.start(args);
        }
    };

    Core.on("initialize:after", function(){
        if(Backbone.history){

            // we get the subapps from the app's main div
            var apps = $(Core.el).data('apps');
            var subapps = {
                paths: [],
                names: []
            };

            for(var i=0; i<apps.length; i++) {
                if (apps[i] !== 'core') {
                    subapps.paths.push(apps[i] + '/app');
                    subapps.names.push(apps[i]);
                }
            }

            require(subapps.paths, function () {
                var urlFragments = window.location.pathname.split('/');

                for( var i=0; i<subapps.names.length; i++) {
                    Core.startSubApp(subapps.names[i]);
                }

                Core.router = new Router();

                Core.utils.overrideLinks(); // do not allow links to cause full page refresh

                Backbone.history.start({ pushState: true, root: '/' + urlFragments[1] });
            });
        }
    });

    window.Core = Core; // expose core to the window

    module.exports = Core;

});