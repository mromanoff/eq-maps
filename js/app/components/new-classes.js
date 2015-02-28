(function (global, App) {
    'use strict';

    /* global debug, Backbone */

    /**
    * Views
    */

    var NewClassesView = Backbone.View.extend({
        events: {
            'click .next-class': 'goToNext',
            'click .prev-class': 'goToPrev'
        },
        goToNext: function (e) {
            e.preventDefault();
            this.$el.find('.owl-carousel').data('owlCarousel').next();
        },
        goToPrev: function (e) {
            e.preventDefault();
            this.$el.find('.owl-carousel').data('owlCarousel').prev();
        },
        showHideArrows: function () {
            var $carousel = this.$el.find('.carousel-container');

            if ($carousel.data('owlCarousel').itemsAmount > $carousel.data('owlCarousel').visibleItems.length) {
                this.$el.find('.navigation').removeClass('hidden');
            } else {
                this.$el.find('.navigation').addClass('hidden');
            }
        },
        render: function () {
            var sliderOpts,
                self = this,
                $carousel = this.$el.find('.carousel-container');

            sliderOpts = {
                singleItem: false,
                items: 3,
                itemsDesktop: [1200, 3],
                itemsTablet: [1023, 2],
                itemsMobile: [768, 1],
                afterInit: function () {
                    setTimeout(function () {
                        self.showHideArrows();
                    }, 2000);
                },
                afterUpdate: function () {
                    self.showHideArrows();
                }
            };

            // Init carousel
            App.loadComponent('owl-slider', $carousel, sliderOpts);
        }
    });

    /**
    * Component Init
    */

    App.Components['new-classes'] = function ($el) {
        debug('INIT NEW CLASSES');
        var newClassesView = new NewClassesView({
            el: $el
        });
        newClassesView.render();

        // Omniture implementation for DPLAT-1929 {class part}
        $('#newtoeq').find('.button-container a').on('click', function () {
            var omnitSearchLink = this.href.split('?')[1].split('=');
            window.tagData.searchLink = window.tagData.searchLink || {};
            window.tagData.searchLink = {
                type: 'class',
                value: omnitSearchLink[1]
            };
            window.track('clickClassSearchLink', window.tagData.searchLink);
        });

    };

}(window, window.App));