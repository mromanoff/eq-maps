/* global Backbone, define, App, _ */

define(function (require, exports, module) {
    'use strict';

    var Form;
    var Marionette         = require('marionette');
    var FormsModel         = require('core/models/form_utils');
    var FormAddons         = require('core/helpers/backbone/forms/extensions');
    var BillingTemplate    = require('text!core/templates/forms/billing.tpl');
    var utils              = new FormsModel();

    Form = Backbone.Form.extend({

        template: _.template(BillingTemplate),

        schema: {
            nameOnCard: {
                validators: ['required', /^[a-zA-Z]'?([a-zA-Z]|\.| |-)+$/]
            },

            address1: {
                validators: ['required'],
                message: 'Please check your address',
                title: 'Billing Address 1'
            },

            address2: {
                title: 'Billing Address 2 (optional)'
            },

            city: {
                validators: ['required'],
                message: 'Please check your city'
            },

            country: {
                type: 'Select',
                validators: ['required'],
                message: 'Please check your country',
                options: utils.get('countries'),
                theme: 'black'
            },

            state: {
                title: 'State',
                type: 'Select',
                validators: ['required'],
                options: utils.get('states'),
                theme: 'black'
            },

            zipCode: {
                validators: ['required', /^\d{5}$|^\d{5}-\d{4}/]
            },

            creditCardNumber: {
                validators: [
                    function (value) {
                        var err = {
                                type: 'creditCard',
                                message: 'Please check your credit card number'
                            },
                            nonDigits = new RegExp(/[^0-9]+/g),
                            number = value.replace(nonDigits, ''),
                            pos, digit, i, subTotal, sum = 0,
                            strLen = number.length;

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
                    }
                ],
                title: 'Credit or Debit Card',
                editorAttrs: { maxlength: 20 }
            },

            securityCode: {
                validators: ['required', /^\d{3}/],
                editorAttrs: { maxlength: 4 }
            },

            expirationDate: {
                type: 'ExpirationDate',
                fieldClass: 'expiration-date',
                title: 'Expiration',
                yearStart: new Date().getFullYear(),
                yearEnd: new Date().getFullYear() + 10,
                showMonthNames: false,
                theme: 'black'
            },

            autopay: {
                title: 'Yes. Use the above card to make all other purchases, including PT sessions.',
                type: 'Checkbox',
                options: ['checked']
            }

        },
        idPrefix: 'billing-'
    });

    module.exports = Form;
});