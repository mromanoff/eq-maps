(function (App) {
    'use strict';

    App.Components['membership-tab'] = function ($el) {
        $el.find('a.membership-tab').on('click', function () {
            $el.toggleClass('closed');
            $('body, html').animate({scrollTop: $el.offset().top - 100});
        });
    };

}(window.App));