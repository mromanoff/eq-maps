/* global, define */
/**
 * App class
 *
 * TWe define our application here, instantiate the router and fire off the Backbone history. Do note
 * that explicitly add the app object to the window object so we can access it easily throughout the app
 *
 * @name App
 * @class App
 */
define(function (require, exports, module) {
    'use strict';

    var Core = require('core/app');

    require(['components'], function () {
        
        require(["feedback/modules/feedback"],
           function (feedback) {
               feedback.render();
           });

        require(["feedback/modules/faq"],
            function (FAQ) {
                new FAQ();
            });
    });
    
    module.exports = Core.feedback;
});
