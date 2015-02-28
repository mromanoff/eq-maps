(function (App) {
    'use strict';

    App.Components['splash-slider'] = function ($el, options) {

        // Set first slide.
        $el.find('.slide').eq(0).addClass('active').fadeIn();

        var splashinterval = setInterval(function () {
            var $current = $el.find('.slide.active'),
                $next;

            // If there is no next slide, go to the first one
            if ($current.next().length > 0) {
                $next = $current.next();
                $current.removeClass('active');
                $next.addClass('active');
            } else {
                // Keep slide show on last slide when complete - Neel
                clearInterval(splashinterval);
            }
        }, options.interval);
        
    };


}(window.App));