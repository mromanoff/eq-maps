/* global consts */

define(function (require, exports, module) {
    'use strict';

    //var jsonPath = consts.APP + '/data/';

    module.exports = {

        /*
        catalogUrl: jsonPath + 'catalog.json',
        paymentInfoUrl: jsonPath + 'paymentinfo.json',
        */

        catalogUrl: consts.MOCKS + '/gift-card/catalog',
        paymentInfoUrl: consts.MOCKS + '/billing/billing-information',
        updatePaymentInfoUrl: consts.MOCKS + '/billing/update',
        confirmPaymentInfoUrl: consts.MOCKS + '/gift-card/purchase',
        homePageUrl: consts.HOME,
        //giftCardImageUrl: consts.MOCKS + '/gift-card/backgrounds/05d4ba09-4e77-421b-b7f5-67f26593912d'
        printCardUrl: function (giftCardId) {
            return consts.MOCKS + '/me/rewards/giftcard/print?gcNumber=' + giftCardId + '&isMemberReward=false';       
        },
        giftCardImageUrl: function (thumbnailID) {
            return consts.MOCKS + '/gift-card/backgrounds/' + thumbnailID;
        }
    };
});


