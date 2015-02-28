/* global Backbone, define, App, _ */

define(function (require, exports, module) {
    'use strict';

    var Form;
    var Marionette  = require('marionette');
    var FormsModel  = require('core/models/form_utils');
    var FormAddons  = require('core/helpers/backbone/forms/extensions');
    var Template    = require('text!core/templates/forms/account.tpl');
    var utils       = new FormsModel();

    Form = Backbone.Form.extend({

        template: _.template(Template),

        schema: {

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

            state: {
                title: 'State',
                type: 'Select',
                validators: ['required'],
                options: utils.get('states')
            },

            country: {
                type: 'Select',
                validators: ['required'],
                message: 'Please check your country',
                options: utils.get('countries')
            },

            zipCode: {
                validators: ['required', /^\d{5}$|^\d{5}-\d{4}/]
            },

            phone: {
                title: 'Phone: the top one will be displayed as a primary.',
                type: 'Text',
            },

            phoneTypes: {
                title:'',
                type: 'Select',
                options: utils.get('phoneTypes')
            },

            phoneCarrier: {
                title:'',
                type: 'Select',
                options: utils.get('phoneCarriers')
            },

            homePhone: {
                type: 'Hidden'
            },

            mobilePhone: {
                type: 'Hidden'
            },

            workPhone: {
                type: 'Hidden'
            }

        },
        idPrefix: 'account-'
    });

    module.exports = Form;
});