define(function (require, exports, module) {
    'use strict';

    var Core       = require('core/app');
    var Utils      = require('core/helpers/utils');
    var Forms      = require('backbone.forms');
    var Agreement  = require('core/helpers/backbone/forms/editors/agreement');
    var DateSelect = require('core/helpers/backbone/forms/editors/date_select');
    var Phone      = require('core/helpers/backbone/forms/editors/phone');
    var Checkbox   = require('core/helpers/backbone/forms/editors/checkbox');
    var Select     = require('core/helpers/backbone/forms/editors/select');
    var Select     = require('core/helpers/backbone/forms/editors/switch');
    //var Meh = require('/assets/js/vendor/bower_components/backbone-forms/distribution/editors/list.min.js');

    if (!Core.utils) {
        Core.utils = new Utils();
    }

    /**
     * Backbone Forms Extensions
     *
     * Some functionality not offered by Backbone-forms plugin, is added
     * in this library. Things like loader, fancy select/checkboxes, etc.
     * Backbone.Form.prototype.render() overrides the original Backbone-forms
     * render method so we can custom functionality
     *
     * @augments Backbone.Forms
     * @name BackboneFormsExtensions
     * @class BackboneFormsExtensions
     * @return model
     */
    Backbone.Form.prototype.extensions = function () {
        var that = this;
        var timer;

        this.model.on('submit', function () {
            var count   = 0;
            var $form   = that.$el.closest('form');
            var $submit = that.$el.closest('form').find('.submit');

            $submit.val('Loading...').text('Loading...');

            timer = setInterval(function(){
                if ( that.$el.find('.error').length > 0 || count >= 10 ) {
                    $submit.val('Submit').text('Submit');
                    // the line below breaks if we already get a error message
                    //$form.find('.form-error').text('Error: Please complete the fields marked in red.');

                    that.scrollToTop();

                    clearInterval(timer);
                }
                count++;
            }, 200);
        });

        this.model.bind('sync', function(model, response, options){
            var $form   = that.$el.closest('form');
            var $submit = that.$el.closest('form').find('.submit');

            if( response.success === true ) {
                $submit.val('Saved!').text('Saved!');
                $form.find('.form-error').text('');
            }
            that.scrollToTop();
        });

        //tmp: move to custom editor
        $('body').on('change', 'select[name="phoneTypes"]', function(e){
            var $el = $(e.target);
            var $select = $el.closest('fieldset').find('select[name="phoneCarrier"]').closest('.fancy-select');

            if ($el.val() === 'Mobile') {
                $select.animate({ opacity: 1 }).show();
            } else {
                $select.animate({ opacity: 0 }).hide();
            }
        });

        //tmp: this sucks, move to editor or something
        window.setTimeout(function(){
            $('select[name="phoneCarrier"]').closest('.fancy-select').hide();
        },200);

    };

    /**
     * scrollToTop
     *
     * Scroll to the top of the page. Used when a user clicks submit.
     *
     * @public
     */
    Backbone.Form.prototype.scrollToTop = function() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
    }

    Backbone.Form.prototype.render = function() {
        var self = this,
            fields = this.fields;

        //Render form
        var $form = $($.trim(this.template(_.result(this, 'templateData'))));

        //Render standalone editors
        $form.find('[data-editors]').add($form).each(function(i, el) {
            var $container = $(el),
                selection = $container.attr('data-editors');

            if (_.isUndefined(selection)) return;

            //Work out which fields to include
            var keys = (selection == '*')
                ? self.selectedFields || _.keys(fields)
                : selection.split(',');

            //Add them
            _.each(keys, function(key) {
                var field = fields[key];

                $container.append(field.editor.render().el);
            });
        });

        //Render standalone fields
        $form.find('[data-fields]').add($form).each(function(i, el) {
            var $container = $(el),
                selection = $container.attr('data-fields');

            if (_.isUndefined(selection)) return;

            //Work out which fields to include
            var keys = (selection == '*')
                ? self.selectedFields || _.keys(fields)
                : selection.split(',');

            //Add them
            _.each(keys, function(key) {
                var field = fields[key];
                // EQ: allow to keep markup data-fields on tpl
                if(field) {
                    $container.append(field.render().el);
                } else {
                    $container.closest('fieldset').hide();
                }
            });
        });

        //Render fieldsets
        $form.find('[data-fieldsets]').add($form).each(function(i, el) {
            var $container = $(el),
                selection = $container.attr('data-fieldsets');

            if (_.isUndefined(selection)) return;

            _.each(self.fieldsets, function (fieldset) {
                $container.append(fieldset.render().el);
            });
        });

        //Set the main element
        this.setElement($form);

        // load Equinox extensions
        this.extensions();

        //Set class
        $form.addClass(this.className);

        return this;
    };

});