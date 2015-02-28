define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Marionette = require('marionette');
    var Template   = require('text!templates/password/confirmation.tpl');

    /**
     * Password Confirmation View
     *
     * This is the view, template helpers and bindings for the username confirmation page
     * which is shown after a user submits the a password/edit form
     *
     * @name PasswordConfirmation
     * @class PasswordConfirmationView
     * @return view
     */
    var View = Marionette.ItemView.extend({
        template : _.template(Template)
    });

    module.exports = View;
});