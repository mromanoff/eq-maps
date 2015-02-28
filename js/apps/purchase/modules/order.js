define(function (require, exports, module) {
    'use strict';

    var App = require('app');
    var transaction = App.store.transaction; // Alias the model for easier identification.
    var Order = module.exports;

    var packageId;
    var pkg;


//    var formatCurrency = function(number, dec, dsep, tsep) {
//        if (isNaN(number) || number == null) return '';
//
//        number = number.toFixed(~~dec);
//        tsep = typeof tsep == 'string' ? tsep : ',';
//
//        var parts = number.split('.'), fnums = parts[0],
//            decimals = parts[1] ? (dsep || '.') + parts[1] : '';
//
//        return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
//    };



    var formatCurrency = function (num) {
        num = num.toString().replace(/\$|\,/g, '');
        //Check whether a number is an illegal number
        if (isNaN(num)) {
            num = '0';
        }

        num = Math.floor(num * 100 + 0.50000000001);
        var cents = num % 100;
        num = Math.floor(num / 100).toString();
        if (cents < 10) {
            cents = '0' + cents;
        }
        for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
            num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
        }
        return '$' + num + '.' + cents;
    };

    Order.View = Backbone.View.extend({
        manage: true,
        template: 'order',

        initialize: function () {
            packageId = transaction.get('selectedPackage').packageId;
            pkg = transaction.attributes.packages.get(packageId);
        },

        serialize: function () {
            if (!_.isNull(transaction.get('priceAfterTax'))) {
                return {
                    tier: pkg.get('tier'),
                    quantity: pkg.get('quantity'),
                    priceAfterTax: formatCurrency(pkg.get('priceAfterTax')),
                    unitPrice: formatCurrency(pkg.get('unitPrice'))
                };
            }
            return false;
        }
    });
});


