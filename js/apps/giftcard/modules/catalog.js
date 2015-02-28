define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');
    var CatalogModel = Backbone.Model.extend({
        defaults: {
            amount: null
        }
    });

    module.exports = new CatalogModel();
});