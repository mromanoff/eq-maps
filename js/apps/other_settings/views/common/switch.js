/* global, define, _ */

define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');

    /**
     * Username Confirmation View
     *
     * This is the view, template helpers and bindings for the username confirmation page
     * which is shown after a user submits the a username/edit form
     *
     * @name UsernameConfirmation
     * @class UsernameConfirmationView
     * @return view
     */
    var View = Marionette.ItemView.extend({
        template : _.template(Template)
    });

    module.exports = View;
});