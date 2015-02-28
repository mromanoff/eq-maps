define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Marionette       = require('marionette');
    var Partial1Template = require('text!templates/partial1.tpl');

    /**
     * Partial View Sample
     *
     * Regular Marionette ItemView Partial
     *
     * @name Partial1
     * @class PartialView1
     * @return view
     */
    var PartialView1 = Marionette.ItemView.extend({

        template: _.template(Partial1Template)

    });

    module.exports = PartialView1;
});