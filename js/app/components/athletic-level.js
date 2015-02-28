(function (global, App) {
    'use strict';

    /* global debug */

    var AthleticLevel = {};

    AthleticLevel.init = function ($el) {
        debug('AthleticLevel', $el);
        
        App.loadComponent(
            'range-selection',
            $el.find('.range-selection'),
            {
                changeCallback: function (value) {
                    debug('changed', value);
                }
            }
        );
    };

    /**
    * Component Init.
    */

    App.Components['athletic-level'] = function ($el) {
        AthleticLevel.init($el);
    };

} (window, window.App));