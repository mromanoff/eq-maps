define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');

    /**
     * Form Utilities Model
     *
     * Stores common things on all forms, like U.S. states, countries, validators, etc.
     *
     * @augments Backbone.Model
     * @name FormUtils
     * @class FormUtilsModel
     * @return model
     */
    var FormUtilsModel = Backbone.Model.extend({

        defaults: {

            creditCards: [
                { val: '', label: '-Select-' },
                { val: 'VISA', label: 'Visa' },
                { val: 'MASTERCARD', label: 'Mastercard' }
            ],

            countries:  [
                { val: 'USA', label: 'USA' },
                { val: 'UK', label: 'UK' },
                { val: 'CA', label: 'Canada' }
            ],

            states : [
                { val: '', label: '-Select-' },
                { val: 'AL', label: 'AL' },
                { val: 'AK', label: 'AK' },
                { val: 'AZ', label: 'AZ' },
                { val: 'AR', label: 'AR' },
                { val: 'CA', label: 'CA' },
                { val: 'CO', label: 'CO' },
                { val: 'CT', label: 'CT' },
                { val: 'DE', label: 'DE' },
                { val: 'DC', label: 'DC' },
                { val: 'FL', label: 'FL' },
                { val: 'GA', label: 'GA' },
                { val: 'HI', label: 'HI' },
                { val: 'ID', label: 'ID' },
                { val: 'IL', label: 'IL' },
                { val: 'IN', label: 'IN' },
                { val: 'IA', label: 'IA' },
                { val: 'KS', label: 'KS' },
                { val: 'KY', label: 'KY' },
                { val: 'LA', label: 'LA' },
                { val: 'ME', label: 'ME' },
                { val: 'MD', label: 'MD' },
                { val: 'MA', label: 'MA' },
                { val: 'MI', label: 'MI' },
                { val: 'MN', label: 'MN' },
                { val: 'MS', label: 'MS' },
                { val: 'MO', label: 'MO' },
                { val: 'MT', label: 'MT' },
                { val: 'NE', label: 'NE' },
                { val: 'NV', label: 'NV' },
                { val: 'NH', label: 'NH' },
                { val: 'NJ', label: 'NJ' },
                { val: 'NM', label: 'NM' },
                { val: 'NY', label: 'NY' },
                { val: 'NC', label: 'NC' },
                { val: 'ND', label: 'ND' },
                { val: 'OH', label: 'OH' },
                { val: 'OK', label: 'OK' },
                { val: 'OR', label: 'OR' },
                { val: 'PA', label: 'PA' },
                { val: 'RI', label: 'RI' },
                { val: 'SC', label: 'SC' },
                { val: 'SD', label: 'SD' },
                { val: 'TN', label: 'TN' },
                { val: 'TX', label: 'TX' },
                { val: 'UT', label: 'UT' },
                { val: 'VT', label: 'VT' },
                { val: 'VA', label: 'VA' },
                { val: 'WA', label: 'WA' },
                { val: 'WV', label: 'WV' },
                { val: 'WI', label: 'WI' },
                { val: 'WY', label: 'WY' }
            ],

            monthNames : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

            phoneTypes: ['Home', 'Mobile', 'Work'],

            phoneCarriers: ['AT&T', 'Sprint', 'T-Mobile', 'Verizon']

        }

    });

    module.exports = FormUtilsModel;
});