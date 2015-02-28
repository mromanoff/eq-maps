(function(global, App) {
    "use strict";
    var CarouselSlidesView = Backbone.View.extend({
        events: {
            "click .next-class": "goToNext",
            "click .prev-class": "goToPrev"
        },
        goToNext: function(e) {
            e.preventDefault();
            this.$el.find(".owl-carousel").data("owlCarousel").next();
        },
        goToPrev: function(e) {
            e.preventDefault();
            this.$el.find(".owl-carousel").data("owlCarousel").prev();
        },
        render: function() {
            var $carousel = this.$el.find(".owl-carousel"), sliderOpts = {
                autoHeight: false,
                pagination: true,
                navigation: true,
                navigationText: [ '<i class="icon-left-arrow"></i>', '<i class="icon-right-arrow"></i>' ],
                setAsSingle: true
            };
            App.loadComponent("owl-slider", $carousel, sliderOpts);
            return this;
        }
    });
    App.Components["flexible-slideshow"] = function($el) {
        debug("flexible slideshow component!!!");
        var carouselSlidesView = new CarouselSlidesView({
            el: $el
        });
        carouselSlidesView.render();
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
