define(function (require, exports, module) {
    'use strict';

    // get purchase App
    var App = require('app');

    // Alias the module for easier identification.
    var ValidatePassword = module.exports;

    ValidatePassword.Model = Backbone.Model.extend({
        url: App.envConfig.validatePasswordUrl
    });

    ValidatePassword.Template = '\
        <form class="mid white forms-spa">\
             <div data-fields="password">\
                <h5 class="notes">for security purposes, please re-enter your password.</h5>\
            </div>\
            <button type="button" class="btn button box white small validatePassword">Check</button>\
        </form>';

    ValidatePassword.Form = Backbone.Form.extend({
        model: new ValidatePassword.Model(),
        template: _.template(ValidatePassword.Template),
        schema: {
            password: {
                title: 'Password',
                type: 'Password',
                validators: ['required']
            }
        },
        idPrefix: 'validate-'
    });
});