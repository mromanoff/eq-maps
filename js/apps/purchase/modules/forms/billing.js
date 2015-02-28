define(function (require, exports, module) {
    'use strict';

    var Forms = require('backbone.forms');

    var Billing = module.exports;

    Forms.validators.errMessages.creditCard = 'Please check your credit card number';
    Forms.validators.errMessages.zipCode = 'Please check your zip code';
    Forms.validators.errMessages.creditCardSecurityCode = 'Please check security code';
    Forms.validators.errMessages.creditCardExpDate = 'Expiration date is in the past. Please enter a valid date';

    Forms.validators.creditCard = function (options) {

        options = _.extend({
            type: 'creditCard',
            message: this.errMessages.creditCard
        }, options);

        return function creditCard(value) {
            options.value = value;

            var err = {
                type: options.type,
                message: _.isFunction(options.message) ? options.message(options) : options.message
            };
            var nonDigits = new RegExp(/[^0-9]+/g);
            var number = value.replace(nonDigits, '');
            var pos, digit, i, subTotal, sum = 0;
            var strLen = number.length;

            if (strLen < 13) {
                return err;
            }

            for (i = 0; i < strLen; i++) {
                pos = strLen - i;
                digit = parseInt(number.substring(pos - 1, pos), 10);
                if (i % 2 === 1) {
                    subTotal = digit * 2;
                    if (subTotal > 9) {
                        subTotal = 1 + (subTotal - 10);
                    }
                } else {
                    subTotal = digit;
                }
                sum += subTotal;
            }
            if (sum > 0 && sum % 10 === 0) {
                return false;
            }
            return err;
        };
    };

    Forms.validators.expDate = function (options) {

        options = _.extend({
            type: 'ExpirationDate',
            message: this.errMessages.creditCardExpDate
        }, options);

        return function expDate(value) {

            //function removezero(n) {
            //    return n.replace(/^0+/, '');
            //}

            function getMonthIndex(monthname){
                var num = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ].indexOf(monthname.toLowerCase());
                return num;
            }

            value = value.toString();
            var selectedMonth = getMonthIndex(value.substring(4, 7));
            var selectedYear = parseInt(value.substring(11, 15), 10);
            var currentMonth = new Date().getMonth();
            var currentYear = new Date().getFullYear();
            var err = {
                type: options.type,
                message: _.isFunction(options.message) ? options.message(options) : options.message
            };


            if(currentYear === selectedYear){

                if(currentMonth > selectedMonth){
                    return err;
                }
            }


        };

    };

    Forms.validators.zipCode = function (options) {
        options = _.extend({
            type: 'zipCode',
            message: this.errMessages.zipCode,
            regexp: /^\d{5}$|^\d{5}-\d{4}/
        }, options);

        return Forms.validators.regexp(options);
    };

    Forms.validators.creditCardSecurityCode = function (options) {
        options = _.extend({
            type: 'zipCode',
            message: this.errMessages.creditCardSecurityCode,
            regexp: /^\d{3}/
        }, options);

        return Forms.validators.regexp(options);
    };

    /**
     * Custom Editor for CC expiration date select fields
     schema: {
     expirationDate: {
        type: 'ExpirationDate',
        title: 'Credit Card Expiration date'
        }
     */
    Forms.editors.Date.monthNames = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    Forms.editors.ExpirationDate = Forms.editors.Date.extend({}, {
        //STATICS
        template: _.template('\
            <div class="expiration">\
              <span style="display:none" class="date"><span class="option"></span><select data-type="date"><%= dates %></select></span>\
              <span class="dropdown white half month"><span class="option"></span><select data-type="month"><%= months %></select></span>\
              <span class="dropdown white half year"><span class="option"></span><select data-type="year"><%= years %></select></span>\
            </div>\
          ', null, Forms.templateSettings)
    });

    Billing.Model = Backbone.Model.extend({});


    // Forms Templates
    Billing.Templates = {};

    Billing.Templates.form = '\
        <form class="large white forms-spa">\
            <fieldset data-fields="nameOnCard,address1,address2,city,state,zipCode"></fieldset>\
            <fieldset data-fields="creditCardNumber,expirationDate,securityCode,updateCardOnFile"></fieldset>\
        </form>';

    Billing.Templates.select = _.template('<div><label for="state">State</label><span data-editor class="dropdown block white"><span class="option"><%= title %></span></span></div>');

    Billing.Templates.checkbox = _.template('<div class="checkbox"><label><span data-editor></span><span class="icon-check checkbox-replacement"></span></label><span class="label"><%= title %></span></div>');

    // Billing Collection
    Billing.Collection = {};

    Billing.Collection.states = [
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
    ];

    Billing.Form = Forms.extend({
        model: new Billing.Model(),
        template: _.template(Billing.Templates.form),
        schema: {
            nameOnCard: {
                fieldClass: 'full',
                //validators: ['required', /^[a-zA-Z]'?([a-zA-Z]|\.| |-)+$/]
                validators: ['required', /([a-zA-Z]|\.| |-|'|")+$/]
            },
            address1: {
                fieldClass: 'half',
                validators: ['required'],
                message: 'Please check your address',
                title: 'Billing Address 1'
            },
            address2: {
                fieldClass: 'half',
                title: 'Billing Address 2 (optional)'
            },
            city: {
                fieldClass: 'half',
                validators: ['required'],
                message: 'Please check your city'
            },
            state: {
                title: 'State',
                type: 'Select',
                fieldClass: 'quarter',
                template: Billing.Templates.select,
                validators: ['required'],
                options: Billing.Collection.states
            },
            zipCode: {
                title: 'Zip Code',
                fieldClass: 'quarter',
                validators: ['required', 'zipCode']
            },
            creditCardNumber: {
                title: 'Credit or Debit Card',
                fieldClass: 'half',
                //help: '<pre>Some card numbers you can use to test the code.<br>1234-5678-9012-3456 - Invalid<br>4111 1111 1111 1111 - Valid (MC/Visa Like)<br>3111 111111 11117 - Valid (Amex Like)<br>6011111111111117 - Valid (Discover Like)',
                validators: ['required', 'creditCard'],
                editorAttrs: { maxlength: 20 }
            },

            securityCode: {
                fieldClass: 'quarter',
                validators: ['required', 'creditCardSecurityCode'],
                editorAttrs: { maxlength: 4 }
            },

            expirationDate: {
                type: 'ExpirationDate',
                fieldClass: 'quarter',
                title: 'cc expiration',
                validators: ['required', 'expDate'],
                yearStart: new Date().getFullYear(),
                yearEnd: new Date().getFullYear() + 10
            },

            updateCardOnFile: {
                title: 'Save this card for future purchases',
                type: 'Checkbox',
                fieldClass: 'full checked',
                template: Billing.Templates.checkbox,
                //FindeditorAttrs: {'checked': 'checked'},
                options: ['checked']
            }
        },

        idPrefix: 'billing-'
    });
});