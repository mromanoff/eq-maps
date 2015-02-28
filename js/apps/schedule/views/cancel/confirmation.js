define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var msgBus = require('schedule/msgbus');
    var template = require('text!templates/cancel/confirmation.tpl');

    module.exports = Marionette.ItemView.extend({
        template: _.template(template),

        initialize: function () {
            msgBus.commands.execute('scroll:top');
        }
    });
});