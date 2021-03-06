(function (global) {
    'use strict';

    /* global,  Backbone */

    var App = global.App = {};

    App.IS_DEV = location.hostname.indexOf('local') === 0;
    App.Pages = {};
    App.Components = {};
    App.Events = $({});

    App.Services = {
        findByGeo: '/ESB/FindFacilitiesByGeo'
    };

    App.Events.on('loaded', function () {

        var Router = Backbone.Router.extend({
            // Fixes for IIS unconventional routing.
            _routeToRegExp: function (route) {
                // Optional trailing slash
                route += '(/)';
                // This makes the Router case insensitive
                route = Backbone.Router.prototype._routeToRegExp.call(this, route);
                return new RegExp(route.source, 'i');
            },

            routes: {
                'clubs/:region(/:subregion)(/:club)': App.Pages.Clubs.init
            }
        });

        App.Router = new Router();

        Backbone.history.start({
            hashChange: false,
            pushState: true
        });

        $.ajaxSetup({
            cache: false
        });

        // Page scroll for data-hash
        App.loadComponent('page-scroll');

        // AJAX Check to redirect if session expired while the user had the browser open
        $(document).ajaxError(function (e, xhr) {
            // If the user variable is defined (meaning the user was logged in)
            // but the status is 401, we can assume that the session expired
            if (global.user !== null && xhr.status === 401) {
                location.href = '/login?ReturnUrl=' + window.location.pathname;
            }
        });

        if (global.user === null) {
            // Invalidate favs localStorage cache if user is null
            global.EQ.Helpers.user.invalidateFavoritesCache();
        }
    });
}(window));
