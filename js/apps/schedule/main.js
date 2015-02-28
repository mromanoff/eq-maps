define('bootstrap', function (require) {
    'use strict';

    var App = require('schedule/app');
    var Router = require('schedule/router');

    // set ajax cross domain and credentials here
    var proxiedSync = Backbone.sync;

    Backbone.sync = function (method, model, options) {
        options = options || {};

        if (!options.crossDomain) {
            options.crossDomain = true;
        }

        if (!options.xhrFields) {
            options.xhrFields = { withCredentials: true };
        }
        return proxiedSync(method, model, options);
    };

    App.addInitializer(function (options) {
        // Define your master router on the application namespace and trigger all
        // navigation from this instance.
        App.Router = new Router();
        App.scheduleCriteria = options.scheduleCriteria;
        App.APIEndpoint = options.APIEndpoint;
        App.APIEndpoint23 = options.APIEndpoint23;
        App.MainDomain = options.MainDomain;

        // Trigger the initial route and enable HTML5 History API support, set the
        //Backbone.history.start({ pushState: true, root: options.root });
        Backbone.history.start({ pushState: true, root: options.root });
    });

    $(function () {
        App.start({
            root: '/personal-training/schedule',
            scheduleCriteria: window.scheduleCriteria || {},
            APIEndpoint: window.APIEndpoint || null,
            MainDomain: window.MainDomain || null
        });
    });
});

// Break out the application running from the configuration definition to
// assist with testing.
require(['./config'], function () {
    'use strict';
    // Kick off the application.
    require(['bootstrap', 'debug']);
});