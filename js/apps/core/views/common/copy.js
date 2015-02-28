define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');

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

        template: _.template('<%= copy %>'),

        tagName: 'div',

        className: 'centered-copy'

    });

    module.exports = View;
});