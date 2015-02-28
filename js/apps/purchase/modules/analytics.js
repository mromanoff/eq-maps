define(function (require, exports, module) {
    'use strict';

    // Alias the module for easier identification.
    var Analytics = module.exports;

    Analytics.Model = {};

    //use empty string as a default, coz omniture DTM doesn't like null value
    Analytics.Model.Omniture = Backbone.Model.extend({
        defaults: {
            step: '',
            productTier: '',
            productPack: '',
            productDuration: '',
            productCost: '',
            orderId: ''
        },

        initialize: function () {
            this.on('change', this.save, this);
        },

        save: function () {
            // update global tagData.ptPurchase object
            //console.log('Save Analytics', this.toJSON());
            window.tagData.ptPurchase = this.toJSON();

            // TODO: commented for debugging //
            //_satellite.pageBottom();
        }
    });
});