(function(global, App) {
    "use strict";
    var AthleticLevel = {};
    AthleticLevel.init = function($el) {
        debug("AthleticLevel", $el);
        App.loadComponent("range-selection", $el.find(".range-selection"), {
            changeCallback: function(value) {
                debug("changed", value);
            }
        });
    };
    App.Components["athletic-level"] = function($el) {
        AthleticLevel.init($el);
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
