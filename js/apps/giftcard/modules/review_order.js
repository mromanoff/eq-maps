define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');
    
    var ReviewOrder = Backbone.Model.extend({
        defaults: {
            cardType: null,
            cardLastFourDigits: null,
            expirationDate: null,
            shortExpirationDate: null,
            address1: null,
            address2: null,
            city: null,
            state: null,
            zipCode: null,
            recipientName: null,
            senderName: null,
            recipientEmail: null,
            senderEmail: null,
            price: null,
            cardImg: null,
            message: null,
            fromReviewOrderPage: false
        }
    });

    module.exports = ReviewOrder;
});