var consts = {};

// global
consts.BASEPATH = '/assets/js';
consts.VENDOR = consts.BASEPATH + '/vendor';
consts.BOWER = consts.VENDOR + '/bower_components';
consts.APPS = consts.BASEPATH + '/apps';
consts.COMPONENTS  = consts.BASEPATH + '/app/components';

// local
consts.APP = consts.APPS + '/schedule';
consts.VIEWS = consts.APP + '/views';
consts.CONTROLLERS = consts.APP + '/controllers';
consts.TEMPLATES = consts.APP + '/templates';
consts.ENTITIES = consts.APP + '/entities';
consts.APPHELPERS = consts.APP + '/helpers';

requirejs.config({

    baseUrl: consts.BASEPATH,

    paths: {
        // Make vendor easier to access.
        vendor: consts.VENDOR,
        // Map remaining vendor dependencies.
        jquery: consts.BOWER + '/jquery/jquery',
        // Opt for Lo-Dash Underscore compatibility build over Underscore.
        underscore: consts.BOWER + '/lodash/dist/lodash.underscore',
        backbone: consts.BOWER + '/backbone/backbone',
        marionette: consts.BOWER + '/backbone.marionette/lib/backbone.marionette',
        'backbone.wreqr': consts.BOWER + '/backbone.wreqr/lib/amd/backbone.wreqr',
        spin: consts.BOWER + '/spin.js/spin',
        text: consts.BOWER + '/requirejs-text/text',
        moment: consts.BOWER + '/momentjs/moment',
        debug: consts.VENDOR + '/_console',

        apps: consts.APPS,
        core: consts.CORE,
        components: consts.COMPONENTS,
        schedule: consts.APP,
        views: consts.VIEWS,
        controllers: consts.CONTROLLERS,
        entities: consts.ENTITIES,
        appHelpers: consts.APPHELPERS,
        helpers: consts.BASEPATH + '/lib/equinox.helpers',
        layouts: consts.CORE + '/layouts',
        templates: consts.TEMPLATES
    },

    shim: {
        // This is required to ensure Backbone works as expected within the AMD
        // environment.
        backbone: {
            // These are the two hard dependencies that will be loaded first.
            deps: ['jquery', 'underscore'],

            // This maps the global `Backbone` object to `require('backbone')`.
            exports: 'Backbone'
        },

        marionette: {
            deps: ['backbone'],
            exports: 'Marionette'
        }
    }
});

if (typeof jQuery === 'function') {
    define('jquery', function () {
        'use strict';
        return jQuery;
    });
}

