define(function (require, exports, module) {
    'use strict';

    module.exports = Backbone.Model.extend({
        defaults: {
            pageTitle: null,
            subTitle: null
        }
    });
});
