(function(App) {
    "use strict";
    App.Components["page-scroll"] = function() {
        $("body").on("click", "a", function(e) {
            var isHash = $(this).attr("href").indexOf("#") !== -1 && $(this).attr("href").length > 1, isValidSection = $('[data-hash="' + $(this).attr("href").split("#")[1] + '"]').length > 0;
            if (isHash && isValidSection) {
                e.preventDefault();
                var scroll = $('[data-hash="' + $(this).attr("href").split("#")[1] + '"]').offset().top - $("nav.main").height();
                $("body, html").animate({
                    scrollTop: scroll
                });
            }
        });
    };
})(window.App);
/*! local_env equinox_maps v1.0.0 - 2015-03-02 06:03:44 */
