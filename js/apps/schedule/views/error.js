define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var msgBus = require('schedule/msgbus');
    var template = require('text!templates/error.tpl');

    module.exports = Marionette.ItemView.extend({
        className: 'error',
        template: _.template(template),
        initialize: function () {
            console.log('error view: this.model ', this.model.toJSON());

            msgBus.commands.execute('scroll:top');
        }
    });
});