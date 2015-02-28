/* global Backbone, define, _ */

define(function (require, exports, module) {
    'use strict';

    var Forms = require('backbone.forms');
    var Template = require('text!core/templates/forms/phone.tpl');

    /**
     * Text
     *
     * Text input with focus, blur and change events
     */
    Backbone.Form.editors.Phone = Backbone.Form.Editor.extend({

        tagName: 'input',

        defaultValue: '',

        previousValue: '',

        events: {
            'keyup':    'determineChange',
            'keypress': function(event) {
                var self = this;
                setTimeout(function() {
                    self.determineChange();
                }, 0);
            },
            'select':   function(event) {
                this.trigger('select', this);
            },
            'focus':    function(event) {
                this.trigger('focus', this);
            },
            'blur':     function(event) {
                this.trigger('blur', this);
            }
        },

        initialize: function(options) {
            Backbone.Form.editors.Base.prototype.initialize.call(this, options);

            var schema = this.schema;

            //Allow customising text type (email, phone etc.) for HTML5 browsers
            var type = 'text';

            if (schema && schema.editorAttrs && schema.editorAttrs.type) type = schema.editorAttrs.type;
            if (schema && schema.dataType) type = schema.dataType;

            this.$el.attr('type', type);

            this.template = options.schema.template || this.constructor.template;
        },

        createSelectOptions: function() {
            var str = '';
            var options = ['Home', 'Mobile', 'Work', 'Other'];

            for (var i=0; i<=options.length; i++) {
                str += '<option>' + options[i] + '</option>';
            }

            return str;
        },

        createSelectType: function() {
            var str = '';

            str += '<div class="fancy-select">';
            str += '    <span class="dropdown block white">';
            str += '        <span class="option"></span>';
            str += '        <select>';
            str += this.createSelectOptions();
            str += '        </select>';
            str += '    </span>';
            str += '</div>';

            return str;
        },

        /**
         * Adds the editor to the DOM
         */
        render: function() {
            this.setValue(this.value);

            var $el = $($.trim(this.template(this.schema)));

            this.setElement($el);
console.warn('wefwef');
            /*var $el = $('<div />');

            $el.append(this.$el[0].outerHTML); // a copy of the original this.$el
            $el.append(this.createSelectType());
            $el.append('<input type="hidden" name="ddd" value="ddd" />');


            this.setElement($el);
             */
            return this;
        },

        determineChange: function(event) {
            var currentValue = this.$el.val();
            var changed = (currentValue !== this.previousValue);

            if (changed) {
                this.previousValue = currentValue;

                this.trigger('change', this);
            }
        },

        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue: function() {
            return this.$el.val();
        },

        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) {
            this.$el.val(value);
        },

        focus: function() {
            if (this.hasFocus) return;

            this.$el.focus();
        },

        blur: function() {
            if (!this.hasFocus) return;
            console.log('#', this);
            this.$el.blur();
        },

        select: function() {
            this.$el.select();
        }

    }, {
        template: _.template(Template, null, Backbone.Form.templateSettings)
    });

});