define(function (require, exports, module) {
    'use strict';

    var Forms    = require('backbone.forms');
    var Template = require('text!core/templates/forms/checkbox.tpl');

    /**
     * Fancy Checkbox Editor
     *
     * turns our custom checkboxes into Backbone-form friendly checkboxes
     *
     * @public
     */
    Backbone.Form.editors.Checkbox = Backbone.Form.editors.Base.extend({

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

            'click .icon-check': 'onClick'
        },

        /**
         * if user clicks on the fake checkbox, update the real one
         */
        onClick: function(e) {
            e.preventDefault();

            if(this.$el.find('input[type="checkbox"]').prop('checked')) {
                this.$el.removeClass('checked');
                this.setValue(false);
            } else {
                this.$el.addClass('checked');
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

            //$el.find('[data-editor]').add(input);
            this.value = this.model.get(options.key) || schema.defaultValue || this.defaultValue;



            this.setElement($el);

            if(this.$el.find('input[type="checkbox"]').prop('checked')) {
                this.$el.addClass('checked');
                this.setValue(true);
                console.log('case a');
            } else {
                this.$el.removeClass('checked');
                this.setValue(false);
                console.log('case b');
            }

            // wait for backbone to render everything and hide extra label
            window.setTimeout(function(){
                that.$el.append(input);
                that.$el.parent().parent().parent().children('label[for]').hide();
            }, 100);

            return this;
        },

        getValue: function() {
            return this.$el.prop('checked');
        },

        setValue: function(value) {
            if (value) {
                this.$el.find('input[type="checkbox"]').prop('checked', true);
            }else{
                this.$el.find('input[type="checkbox"]').prop('checked', false);
            }
        },

        focus: function() {
            if (this.hasFocus) return;

            this.$el.find('input[type="checkbox"]').focus();
        },

        blur: function() {
            if (!this.hasFocus) return;

            this.$el.find('input[type="checkbox"]').blur();
        }

    }, {
        template: _.template(Template),
    });

});