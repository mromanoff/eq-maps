(function(App) {
    "use strict";
    App.Components["cols-height-equalizer"] = function($el) {
        var DEVICE_MAXIMUM_WIDTH_SMALL = 768;
        var tallest = 0;
        var $columns = $el.find('[class^="col-"]');
        var deviceWidth = (document.documentElement || document.body).clientWidth;
        $columns.each(function() {
            if ($(this).height() > tallest) {
                tallest = $(this).height();
            }
        });
        debug("[COLS HEIGHT EQ] tallest is", tallest);
        debug("EQ.Helpers.getDeviceSize", EQ.Helpers.getDeviceSize);
        if (deviceWidth >= DEVICE_MAXIMUM_WIDTH_SMALL) {
            $columns.height(tallest);
        }
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
