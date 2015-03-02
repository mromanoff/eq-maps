(function (App) {
    'use strict';

    /* global _ */

    /* global debug */
    var Template = {};

    /**
    * Init Method for Template Component.
    *
    * @param {Object} Form element. Cannot be null.
    * @methodOf Template
    * @return {Void}
    */
    Template.init = function ($el, options) {
        debug('[Template] ', Template);

        /**
        * Check preconditions
        */
        if (!$el) {
            throw new Error('Param missing ($el) on Template init method');
        }

        this.$el = $el;
        if (options && options.parseHtml) {
            this.templateObject = _.template(this.$el.html());
        } else {
            this.templateObject = _.template(this.$el.text());
        }

        // Bind public methods
        $el.data('publicMethods', this.publicMethods);

        this.render();
    };

    /**
    * Render the template using the vars defined on data attribute: template-data.
    *
    * @methodOf Template
    * @return {Void}
    */
    Template.render = function () {
        // Replace content with compiled template.
        this.$el.html(this.templateObject(this.$el.data('template-data')));
    };

    /**
    * Exposed methods attached to the DOM data attributte. These can be 
    *   accessed globally.
    *
    * @fieldOf Template
    * @namespace
    */
    Template.publicMethods = {
        render: function () {
            Template.render();
        }
    };

    App.Components.template = function ($el, options) {
        Template.init($el, options);
    };

}(window.App));