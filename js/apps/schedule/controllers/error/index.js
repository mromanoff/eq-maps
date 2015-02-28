define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var Model = require('entities/error');
    var View = require('views/error');

    var model = new Model();

    module.exports = Marionette.Controller.extend({
        initialize: function (options) {
            msgBus.reqres.request('schedule:header', { pageTitle: 'Error', subTitle: null });
            // close filters if it was open before
            App.layout.filter.close();
            // close navigation if it was open before
            App.layout.navigation.close();
            console.log('options :: ', options);
            model.set(options.error[1].error);
            App.layout.content.show(new View({ model: model }));
        }
    });
});