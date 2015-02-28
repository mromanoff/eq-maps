define(function (require, exports, module) {
    'use strict';

    var Wreqr = require('backbone.wreqr');
    var AppController = require('controllers/app_controller');

    var controller = new AppController();


    var msgBus = {
        reqres: new Wreqr.RequestResponse(),
        commands: new Wreqr.Commands(),
        events: new Wreqr.EventAggregator()
    };


    msgBus.commands.setHandler('scroll:top', function () {
        return controller.scroll();
    });

    msgBus.reqres.setHandler('schedule:calendar:navigation', function (options) {
        return controller.navigation(options);
    });

    msgBus.reqres.setHandler('schedule:header', function (options) {
        return controller.header(options);
    });

    msgBus.reqres.setHandler('schedule:trainer:filter', function () {
        return controller.trainerFilter();
    });

    msgBus.reqres.setHandler('schedule:calendar', function () {
        return controller.calendar();
    });

    msgBus.reqres.setHandler('schedule:error', function (model, response, options) {
        return controller.error(model, response, options);
    });

    msgBus.reqres.setHandler('schedule:create:review', function (id) {
        return controller.createReview(id);
    });

    msgBus.reqres.setHandler('schedule:create:confirmation', function (model) {
        return controller.createConfirmation(model);
    });

    msgBus.reqres.setHandler('schedule:cancel', function (id) {
        return controller.cancel(id);
    });

    msgBus.reqres.setHandler('schedule:cancel:review', function (appointment) {
        return controller.cancelReview(appointment);
    });

    msgBus.reqres.setHandler('schedule:cancel:confirmation', function (appointment) {
        return controller.cancelConfirmation(appointment);
    });

    msgBus.reqres.setHandler('schedule:update', function (id) {
        return controller.update(id);
    });

    msgBus.reqres.setHandler('schedule:update:review', function (appointment) {
        return controller.updateReview(appointment);
    });

    msgBus.reqres.setHandler('schedule:update:confirmation', function (appointment) {
        return controller.updateConfirmation(appointment);
    });


    module.exports = msgBus;

});