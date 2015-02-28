/* global Backbone, define, App, _ */

define(function (require, exports, module) {
    'use strict';

    var Form;
    var Marionette = require('marionette');
    var FormsModel = require('core/models/form_utils');
    var FormAddons = require('core/helpers/backbone/forms/extensions');
    var Template = require('text!core/templates/forms/username.tpl');

    Form = Backbone.Form.extend({

        template: _.template(Template),

        schema: {

            email: {
                title: 'Type a new email address',
                validators: [
                    'required', 'email'                   
                ]
            },

            emailConfirm: {
                title: 'Type again',
                validators: ['required', 'email',
              function checkEmail(value, formValues) {
                  var err = {
                      type: 'confirmEmail',
                      message: 'Email must match!'
                  };
                  if (value.toLowerCase() != formValues.email.toLowerCase())
                      return err;
              }
                ]

            }

        },
        idPrefix: 'username-'
    });

    module.exports = Form;
});