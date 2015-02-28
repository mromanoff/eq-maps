(function (global, App) {
    'use strict';

    var CyclingPatch = App.Pages.CyclingPatch = {};

    CyclingPatch.init = function () {
        var maxItems = 3,
            $hero = $('.cycling-hero ul.section-carousel'),
            $feat = $('.feat ul.section-carousel'),
            $team = $('.team ul.section-carousel');

        // Init carousel
        maxItems = $hero.find('li').length;
        App.loadComponent('owl-slider', $hero, utils.getSliderOptions(maxItems));

        maxItems = $feat.find('li').length;
        App.loadComponent('owl-slider', $feat, utils.getSliderOptions(maxItems));

        maxItems = $team.find('li').length;
        App.loadComponent('owl-slider', $team, utils.getSliderOptions(maxItems));

        var bioOverlay = $('.bio-overlay-template').html();

        $('.view-full-bio').on('click', function () {
            if ($(window).width() < 768) {
                var text = $(this).text() === 'View full bio' ? 'Hide full bio' : 'View full bio';

                $(this).siblings('.more-info').toggleClass('hidden');
                $(this).text(text);
                $('.meet-our-experts').data('owlCarousel').updateVars();
            } else {
                var bioContent = $(this).closest('.item-info').html(),
                    fullBioText = $(this).siblings('.more-info');

                $('.page').append(bioOverlay);
                $('.bio-overlay-container .profile-pic-info').append(bioContent);
                $('.bio-overlay-container .profile-pic-info .more-info').addClass('hidden');
                $('.bio-overlay-container .view-full-bio').addClass('hidden');
                fullBioText.clone().appendTo($('.bio-overlay-container .profile-info'));
                $('.profile-info .more-info').removeClass('hidden');
            }
        });

        $('body').on('click', '.close-more-info', function (e) {
            e.preventDefault();
            if ($(window).width() < 768) {
                $(this).parent().siblings('.view-full-bio').trigger('click');
            } else {
                $(this).closest('.bio-overlay').remove();
            }
        });
    };

    var utils = {
        getSliderOptions: function (maxItems) {
            var sliderOpts = {
                singleItem: false,
                items: maxItems,
                setAsSingle: true,
                itemsDesktop: [1200, maxItems],
                itemsTablet: [1023, maxItems],
                itemsMobile: [768, 1]
            };

            return sliderOpts;
        }
    };


}(window, window.App));
