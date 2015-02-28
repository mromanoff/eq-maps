(function(App) {
    "use strict";
    var ANIMATION_TIME = 300;
    var Tabs = function($el, style) {
        this.$el = $el;
        this.$tabs = $el.children(".tab");
        this.style = style;
        if (this.$tabs.length < 2) {
            return false;
        }
        this.init();
    };
    Tabs.prototype = {
        navigation: function() {
            var nav = '<div class="tabs-navigation"><ul>', tabs = this;
            tabs.$tabs.each(function(i) {
                var title = $(this).data("tab-title") || "#" + (i + 1);
                nav += '<li><a class="button tab-trigger" href="javascript:;">' + title + "</a></li>";
            });
            nav += "</ul></div>";
            tabs.$el.prepend(nav);
        },
        bind: function() {
            var tabs = this;
            tabs.$navigationItems = tabs.$el.find(".tabs-navigation li a");
            tabs.$navigationItems.each(function(i) {
                $(this).on("click", function() {
                    tabs.set(i);
                });
            });
            tabs.$extraNavigation = tabs.$el.find("[data-tab-trigger]");
            tabs.$extraNavigation.on("click", function(evt) {
                var i = "" + $(this).data("tab-trigger");
                if (i) {
                    evt.preventDefault();
                    tabs.set(i, false);
                }
            });
        },
        wrapper: function() {
            this.$el.children().wrapAll('<div class="tabs-content-wrapper"></div>').end();
            this.$wrapper = this.$el.find(".tabs-content-wrapper");
            this.tabWidth = this.$el.width();
        },
        init: function() {
            this.wrapper();
            this.navigation();
            this.bind();
            this.set(0, true);
        },
        verticalSlide: function($current, $next) {
            var that = this;
            $current.slideUp(ANIMATION_TIME, function() {
                $current.removeClass("tab-active");
            });
            $next.show().slideUp(1).slideDown(ANIMATION_TIME, function() {
                that.isAnimating = false;
            });
        },
        set: function(n, isAnimationPrevented) {
            var that = this;
            if (that.isAnimating || n === that.current) {
                return false;
            }
            that.current = n;
            that.isAnimating = true;
            that.$navigationItems.removeClass("active").eq(n).addClass("active");
            that.$extraNavigation.removeClass("active").filter('[data-tab-trigger="' + n + '"]').addClass("active");
            var $current = that.$tabs.filter(".tab-active"), $next = that.$tabs.eq(n), nextHeight = $next.height();
            if (isAnimationPrevented) {
                $current.removeClass("tab-active");
                $next.addClass("tab-active");
                that.isAnimating = false;
            } else if (that.style !== "simple") {
                $next.addClass("tab-active");
                if (EQ.Helpers.getDeviceSize() === "small") {
                    that.verticalSlide($current, $next);
                } else {
                    $next.addClass("fading").fadeIn(ANIMATION_TIME);
                    $current.fadeOut(ANIMATION_TIME, function() {
                        $current.removeClass("tab-active");
                        $next.removeClass("fading");
                        that.isAnimating = false;
                    });
                }
            } else {
                var $wrapper = that.$wrapper;
                $next.addClass("tab-active");
                if (EQ.Helpers.getDeviceSize() === "small") {
                    that.verticalSlide($current, $next);
                } else {
                    if ($wrapper.height() !== nextHeight) {
                        $wrapper.animate({
                            height: nextHeight
                        }, ANIMATION_TIME);
                    }
                    var isLTR = !!$next.prevAll(".tab-active").length;
                    if (!isLTR) {
                        $wrapper.css("left", -that.tabWidth);
                    }
                    $wrapper.animate({
                        left: isLTR ? "-" + that.tabWidth + "px" : 0
                    }, ANIMATION_TIME, function() {
                        $wrapper.css("left", 0);
                        $current.removeClass("tab-active");
                        that.isAnimating = false;
                    });
                }
            }
            this.$el.trigger("TAB_CHANGE", n);
        }
    };
    App.Components.tabs = function($el, style) {
        if ($el.data("tabs")) {
            return false;
        }
        $el.data("tabs", new Tabs($el, style));
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
