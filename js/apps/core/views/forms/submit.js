define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Marionette = require('marionette');
    var Template   = require('text!core/templates/forms/submit.tpl');

    /**
     * Submit Button View
     *
     * Since we intentionally isolate the submit button from the forms to
     * allow the Backbone-forms' based forms dynamic, we might as well
     * make a view for it to reuse.
     *
     * @name SubmitButton
     * @class SubmitButtonView
     * @return view
     */
    var Form = Marionette.ItemView.extend({
        template : _.template(Template),

        events: {
            'click .submit': 'onSubmit',
            'click .cancel': 'onCancel'
        },

        onSubmit: function(e) {
            e.preventDefault();
            this.trigger('submit', e);  // event for the parent view
            this.model.trigger('submit', e);  // event for the backbone-forms
        },

        onCancel: function(e) {
            e.preventDefault();

            //Backbone.history.history.pushState(null, null, '#edit')
            Backbone.history.history.back();
        }
    });

    module.exports = Form;
});