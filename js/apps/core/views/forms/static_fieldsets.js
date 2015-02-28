/* global define, _ */

define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var Template   = require('text!core/templates/forms/static_fieldsets.tpl');

    /**
     * Static Fieldset(s) View
     *
     * Sometimes, we prepopulate a form with non-editable data which
     * unfortunately Backbone-forms cannot render/pass in the template
     *
     * @name StaticFieldsets
     * @class StaticFieldsetsView
     * @return view
     */
    var View = Marionette.ItemView.extend({

        template: _.template(Template)

    });

    module.exports = View;
});