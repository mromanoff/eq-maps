(function (global, App) {
    'use strict';

    /* global EQ */

    /**
    * Views
    */

    var TourView = Backbone.View.extend({
        events: {
            'click .icon-close-slim': 'closeOverlay',
            'click [href="/othersettings"]': 'openCaloriesOverlay'
        },
        openCaloriesOverlay: function (e) {
            e.preventDefault();
            this.$el.removeClass('open');
            Backbone.Events.trigger('automatic-calories-overlay:open');
            $('.dtm-slider').hide();
        },
        closeOverlay: function (e) {
            e.preventDefault();
            this.$el.removeClass('open');
            $('.dtm-slider').hide();
        },
        render: function () {
            var self = this,
                $carousel = this.$el.find('.owl-carousel'),
                sliderOpts = {
                    arrows: true,
                    autoHeight: false
                };

            // Init carousel
            App.loadComponent('owl-slider', $carousel, sliderOpts);

            // Load calories overlay
            var $caloriesOverlay = $('<div></div>');
            $('.page').append($caloriesOverlay);
            App.loadComponent('automatic-calories-overlay', $caloriesOverlay, {}, function () {
                self.$el.addClass('open');
                $('.dtm-slider').show();
            });
            return this;
        }
    });

    /**
    * Component Init
    */

    App.Components['automatic-calories-tour'] = function ($el) {
        var tourView = new TourView({ el: $el});

        EQ.Helpers.getService('/v2.6/me/profile/acce').done(function (data) {
            console.log('ACCE', data);
            if (data.acceEnabled === null) {
                console.log('render tour');
                tourView.render();
            }
        });
    };

} (window, window.App));