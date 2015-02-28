(function(App) {
    "use strict";
    App.Components["splash-slider"] = function($el, options) {
        $el.find(".slide").eq(0).addClass("active").fadeIn();
        var splashinterval = setInterval(function() {
            var $current = $el.find(".slide.active"), $next;
            if ($current.next().length > 0) {
                $next = $current.next();
                $current.removeClass("active");
                $next.addClass("active");
            } else {
                clearInterval(splashinterval);
            }
        }, options.interval);
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
