var consts = {};

consts.BASEPATH = '/assets/js';
consts.VENDOR = consts.BASEPATH + '/vendor';
consts.BOWER = consts.VENDOR + '/bower_components';
consts.APPS = consts.BASEPATH + '/apps';
consts.CORE = consts.APPS + '/core';
consts.FEEDBACK = consts.APPS + '/feedback';
consts.MODELS = consts.APP + '/models';
consts.COLLECTIONS = consts.APP + '/collections';
consts.VIEWS = consts.APP + '/views';
consts.CONTROLLERS = consts.APP + '/controllers';
consts.FORMS = consts.APP + '/forms';
consts.TEMPLATES = consts.APP + '/templates';
consts.ENTITIES = consts.APP + '/entities';
consts.HELPERS = consts.APP + '/helpers';


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

        //'backbone.wreqr' : consts.BOWER + '/backbone.wreqr/lib/amd/backbone.wreqr',
        //'backbone.eventbinder' : consts.BOWER + 'path/to/backbone.eventbinder',
        //'backbone.babysitter' : consts.BOWER + 'path/to/backbone.babysitter',


        spin: consts.BOWER + '/spin.js/spin',
        text: consts.BOWER + '/requirejs-text/text',
        moment: consts.BOWER + '/momentjs/moment',

        apps: consts.APPS,
        core: consts.CORE,
        feedback: consts.FEEDBACK,
        models: consts.MODELS,
        collections: consts.COLLECTIONS,
        views: consts.VIEWS,
        controllers: consts.CONTROLLERS,
        entities: consts.ENTITIES,
        helpers: consts.HELPERS,
        layouts: consts.CORE + '/layouts',
        templates: consts.TEMPLATES,
        EQ: consts.BASEPATH + '/lib/equinox.geo'
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

