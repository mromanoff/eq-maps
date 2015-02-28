(function(App) {
    "use strict";
    var Expandible = function($el) {
        this.$el = $el;
        this.init();
    };
    Expandible.prototype = {
        init: function() {
            this.bind();
        },
        bind: function() {
            this.$el.find(".collapsed:first-child.if-not-first").removeClass("collapsed");
            this.$el.children().on("click", function() {
                $(this).siblings().addClass("collapsed");
                $(this).toggleClass("collapsed");
            });
        }
    };
    App.Components.expandible = function($el) {
        if ($el.data("expandible")) {
            return $el.data("expandible");
        }
        $el.data("expandible", new Expandible($el));
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
