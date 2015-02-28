define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Marionette       = require('marionette');
    var Partial2Template = require('text!templates/partial2.tpl');

    /**
     * Partial View Sample
     *
     * Regular Marionette ItemView Partial
     *
     * @name Partial2
     * @class PartialView2
     * @return view
     */
    var PartialView2 = Marionette.ItemView.extend({

        template: _.template(Partial2Template)

    });

    module.exports = PartialView2;
});