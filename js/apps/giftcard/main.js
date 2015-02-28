define('bootstrap', function (require) {
    'use strict';

    var App = require('app');
    var Router = require('giftcard/router');

    var Backbone = require('backbone');
    var $ = require('jquery');

    // all the core meat goes here
    // create global App {} mimic legacy app.
    window.App = {
        Components: {}
    };
    // load components and helpers after window.App.Components object created
    require(['components', 'helpers']);

    // Define your master router on the application namespace and trigger all
    // navigation from this instance.
    App.router = new Router();

    // Trigger the initial route and enable HTML5 History API support, set the
    // root folder to '/' by default.  Change in app.js.
    //Backbone.history.start({ pushState: true, root: App.root });
    Backbone.history.start({ pushState: true, root: App.root });

    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router. If the link has a `data-bypass`
    // attribute, bypass the delegation completely.
    $('#app-main').on('click', 'a[href]:not([data-bypass])', function (evt) {
        // Get the absolute anchor href.
        var href = { prop: $(this).prop('href'), attr: $(this).attr('href')};
        // Get the absolute root.
        var root = location.protocol + '//' + location.host + App.root;

        if (href.attr === '#') {
            return;
        }

        // Ensure the root is part of the anchor href, meaning it's relative.
        if (href.prop.slice(0, root.length) === root) {
            // Stop the default event to ensure the link will not cause a page
            // refresh.
            evt.preventDefault();

            // `Backbone.history.navigate` is sufficient for all Routers and will
            // trigger the correct events. The Router's internal `navigate` method
            // calls this anyways.  The fragment is sliced from the root.
            Backbone.history.navigate(href.attr, true);
        }
    });
});

// Break out the application running from the configuration definition to
// assist with testing.
require(['./config'], function () {
    'use strict';
    // Kick off the application.
    require(['bootstrap', 'debug']);
});
