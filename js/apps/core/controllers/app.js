define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');

    /**
     * App Controller
     *
     * This is the base controller for the account app. In here, we simply manage
     * the firing of the appropriate sub-controller logic for each page. Note how
     * we do not require all Views, Models, Layouts and Forms on top. Instead, we
     * we load them only when needed via a require() call inside each method. This
     * will ensure the app does not load too much into memory.
     *
     * @augments Backbone.Model
     * @name AccountApp
     * @class AppController
     * @return model
     */
    var Controller = Marionette.Controller.extend({

        /**
         * initialize
         *
         * From here we load certain functionality like the core/modules
         *
         * @name AppController#initialize
         * @function
         * @public
         */
        initialize: function () {
            var modules = ['modules/data_components/index'];

            // all the core meat goes here
            if (typeof App === 'undefined') {
                window.App = {
                    Components: {}
                };
            }

            if (typeof EQ === 'undefined') {
                window.EQ = {};
            }

            //load core modules
            require(modules, function () {
                console.log('Finished loading components..')
            });

            $('body').addClass('v2'); //tmp for new styles without conflicting existing styles
            $('#app-main').addClass('account-app'); // tmp;

        },

        goToBackEndRoute: function() {
            console.warn('goToBackEndRoute');
            //window.location = "/" + path;
        },

        onRoute: function(name, path, args){
            console.log("onRoute fired");
            console.log(name, path, args);
        }

    });

    module.exports = Controller;
});