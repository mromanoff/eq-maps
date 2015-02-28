define(function (require, exports, module) {
    'use strict';


    // Alias the module for easier identification.
    var Contact = module.exports;

    var Form = Backbone.Form;
    Form.validators.errMessages.phone = 'Please check your phone number';

    Form.validators.phone = function (options) {
        options = _.extend({
            type: 'phone',
            message: this.errMessages.phone,
            regexp: /[0-9]+(?:\.[0-9]*)?/
        }, options);

        return Form.validators.regexp(options);
    };


    Contact.Model = Backbone.Model.extend();

    Contact.Template = '\
        <form class="large white forms-spa">\
            <span data-fieldsets></span>\
        </form>';

    Contact.Form = Backbone.Form.extend({
        model: new Contact.Model(),
        template: _.template(Contact.Template),
        schema: {
            email: {
                validators: ['required', 'email']
            },
            phone: {
                validators: ['required', 'phone']
            }
        },
        idPrefix: 'contact-',
        fieldsets: [
            {
                fields: ['phone', 'email']
            }
        ]
    });
});