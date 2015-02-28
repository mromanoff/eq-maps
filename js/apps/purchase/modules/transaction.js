define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');
    var TransactionModel = Backbone.Model.extend({
        defaults: {
            packages: null, // cache fetched collection packages here
            inventory: null, //cache fetched inventory

            packageId: null,

            selectedPackage: {
                packageId: null,
                tier: 'Select',
                duration: 'Select',
                label: 'Select'
            },

            scheduleEquifit: null,

            messages: null,
            errors: null,

            email: null,
            phone: null,
            password: null,
            validatePassword: null,

            hasCardOnFile: null,
            isCardExpired: null,
            cardExpiredOn: null,
            useCardOnFile: null,
            updateCardOnFile: null,
            cardLastFourDigits: null,

            nameOnCard: null,
            cardType: null,
            cardLastFourDigitsNew: null,
            creditCardNumber: null,
            securityCode: null,
            expirationDate: null,
            address1: null,
            address2: null,
            city: null,
            state: null,
            zipCode: null,

            orderNumber: null
        },

        getSelectedPackage: function () {
            var id =  this.attributes.selectedPackage.packageId;

            if (_.isNull(id)) {
                return false;
            }
            else {
                var selectedPackage = this.attributes.packages.get(id);
                return selectedPackage.toJSON();
            }
        },


        initialize: function () {
            this.on('change', this.printToConsole, this);
        },

        printToConsole: function () {
            console.warn('Transaction module updated', this.toJSON());
        }

    });

    module.exports = new TransactionModel();
});