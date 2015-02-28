define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');
    
    var GiftcardResponseModel = Backbone.Model.extend({
        defaults: {
            transactionNumber: null,
            giftCardNumber: null,
            giftCardNumberEncrypted: null
        }
    });

    module.exports = GiftcardResponseModel;
});