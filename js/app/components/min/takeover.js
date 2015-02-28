(function(App) {
    "use strict";
    App.Components.takeover = function($el) {
        var $takeoverTarget = $(".takeover-target");
        var takeoverTargetHref = $.trim($takeoverTarget.attr("href"));
        function showModal() {
            $el.show();
            $("body").css({
                overflow: "hidden"
            });
        }
        function hideModal() {
            $el.hide();
            $("body").css({
                overflow: "auto"
            });
        }
        function setTakeOverModalHideCookie() {
            $.cookie("takeOverModalHide", "true", {
                path: "/"
            });
        }
        function eventBinding() {
            $el.on("click", function(e) {
                if ($(e.target).hasClass("icon-close")) {
                    e.preventDefault();
                }
                hideModal();
                setTakeOverModalHideCookie();
            });
            $takeoverTarget.on("click touchstart", function(e) {
                if (takeoverTargetHref === "" || takeoverTargetHref === "#") {
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
        }
        function takeoverModal() {
            var isTakeOverModalShow = $.cookie("takeOverModalShow");
            var isTakeOverModalHide = $.cookie("takeOverModalHide");
            if (!isTakeOverModalShow) {
                showModal();
                $.cookie("takeOverModalShow", "true", {
                    expires: 1,
                    path: "/"
                });
            } else if (isTakeOverModalHide === "false" || isTakeOverModalHide === undefined) {
                showModal();
                $.cookie("takeOverModalHide", "false", {
                    path: "/"
                });
            }
            if (takeoverTargetHref === "") {
                $takeoverTarget.css("cursor", "default");
            }
        }
        function init() {
            takeoverModal();
            eventBinding();
        }
        init();
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
