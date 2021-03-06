(function (App) {
    'use strict';

    App.Components.radio = function ($el) {
        var $radio = $el.find('input');

        console.log($radio.is(':checked'));

        if ($radio.is(':checked')) {
            $el.addClass('selected');
        }

        $radio.on('change', function () {
            console.log('change');
            $('input[name="' + $radio.attr('name') + '"]').closest('.radio').removeClass('selected');
            $el.toggleClass('selected');
        });

    };

}(window.App));