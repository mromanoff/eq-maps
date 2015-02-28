(function(global, App) {
    "use strict";
    var Instagram = {};
    Instagram.init = function($el) {
        var $dom = $el, $images = $dom.find("ul li"), clientId = "5685142d69544b4c8f3d0745ecbc83ff";
        var url = "https://api.instagram.com/v1/users/" + "365731137" + "/media/recent/?client_id=" + clientId + "&callback=?";
        $.getJSON(url).success(function(raw) {
            var images = raw.data, len = Math.min(images.length, 3);
            for (var i = 0; i < len; i++) {
                var imagesStr = "images", lowResStr = "low_resolution", urlStr = "url";
                $images.eq(i).find("a").attr("href", images[i].link);
                $images.eq(i).find("a img").attr("src", images[i][imagesStr][lowResStr][urlStr].replace("http:", ""));
            }
        });
    };
    App.Components.instagram = function($el) {
        Instagram.init($el);
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
