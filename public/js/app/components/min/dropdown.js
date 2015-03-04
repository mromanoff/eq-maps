(function(App) {
    "use strict";
    var Dropdown = function($el) {
        this.$el = $el;
        this.$children = $el.children();
        this.init();
    };
    Dropdown.prototype = {
        init: function() {
            this.bind();
        },
        displayAll: function() {
            this._triggerAlways = true;
        },
        bind: function() {
            var dropdown = this;
            dropdown.$el.on("click.dropdown", function(evt) {
                if (dropdown.$el.hasClass("expanded") || typeof dropdown._triggerAlways !== "undefined") {
                    var $li = $(evt.target);
                    if (evt.target.tagName !== "li") {
                        $li = $li.closest("li");
                    }
                    if ($li.length) {
                        dropdown.select($li).collapse();
                    }
                } else {
                    dropdown.expand();
                }
            });
        },
        toggle: function() {
            if (this.$el.hasClass("expanded")) {
                this.collapse();
            } else {
                this.expand();
            }
            return this;
        },
        collapse: function() {
            this.$el.removeClass("expanded");
            return this;
        },
        expand: function() {
            this.$el.addClass("expanded");
            return this;
        },
        select: function($element) {
            if (typeof $element === "string") {
                $element = $($element);
            }
            this.$children.not($element).removeClass("active");
            $element.addClass("active");
            this.$el.trigger("update");
            return this;
        },
        refresh: function() {
            this.$children = this.$el.children();
            return this;
        }
    };
    App.Components.dropdown = function($el) {
        if (!$el.is("ul")) {
            return false;
        }
        if ($el.data("dropdown")) {
            return $el.data("dropdown");
        }
        $el.data("dropdown", new Dropdown($el));
    };
})(window.App);
/*! local_env equinox_maps v1.0.0 - 2015-03-04 09:03:02 */
