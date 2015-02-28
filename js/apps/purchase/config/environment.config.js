/* global consts */

define(function (require, exports, module) {
    'use strict';

    module.exports = {

        // return json
        tiersUrl: consts.MOCKS + '/tiers',
        inventoryUrl: consts.MOCKS + '/inventory',
        billingInfoUrl: consts.MOCKS + '/billing-information',
        packsizeUrl: consts.MOCKS + '/packsize',
        purchaseUrl: consts.MOCKS + '/purchase-package',
        purchaseWithCardOnFileUrl: consts.MOCKS + '/purchase-package-with-card-on-file',
        validatePasswordUrl: consts.MOCKS + '/validate-password'
    };
});


