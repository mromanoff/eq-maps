/* global Backbone, define, App, _ */

define(function (require, exports, module) {
    'use strict';

    var Form;
    var Marionette  = require('marionette');
    var FormAddons  = require('core/helpers/backbone/forms/extensions');
    var Template    = require('text!other_settings/templates/forms/login.tpl');

    Form = Backbone.Form.extend({

        template: _.template(Template),

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
                    'required', function checkPasscode(value, formValues) {
                        var err = {
                            type: 'Password',
                            message: 'Passcode must be 4 digit numeric'
                        };

                        if (value.length !== 4) return err;
                    }
                ]
            }

        },

        idPrefix: 'netpulse-login-'
    });

    module.exports = Form;
});