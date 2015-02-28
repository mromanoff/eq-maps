(function (App) {
    'use strict';

    // This is a standalone, self-initializing componenet. This compoenent doesn't needs to be in a data-componenet attr in the DOM.
    App.Components['page-scroll'] = function () {
        $('body').on('click', 'a', function (e) {
            var isHash = $(this).attr('href').indexOf('#') !== -1 && $(this).attr('href').length > 1,
                isValidSection = $('[data-hash="' + $(this).attr('href').split('#')[1] + '"]').length > 0;
            
            if (isHash && isValidSection) {
                e.preventDefault();
                var scroll = $('[data-hash="' + $(this).attr('href').split('#')[1] + '"]').offset().top - $('nav.main').height();
                $('body, html').animate({scrollTop: scroll});
            }
        });
    };

}(window.App));