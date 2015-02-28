var consts = {};

consts.BASEPATH    = '/assets/js';
consts.VENDOR      = consts.BASEPATH + '/vendor';
consts.BOWER       = consts.VENDOR + '/bower_components';
consts.APPS        = consts.BASEPATH + '/apps';
consts.CORE        = consts.APPS + '/core';
consts.ACCOUNT = consts.APPS + '/account';
consts.FEEDBACK = consts.APPS + '/feedback';
consts.OTHER_SETTINGS = consts.APPS + '/other_settings';
consts.MODELS      = consts.ACCOUNT + '/models';
consts.VIEWS       = consts.ACCOUNT + '/views';
consts.CONTROLLERS = consts.ACCOUNT + '/controllers';
consts.FORMS       = consts.ACCOUNT + '/forms';
consts.TEMPLATES   = consts.ACCOUNT + '/templates';
consts.MOCKS       = consts.ACCOUNT + '/mocks';
consts.COMPONENTS  = consts.BASEPATH + '/app/components',
consts.API         = APIEndpoint; //http://local-api.equinox.com';
consts.MOCKDATA    = false;

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
        'backbone.forms' : consts.BOWER + '/backbone-forms/distribution.amd/backbone-forms',
        marionette: consts.BOWER + '/backbone.marionette/lib/backbone.marionette',
        babysitter: consts.BOWER + '/backbone.babysitter/lib/amd/backbone.babysitter',
        bossview: consts.VENDOR + '/BossView/Marionette.BossView.AMD',
        spin: consts.BOWER + '/spin.js/spin',
        text : consts.BOWER + '/requirejs-text/text',
        momentjs: consts.BOWER + '/momentjs/moment',
        apps: consts.APPS,
        core: consts.CORE,
        models: consts.MODELS,
        views: consts.VIEWS,
        controllers: consts.CONTROLLERS,
        layouts: consts.CORE + '/layouts',
        templates: consts.TEMPLATES ,
        components: consts.COMPONENTS,
        modules: consts.CORE + '/modules',
        navigation: consts.COMPONENTS + '/navigation',
        account: consts.ACCOUNT,
        feedback: consts.FEEDBACK,
        other_settings: consts.OTHER_SETTINGS,
        helpers: consts.BASEPATH + '/lib/equinox.helpers',
        geo: consts.BASEPATH + '/lib/equinox.geo',
        debug: consts.BASEPATH + '/vendor/_console'

    },

    shim: {
        // This is required to ensure Backbone works as expected within the AMD
        // environment.
        backbone: {
            // These are the two hard dependencies that will be loaded first.
            deps: ["jquery", "underscore"],

            // This maps the global `Backbone` object to `require("backbone")`.
            exports: "Backbone"
        },

        marionette: {
            deps: ["backbone"],
            exports: "Marionette"
        }
    }
});


if (typeof jQuery === 'function') {
    define('jquery', function () {
        return jQuery;
    });
}
