(function(App) {
    "use strict";
    App.Components["video-slide"] = function($el) {
        var Player;
        var videoId = $el.find("video").attr("id");
        $(".vjs-progress-control").on("click", function(e) {
            e.preventDefault();
            return false;
        });
        $el.find("video").prop("controls", false);
        _V_(videoId).ready(function() {
            Player = this;
            $el.find("a.play-video").on("click", function(e) {
                e.preventDefault();
                $el.find("video").prop("controls", true);
                $el.find("header").animate({
                    opacity: 0
                }, 400, function() {
                    Player.play();
                }).addClass("pointer-events-none");
                $el.find(".vjs-control-bar").hide();
                var videoName = Player.v.src.split("/").reverse()[0].split("?")[0];
                window.track("videoStart", {
                    page: $("body div.page").attr("class"),
                    element: $el.parent().attr("class"),
                    name: videoName
                });
            });
            Player.on("ended", function() {
                $el.find("video").prop("controls", false);
                $el.find("header").animate({
                    opacity: 1
                }, 400).removeClass("pointer-events-none");
                var videoName = Player.v.src.split("/").reverse()[0].split("?")[0];
                window.track("videoEnded", {
                    page: $("body div.page").attr("class"),
                    element: $el.parent().attr("class"),
                    name: videoName
                });
            });
            var replay = function() {
                Player.play();
            };
            window.replay = replay;
        });
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
