var consts = {};

consts.BASEPATH = '/assets/js';
consts.VENDOR = consts.BASEPATH + '/vendor';
consts.LIBS = consts.BASEPATH + '/lib';
consts.BOWER = consts.VENDOR + '/bower_components';
consts.APPS = consts.BASEPATH + '/apps';
consts.CORE = consts.APPS + '/core';
consts.COMPONENTS  = consts.BASEPATH + '/app/components';

consts.APP = consts.APPS + '/purchase';
consts.MODULES = consts.APP + '/modules';
consts.TEMPLATES = consts.APP + '/templates/'; // must have trailing '/' for templates
consts.APPHELPERS = consts.CORE + '/helpers';
//consts.COMPONENTS  = consts.APP + '/modules/components';   /// TODO: dirty fix. should be consts.BASEPATH + '/app/components';

consts.API = window.APIEndpoint;
consts.MOCKS = consts.API + '/personal-training-purchase';
consts.ROOT = '/personal-training/purchase';

requirejs.config({

    baseUrl: consts.PURCHASE,

    paths: {
        // Make vendor easier to access.
        vendor: consts.VENDOR,

        // Map remaining vendor dependencies.
        jquery: consts.BOWER + '/jquery/jquery',
        // Opt for Lo-Dash Underscore compatibility build over Underscore.
        underscore: consts.BOWER + '/lodash/dist/lodash.underscore',
        backbone: consts.BOWER + '/backbone/backbone',
        layoutmanager: consts.BOWER + '/layoutmanager/backbone.layoutmanager',
        'backbone.forms': consts.BOWER + '/backbone-forms/distribution.amd/backbone-forms',
        spin: consts.BOWER + '/spin.js/spin',
        debug: consts.VENDOR + '/_console',

        'jquery.cookie': consts.LIBS + '/jquery.cookie',

        modal: consts.VENDOR + '/backbone.modal-1.0.0/backbone.modal-min',

        consts: consts,
        core: consts.CORE,
        utils: consts.APPHELPERS + '/utils',
        purchase: consts.APP,
        modules: consts.MODULES,
        app: consts.APP + '/app',
        //templates: consts.TEMPLATES,
        components: consts.COMPONENTS,


        'env.config': consts.APP + '/config/environment.config',
        transaction: consts.MODULES + '/transaction',
        equifit: consts.MODULES + '/equifit',
        inventory: consts.MODULES + '/inventory',
        order: consts.MODULES + '/order',
        billing: consts.MODULES + '/billing',
        messages: consts.MODULES + '/messages',
        analytics: consts.MODULES + '/analytics',
        //appHelpers: consts.APPHELPERS,
        helpers: consts.BASEPATH + '/lib/equinox.helpers'
    },

    shim: {
        // This is required to ensure Backbone works as expected within the AMD
        // environment.
        backbone: {
            // These are the two hard dependencies that will be loaded first.
            deps: ['jquery', 'underscore'],

            // This maps the global `Backbone` object to `require("backbone")`.
            exports: 'Backbone'
        }
    }
});


if (typeof jQuery === 'function') {
    define('jquery', function () {
        'use strict';
        return jQuery;
    });
}