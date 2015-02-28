define(function (require, exports, module) {
    'use strict';

    var Forms = require('backbone.forms');
    var Template  = require('text!core/templates/forms/agreement.tpl');

    /**
     * Agreement Checkbox & Collapsible Editor
     *
     * Creates the Terms & Condition agreement checkbox + the custom drop down
     *
     * @public
     */
    Backbone.Form.editors.Agreement = Backbone.Form.editors.Base.extend({

        defaultValue: false,

        tagName: 'input',

        events: {
            'click':  function(event) {
                this.trigger('change', this);
            },
            'focus':  function(event) {
                this.trigger('focus', this);
            },
            'blur':   function(event) {
                this.trigger('blur', this);
            },

            'click .icon-check': 'onClick',

            'click .toggle-agreement': 'toggleAgreement'
        },

        toggleAgreement: function(e) {
            e.preventDefault();

            this.$el.find('.collapsible').slideToggle();
            this.$el.find('.icon-dropdown').toggleClass('flip-icon');
        },

        /**
         * if user clicks on the fake checkbox, update the real one
         */
        onClick: function(e) {
            e.preventDefault();

            if(this.$el.prop('checked')) {
                this.$el.find('.checkbox').removeClass('checked');
                this.setValue(false);
            } else {
                this.$el.find('.checkbox').addClass('checked');
                this.setValue(true);
            }

            this.trigger('click', this);
        },

        initialize: function(options) {
            this.options = options || {};

            Backbone.Form.editors.Base.prototype.initialize.call(this, this.options);

            this.$el.attr('type', 'checkbox');

            this.template = this.options.schema.template || this.constructor.template;
        },

        /**
         * Adds the editor to the DOM
         */
        render: function() {
            var options = this.options,
                schema = this.schema,
                input = '<input id="' + this.id + '" name="' + this.key + '" type="checkbox">';
            var that = this;
            var $el = $($.trim(this.template(schema)));
            var name = that.model.attributes.nameOnCard; // nameOnCard || in future, any other name attribute just pass it here

            this.setValue(this.value);

            this.setElement($el);

            // wait for backbone to render everything and hide extra label
            window.setTimeout(function(){
                that.$el.find('.checkbox').add(input);
                that.$el.parent().parent().parent().children('label[for]').hide();
                that.$el.parent().parent().parent().find('.name-on-card').text(name); // add the name of the person to the agreement
            }, 100);

            return this;
        },

        getValue: function() {
            return this.$el.prop('checked');
        },

        setValue: function(value) {
            if (value) {
                this.$el.prop('checked', true);
            }else{
                this.$el.prop('checked', false);
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
        template: _.template(Template),
    });

});