/* global consts */

define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Layout = require('layoutmanager');
    var Utils = require('utils');
    var TransactionModel = require('transaction');
    var EnvConfig = require('env.config');

    // set ajax cross domain and credentials here
    $.ajaxSetup({
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true
    });

    // The root path to run the application through.
    var App = {
        root: consts.ROOT,
        envConfig: EnvConfig,
        store: {
            transaction: TransactionModel,
            packages: [], // TODO: PackagesCollection    // cache this one
            inventory: {}  // TODO: Inventory model
        },

        utils: new Utils()
    };

   // App.components = {};
    //App.components.navigation = Navigation;

    App.utils.Spinner().spin(document.getElementById('app-main'));

    // Localize or create a new JavaScript Template object.
    //var JST = window.JST = window.JST || {};

    Backbone.Layout.configure({

        // in layout manager manage: true is default option.
        // it will overwrite render() method.
        // it will brake backbone-forms and other backbone 3rd party plugins.
        manage: false,

        //suppressWarnings: true,

        // Set the prefix to where your templates live on the server, but keep in
        // mind that this prefix needs to match what your production paths will be.
        // Typically those are relative.  So we'll add the leading `/` in `fetch`.
        prefix: consts.TEMPLATES,

        // This method will check for prebuilt templates first and fall back to
        // loading in via AJAX.
        fetchTemplate: function (path) {

            // Concatenate the file extension.
            path = path + '.html';

            // Check for a global JST object.  When you build your templates for
            // production, ensure they are all attached here.
            var JST = window.JST || {};

            // If the path exists in the object, use it instead of fetching remotely.
            if (JST[path]) {
                return JST[path];
            }

            // If it does not exist in the JST object, mark this function as
            // asynchronous.
            var done = this.async();

            // Fetch via jQuery's GET.  The third argument specifies the dataType.
            $.get(path, function (contents) {
                // Assuming you're using underscore templates, the compile step here is
                // `_.template`.
                done(JST[path] = _.template(contents));
            }, 'text');
        }
    });

    // Mix Backbone.Events, modules, and layout management into the App object.
    return _.extend(App, {

        // Create a custom object with a nested Views object.
        module: function (additionalProps) {
            return _.extend({ Views: {} }, additionalProps);
        },

        // Helper for using layouts.
        useLayout: function () {
            var layout = new Layout({
                el: '#app-main',
                template: 'layouts/main'
            });

            // Cache the refererence.
            this.layout = layout;

            // Return the reference, for chainability.
            return layout;
        }
    }, Backbone.Events);
});
