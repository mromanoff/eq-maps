(function(App) {
    "use strict";
    App.Components["bar-chart"] = function($el, options) {
        var chart = $el.find(".chart");
        $.each(options.data, function(index, value) {
            var container = $(document.createElement("div")).addClass("bar-container"), bar = $(document.createElement("div")), label = $(document.createElement("span"));
            if (options.scale) {
                value = Math.round(value / options.scale * 100);
            }
            if (options.info) {
                var tag = $(document.createElement("span"));
                bar.append(tag.text(value + "%").addClass("tag"));
            }
            bar.height(value + "%");
            container.append(bar.addClass("bar " + index));
            container.append(label.text(index).addClass("label"));
            chart.append(container);
        });
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
