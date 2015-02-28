(function(App) {
    "use strict";
    var tabbedCarouselNav = function($el, $slider) {
        var $caret = $el.find(".caret"), updateCaret = function() {
            var $selected = $el.find("a.selected");
            $caret.css("left", $selected.position().left + $selected.outerWidth() / 2 + $caret.width() + "px");
        };
        $el.find("a").first().addClass("selected");
        updateCaret();
        $el.find("a").on("click", function(e) {
            e.preventDefault();
            $el.find("a").removeClass("selected");
            $(this).addClass("selected");
            updateCaret();
            var index = $(this).data("index");
            $slider.data("owlCarousel").goTo(index);
        });
        $el.find("a").on("touchstart", function(e) {
            e.preventDefault();
        });
        $el.find("a").on("touchend", function(e) {
            e.preventDefault();
            $el.find("a").removeClass("selected");
            $(this).addClass("selected");
            updateCaret();
            var index = $(this).data("index");
            $slider.data("owlCarousel").goTo(index);
        });
        $slider.on("owl.move", function() {
            $el.find("a").removeClass("selected");
            $el.find("[data-index=" + $slider.find("div.active").index() + "]").addClass("selected");
            updateCaret();
        });
        $(window).on("resize", function() {
            updateCaret();
        });
    };
    App.Components["owl-slider"] = function($el, options) {
        var fixDotsNavigationPosition = function() {
            var $controls = this.$elem.find(".owl-controls"), $item = this.$owlItems.eq(this.currentItem), $img = $item.find("img." + (EQ.Helpers.getDeviceSize() === "small" ? "is-mobile" : "is-desktop")), itemBottomPosition = $item.height(), isTabbed = $el.parent().hasClass("tabbed-carousel");
            if ($img.height()) {
                if (isTabbed === false || isTabbed && EQ.Helpers.getDeviceSize() === "large") {
                    $controls.css("top", itemBottomPosition);
                } else {
                    $controls.css("top", $img.height());
                }
            } else {
                if (isTabbed === false || isTabbed && EQ.Helpers.getDeviceSize() === "large") {
                    $img.load(function() {
                        $controls.css("top", itemBottomPosition);
                    });
                } else {
                    $img.load(function() {
                        $controls.css("top", $img.height());
                    });
                }
            }
        };
        var setNavigation = function() {
            if (this.itemsAmount === 1) {
                $(".prev, .next").hide();
                return false;
            }
            if (this.currentItem === 0) {
                $(".prev").hide();
                $(".next").show();
            } else if (this.currentItem === this.itemsAmount - 1) {
                $(".next").hide();
                $(".prev").show();
            } else {
                $(".prev, .next").show();
            }
        };
        var bindNavigation = function() {
            var $root = $el.parent();
            $root.on("click", ".next", function() {
                $el.trigger("owl.next");
            });
            $root.on("click", ".prev", function() {
                $el.trigger("owl.prev");
            });
        };
        var hasArrows = options.arrows;
        options = $.extend(true, {
            navigation: false,
            slideSpeed: 800,
            addClassActive: true,
            paginationSpeed: 400,
            singleItem: true,
            setAsSingle: true,
            autoHeight: false,
            tracked: false,
            disableSingleItemOption: true,
            afterInit: function() {
                var self = this;
                $el.trigger("owl.ready");
                if ($(window).width() >= 768) {
                    bindNavigation.apply(this);
                    setNavigation.apply(this);
                }
                if ($(".page-wrapper").data("plugin_stellar")) {
                    $(".page-wrapper").data("plugin_stellar").refresh();
                }
                $el.find(".owl-buttons").addClass("buttons-" + this.itemsAmount);
                setTimeout(function() {
                    fixDotsNavigationPosition.apply(self);
                }, 1e3);
            },
            afterMove: function(data) {
                $el.trigger("owl.move", data);
                fixDotsNavigationPosition.apply(this);
                if ($(window).width() >= 768) {
                    setNavigation.apply(this);
                }
                if (!this.tracked) {
                    this.tracked = true;
                    var title = $el.parent().parent().data("title");
                    if (title === undefined) {
                        title = $el.parent().parent().parent().data("title");
                    }
                    if (title === undefined) {
                        title = $el.parent().parent().parent().parent().data("title");
                    }
                    window.track("swipe", {
                        action: "swipe",
                        page: $("body div.page").attr("class"),
                        element: $el.parent().attr("class"),
                        title: title
                    });
                }
                $el.parent().find(".swipe-guide").fadeOut(function() {
                    $(this).addClass("is-hidden");
                });
                var method = this.currentItem === 0 ? "removeClass" : "addClass";
                $el.parent().find(".hide-on-swipe")[method]("faded-out");
            },
            afterUpdate: function(data) {
                $el.trigger("owl.resize", data);
                fixDotsNavigationPosition.apply(this);
            }
        }, options);
        if (hasArrows) {
            options.navigation = true;
            options.navigationText = [ '<i class="icon-left-arrow"></i>', '<i class="icon-right-arrow"></i>' ];
        }
        $el.owlCarousel(options);
        if ($el.prev().hasClass("tabbed-carousel-nav")) {
            tabbedCarouselNav($el.prev(), $el);
        }
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
