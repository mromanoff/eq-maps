define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var Template   = require('text!core/templates/common/heading.tpl');

    /**
     * Partial View Sample
     *
     * Regular Marionette ItemView Partial
     *
     * @name Partial1
     * @class PartialView1
     * @return view
     */
    var View = Marionette.ItemView.extend({

        template: _.template(Template)

    });

    module.exports = View;
});