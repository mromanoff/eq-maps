(function(App) {
    "use strict";
    App.Components.forwardevent = function($el) {
        if (EQ.Helpers.isIe() < 11) {
            $el.forwardevents();
        }
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
