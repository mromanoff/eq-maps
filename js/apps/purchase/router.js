define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Backbone = require('backbone');

    // Defining the application router.
    module.exports = Backbone.Router.extend({
        routes: {
            '': 'step1',
            'step1': 'step1',
            'step2': 'step2',
            'step3': 'step3',
            'confirmation': 'confirmation',
            '*path': 'coreApp'
        },

        step1: function () {
            require([
                'modules/step1'
            ], function (Step1) {
                Step1.init();
            });
        },

        step2: function () {
            require([
                'modules/step2'
            ], function (Step2) {
                Step2.init();
            });
        },

        step3: function () {
            require([
                'modules/step3'
            ], function (Step3) {
                Step3.init();
            });
        },

        confirmation: function () {
            require([
                'modules/confirmation'
            ], function (Confirmation) {
                Confirmation.init();
            });
        },

        coreApp: function () {
           // debug('[ROUTER] purchase: Error');
//            // comment or deleted this after POC
//            require([
//                "../error/error"
//            ], function(error){
//                error.init();
//            });
        }
    });
});