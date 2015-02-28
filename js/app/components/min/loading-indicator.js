(function(App) {
    "use strict";
    App.Components["loading-indicator"] = function($el, options) {
        var defaults = {
            navigation: false,
            itemsCustom: [ [ 0, 1 ], [ 450, 1 ], [ 600, 1 ], [ 700, 1 ], [ 1e3, 3 ], [ 1200, 3 ], [ 1400, 3 ], [ 1600, 3 ] ],
            jsonp: false
        };
        var opts = $.extend(options, defaults);
        debug("opts " + opts);
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
