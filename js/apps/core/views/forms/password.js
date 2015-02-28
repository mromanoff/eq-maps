/* global Backbone, define, App, _ */

define(function (require, exports, module) {
    'use strict';

    var Form;
    var Marionette = require('marionette');
    var Model      = require('core/models/form_utils');
    var Addons     = require('core/helpers/backbone/forms/extensions');
    var Template   = require('text!core/templates/forms/password.tpl');

    Form = Backbone.Form.extend({

        template: _.template(Template),

        schema: {

            currentPassword: {
                title: 'Type in your current Password',
                type: 'Password'
            },

            newPassword: {
                title: 'Type in new Password',
                type: 'Password',
                editorAttrs: { maxlength: 20 },
                validators: [
                    'required',
                    { type: 'match', field: 'passwordConfirm', message: 'Passwords must match!' },
                    { type: 'regexp', regexp: /^.*(?!.*\s)(?=.*\d)^.*(?!.*\s)(?=.*[a-zA-Z]).*$/, message: 'Atleast one letter and one digit is required!' }
                ]
            },

            passwordConfirm: {
                title: 'Type Again',
                type: 'Password',
                editorAttrs: { maxlength: 20 },
                validators: ['required']
            }

        },
        idPrefix: 'password-'
    });

    module.exports = Form;
});