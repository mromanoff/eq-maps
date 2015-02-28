define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Marionette      = require('marionette');
    var HeadingTemplate = require('text!core/templates/forms/heading.tpl');

    /**
     * Forms Heading View
     *
     * This is the heading that we will `hopefully` use for all our
     * forms across to keep the UI consistent
     *
     * @name FormHeading
     * @class FormHeadingView
     * @return view
     */
    var FormHeadingView = Marionette.ItemView.extend({
        template : _.template(HeadingTemplate)
    });

    module.exports = FormHeadingView;
});