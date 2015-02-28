/* global Backbone, define, App, _ */

define(function (require, exports, module) {
    'use strict';

    var Form;
    var Marionette  = require('marionette');
    var FormAddons  = require('core/helpers/backbone/forms/extensions');
    var Template    = require('text!other_settings/templates/forms/register.tpl');

    Form = Backbone.Form.extend({

        template: _.template(Template),

        events: {
            'measurementUnit:change': function() {
                console.warn('xxxxxxx');
            }
        },

        schema: {

            clientLoginId: {
                title: 'xID',
                validators: [
                    'required', function checkLoginId(value, formValues) {
                        var err = {
                            //type: 'Password',
                            message: 'xID must be at least 10 digits'
                        };

                        if (isNaN(parseFloat(value))) {
                            return { message: 'xID must be all numbers' };
                        }

                        if (value.length < 10) return err;
                    }
                ]
            },

            passcode: {
                title: 'Passcode',
                type: 'Password',
                validators: [
                    'required',
                    { type: 'match', field: 'confirmPasscode', message: 'Passcode must match!' },
                    function checkPasscode(value, formValues) {
                        var err = {
                            type: 'Password',
                            message: 'Passcode must be 4 digit numeric'
                        };

                        if (value.length !== 4) return err;
                    }
                ]
            },

            confirmPasscode: {
                title: 'Type Again',
                type: 'Password',
                validators: ['required']
            },

            gender: {
                type: 'Radio',
                options: ['Male', 'Female'],
                validators: ['required']
            },

            birthDay: {
                type: 'ExpirationDate',
                fieldClass: 'expiration-date',
                title: 'Birthday',
                yearStart: new Date().getFullYear(),
                yearEnd: new Date().getFullYear() - 70,
                showMonthNames: true,
                showDays: true,
                theme: 'black'
            },

            weight: {
                title: 'Weight',
                validators: ['required']
            },

            measurementUnit: {
                type: 'Radio',
                options: ['Imperial/U.S.', 'Metric']
            },

            acceptedTerms: {
                title: 'I agree to the <a href="https://equinox.netpulse.com/legal/en-us/terms/" target="_blank">terms of service.</a>',
                type: 'Checkbox',
                options: ['checked'],
                validators: ['required']
            }

        },
        idPrefix: 'netpulse-login-'
    });

    module.exports = Form;
});