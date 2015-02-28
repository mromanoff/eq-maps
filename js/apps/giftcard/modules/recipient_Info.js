define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');
    
    var RecipientInfoModel = Backbone.Model.extend({
        defaults: {
            itemNumber: null,
            price: null,
            firstName: null,
            lastName: null,
            email: null,
            reTypeEmail: null,
            message: null
        }
    });

    module.exports = RecipientInfoModel;
});