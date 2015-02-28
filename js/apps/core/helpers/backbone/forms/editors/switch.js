/* global, define, Backbone */

define(function (require, exports, module) {
    'use strict';

    var Forms    = require('backbone.forms');
    var Template = require('text!core/templates/forms/switch.tpl');


    /**
     * Checkbox editor
     *
     * Creates a single checkbox, i.e. boolean value
     */
    Backbone.Form.editors.Switch = Backbone.Form.editors.Base.extend({

        defaultValue: false,

        tagName: 'input',

        events: {
            'click':  function(event) {
                if ($(event.target).hasClass('switch-label')) {
                    var value = this.value ? false : true;
                    console.log('value', value);
                    this.setValue(value);
                    this.trigger('change', this);
                }
            },
            'focus':  function(event) {
                this.trigger('focus', this);
            },
            'blur':   function(event) {
                this.trigger('blur', this);
            }
        },

        toggle: function(value) {
            var before = value ? 'off' : 'on';

            var after = value ? 'on' : 'off';

            this.$el.find('.switch-label').removeClass(before).addClass(after);
        },

        initialize: function(options) {
            this.options = options || {};

            Backbone.Form.editors.Base.prototype.initialize.call(this, options);

            this.$el.attr('type', 'checkbox');

            this.template = this.options.schema.template || this.constructor.template;
        },

        /**
         * Adds the editor to the DOM
         */
        render: function() {
            var schema = this.schema;
            var $el = $($.trim(this.template(schema)));

            this.setValue(this.value);

            this.setElement($el);

            return this;
        },

        getValue: function() {
            return this.$el.prop('checked');
        },

        setValue: function(value) {
            if (value) {
                this.$el.prop('checked', true);
                this.toggle(true);
            }else{
                this.$el.prop('checked', false);
                this.toggle(false);
            }
        },

        focus: function() {
            if (this.hasFocus) return;

            this.$el.focus();
        },

        blur: function() {
            if (!this.hasFocus) return;

            this.$el.blur();
        }

    }, {
        template: _.template(Template)
    });

});