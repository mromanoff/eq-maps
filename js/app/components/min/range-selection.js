(function(App) {
    "use strict";
    var RangeSelection = function($el, options) {
        this.$el = $el;
        this.$answers = $el.find(".answers > li");
        this.$trackWrapper = $('<div class="track-wrapper"></div>').prependTo($el);
        this.$track = $('<div class="track"></div>').appendTo(this.$trackWrapper);
        this.$trackShadow = $('<div class="track-shadow"></div>').appendTo(this.$track);
        this.$thumb = $('<button class="thumb"></button>').appendTo(this.$trackShadow);
        this.values = [];
        this.options = options;
        this.init();
        if (options.preselected) {
            if (options.selected !== undefined) {
                this.setOption(options.selected);
            } else {
                this.select(0);
            }
        } else {
            this.$thumb.addClass("inactive");
        }
    };
    RangeSelection.prototype = {
        init: function() {
            debug("[RangeSelection] init");
            if (this.options.hasReferences) {
                this.buildReferences(this.$answers.length);
            }
            this.bind();
        },
        buildReferences: function(references) {
            var referencesMarkup = "";
            for (var i = 0; i < references; i++) {
                var percent = i / (references - 1) * 100, style = Math.round(percent) === 100 ? "right: 0" : "left: " + percent + "%", $referenceLi = this.$answers.eq(i), caption = "";
                if ($referenceLi.data("range-caption")) {
                    caption = '<span class="caption">' + $referenceLi.data("range-caption") + "</span>";
                }
                this.values.push(percent);
                referencesMarkup += '<span class="reference" style="' + style + '">' + caption + "</span>";
            }
            this.$track.append(referencesMarkup);
            this.$references = this.$track.find(".reference");
        },
        bind: function() {
            var isDrag = false, onMove = false, lastX = 0, that = this, events = {
                start: "mousedown",
                move: "mousemove",
                end: "mouseup"
            }, lastWidth = this.$track.width();
            that.$trackWrapper.on("click", function(evt) {
                evt.preventDefault();
                if ($(evt.target).hasClass("thumb") && $(evt.target).hasClass("inactive")) {
                    $(evt.target).removeClass("inactive");
                    that.select(0);
                }
            }).on(events.start, function(evt) {
                if (evt.target === that.$thumb[0]) {
                    isDrag = true;
                } else {
                    that.$trackShadow.addClass("animating");
                    that.move(that.getX(evt.originalEvent));
                }
            }).on(events.move, function(evt) {
                if (isDrag) {
                    onMove = true;
                    lastX = that.getX(evt.originalEvent);
                    var dx = Math.floor(lastX - that.$track.offset().left);
                    that.$trackShadow.css({
                        transform: "translateX(" + dx + "px)"
                    });
                }
            }).on(events.end, function() {
                if (isDrag) {
                    isDrag = false;
                    that.$trackShadow.addClass("animating");
                    if (onMove) {
                        that.move(lastX);
                    }
                    onMove = false;
                }
                that.$trackShadow.one("transitionend", function() {
                    that.$trackShadow.removeClass("animating");
                });
            });
            $(window).on("resize", EQ.Helpers.throttle(function() {
                var oldPercentage = 100 - that.$trackShadow.width() * 100 / lastWidth;
                lastWidth = that.$track.width();
                var dx = Math.floor(oldPercentage / 100 * lastWidth);
                that.$trackShadow.css({
                    transform: "translateX(" + dx + "px)"
                });
            }, 300));
        },
        select: function(percent) {
            var position = Math.round(percent * (this.values.length - 1) / 100);
            this.$el.find('input[name="position"]').val(position);
            var $referenceLi = this.$answers.eq(position);
            this.$el.find('input[name="answer"]').val($referenceLi.data("range-value"));
            this.$references.removeClass("current").eq(position).addClass("current");
            this.$answers.removeClass("active").eq(position).addClass("active");
            if (this.options.changeCallback) {
                this.options.changeCallback(position);
            }
        },
        move: function(x) {
            var trackWidth = this.$track.width(), percent = (x - this.$track.offset().left) * 100 / trackWidth;
            percent = percent < 0 ? 0 : percent;
            percent = percent > 100 ? 100 : percent;
            if (this.options.hasSnap && this.values.length) {
                percent = this.values.reduce(function(prev, curr) {
                    return Math.abs(curr - percent) < Math.abs(prev - percent) ? curr : prev;
                });
                this.select(percent);
            }
            var dx = Math.round(percent) === 100 ? trackWidth - this.$thumb.width() / 2 : Math.floor(percent / 100 * trackWidth);
            this.$trackShadow.css({
                transform: "translateX(" + dx + "px)"
            });
            if (this.$thumb.hasClass("inactive")) {
                this.$thumb.removeClass("inactive");
            }
        },
        getX: function(evt) {
            return evt.touches && evt.touches[0] && evt.touches[0].pageX || evt.pageX;
        },
        setOption: function(index) {
            var trackWidth = this.$track.width(), percent = this.values[index - 1] || 0;
            this.select(percent);
            var dx = Math.round(percent) === 100 ? trackWidth - this.$thumb.width() / 2 : Math.floor(percent / 100 * trackWidth);
            this.$trackShadow.css({
                transform: "translateX(" + dx + "px)"
            });
        }
    };
    App.Components["range-selection"] = function($el, options) {
        if (!$el.find(".answers > li").length) {
            return false;
        }
        if ($el.data("rangeSelection")) {
            return $el.data("rangeSelection");
        }
        options = $.extend(true, options || {}, {
            hasReferences: true,
            hasSnap: true
        });
        $el.data("rangeSelection", new RangeSelection($el, options));
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
