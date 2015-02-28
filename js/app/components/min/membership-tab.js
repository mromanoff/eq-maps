(function(App) {
    "use strict";
    App.Components["membership-tab"] = function($el) {
        $el.find("a.membership-tab").on("click", function() {
            $el.toggleClass("closed");
            $("body, html").animate({
                scrollTop: $el.offset().top - 100
            });
        });
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
