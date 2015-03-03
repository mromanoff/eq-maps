(function(App) {
    "use strict";
    var Template = {};
    Template.init = function($el, options) {
        debug("[Template] ", Template);
        if (!$el) {
            throw new Error("Param missing ($el) on Template init method");
        }
        this.$el = $el;
        if (options && options.parseHtml) {
            this.templateObject = _.template(this.$el.html());
        } else {
            this.templateObject = _.template(this.$el.text());
        }
        $el.data("publicMethods", this.publicMethods);
        this.render();
    };
    Template.render = function() {
        this.$el.html(this.templateObject(this.$el.data("template-data")));
    };
    Template.publicMethods = {
        render: function() {
            Template.render();
        }
    };
    App.Components.template = function($el, options) {
        Template.init($el, options);
    };
})(window.App);
/*! local_env equinox_maps v1.0.0 - 2015-03-03 01:03:55 */
