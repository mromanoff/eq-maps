(function(App) {
    "use strict";
    App.Components.checkbox = function($el) {
        var $checkbox = $el.find('input[type="checkbox"]');
        if ($checkbox.is(":checked")) {
            $checkbox.val(true);
            $el.addClass("checked");
        } else {
            $checkbox.val(false);
        }
        $checkbox.on("change", function() {
            $el.toggleClass("checked");
            if ($checkbox.is(":checked")) {
                $checkbox.val(true);
            } else {
                $checkbox.val(false);
            }
        });
    };
})(window.App);
/*! local_env equinox_maps v1.0.0 - 2015-03-04 09:03:02 */
