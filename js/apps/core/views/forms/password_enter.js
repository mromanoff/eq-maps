/* global Backbone, define, App, _ */

define(function (require, exports, module) {
    'use strict';

    var Form;
    var Marionette = require('marionette');
    var Model      = require('core/models/form_utils');
    var Addons     = require('core/helpers/backbone/forms/extensions');
    var Template   = require('text!core/templates/forms/password_enter.tpl');

    Form = Backbone.Form.extend({

        template: _.template(Template),

        schema: {

            password: {
                title: 'Type in your current Password',
                type: 'Password',
                validators: ['required']
            },

            email: {
                title: 'Type a new email address',
                type: 'Hidden'
            }

        },
        idPrefix: 'password-'
    });

    module.exports = Form;
});