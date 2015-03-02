(function () {
    'use strict';

    /* global EQ */

    // Global Bindings excluding components and page-particular items
    $(function () {

        if (EQ.Helpers.getDevicePlatform() === 'android') {
            $('input[maxlength]').each(function () {
                var $input = $(this),
                    max = $input.attr('maxlength');
                $input.removeAttr('maxlength');
                $input.on('keydown', function (evt) {
                    // Valid delete keys.
                    var ignore = [8, 9, 13, 33, 34, 35, 36, 37, 38, 39, 40, 46],
                        isExtraKey = evt.altKey || evt.ctrlKey;
                    if ($.inArray(evt.keyCode, ignore) === -1 && !isExtraKey) {
                        return $input.val().length < max;
                    }
                });
                $input.on('keyup', function () {
                    var value = $input.val();
                    if (value.length > max) {
                        $input.val(value.substr(0, max));
                    }
                });
            });
        }

        //flush cache if hash #flushGeoCache is passed in the url
        if (window.location.hash === '#flushGeoCache') {
            EQ.Geo.flushCache();
            console.log('[GLOBAL] Flushing Geo Cache');
        }

        // FIXME: ideally this should come properly formatted from Back-end.
        EQ.Helpers.fixRegionProperty();

        // Fixed iFrame from creating blank space at bottom showing up: DPLAT-3738
        $('iframe[title="Google conversion frame"]').css('display', 'none');

    });

} (window));