(function (global, App) {
    'use strict';

    App.Pages.GroupFitness = {};
    var GroupFitness = App.Pages.GroupFitness;

    GroupFitness.init = function () {
        $(window).on('resize scroll', GroupFitness.expandQuilt);
        GroupFitness.expandQuilt();
        GroupFitness.omnitCall();
    };

    GroupFitness.expandImage = function (e) {
        e.preventDefault();

        $('.grid-active [class*="image-"]').remove();

        $(this).find('.quilt-overlay').clone().fadeIn().appendTo('.grid-active').addClass('active');
        $('.grid-active').fadeIn().addClass('active');
        $('.groupfitness').addClass('overlay');

        setTimeout(function () {
            $('.grid-active .quilt-overlay').addClass('overlay');
            $('body').css({ 'overflow': 'hidden' });
        }, 100);

        $('.grid-active .close').on('click', function (e) {
            e.preventDefault();

            $('.grid-active .quilt-overlay').removeClass('overlay');
            $('body').removeAttr('style');
            $('.groupfitness').removeClass('overlay');
            $('.grid-active').fadeOut().removeClass('active');

            setTimeout(function () {
                $('.grid-active .quilt-overlay.active').remove();
            }, 700);

        });

        // Omniture implementation for DPLAT-1929 {category part}
        $('.grid-active .quilt-overlay-info a').on('click', function () {
            var omnitSearchLink = this.href.split('?')[1].split('=');
            window.tagData.searchLink = window.tagData.searchLink || {};
            window.tagData.searchLink = {
                type: 'category',
                value: omnitSearchLink[1]
            };
            window.track('clickClassSearchLink', window.tagData.searchLink);
        });
    };

    GroupFitness.expandQuilt = function () {
        var images = $('[class*="image-"]');
        images.off('click').on('click', function (event) {
            if ($(this).attr('data-go-to') === 'cycling') {
                event.preventDefault();
                window.location = '/groupfitness/cycling';
            } else {
                GroupFitness.expandImage.call(this, event);
            }
            
        });
    };

    GroupFitness.omnitCall = function () {
        $('.search-menu li a').on('click', function () {
            var hrefVal = this.href.split('/')[this.href.split('/').length - 1];
            if (hrefVal === 'search') {
                window.tagData.searchLink = window.tagData.searchLink || {};
                window.tagData.searchLink = {
                    type: 'findaclass',
                    value: ''
                };
                window.track('clickClassSearchLink', window.tagData.searchLink);
            } else if (hrefVal === 'bookabike') {
                window.tagData.searchLink = window.tagData.searchLink || {};
                window.tagData.searchLink = {
                    type: 'bike',
                    value: ''
                };
                window.track('clickClassSearchLink', window.tagData.searchLink);
            }
        });
    };

}(window, window.App));