define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var moment = require('moment');
    var ReviewView = require('views/update/review');
    var ConfirmationView = require('views/update/confirmation');

    var view;
    var originalAppointment = null;

    App.flow = 'update';

    module.exports = Marionette.Controller.extend({

        index: function (id) {
            require(['entities/appointment'], function () {
                var promise = msgBus.reqres.request('entities:appointment', id);
                promise.done(function (appointment) {

                    originalAppointment = appointment;
                    var date = appointment.get('startDate');

                    var startDate = moment(date).format('YYYY-MM-DD');
                    var uiDate = moment(date).format('MMM D @ h:mm A');

                    msgBus.reqres.request('schedule:header', {
                        pageTitle: 'Reschedule Training',
                        subTitle: 'edit the time for <strong>' + uiDate + '</strong> and notify your trainer'
                    });

                    msgBus.reqres.request('schedule:calendar:navigation', {
                        startDate: startDate
                    });

                    App.filterCriteria.set({
                        startDate: startDate,
                        trainerId: appointment.get('trainerId'),
                        trainerName: appointment.get('trainerFirstName') + ' ' + appointment.get('trainerLastName'),
                        sessionTypeId: appointment.get('sessionTypeId'),
                        duration: appointment.get('duration')
                    });
                    // if user clicked on 'Edit Session' from Update reivew page.
                    // trigger change on model. even model is still the same.
                    App.filterCriteria.trigger('change');

                    App.analytics.set({
                        action: 'edit-start'
                    });
                });

                promise.fail(function (model, jqXHR, textStatus) {
                    msgBus.reqres.request('schedule:error', { error: [model, jqXHR, textStatus]});
                });
            });
        },

        review: function (appointment) {
            setTimeout(function () {
                msgBus.reqres.request('schedule:header', {
                    pageTitle: 'Review your session',
                    subTitle: null
                });

                view = new ReviewView({
                    model: appointment,
                    original: originalAppointment
                });



                App.layout.navigation.close();
                App.layout.content.show(view);

                App.analytics.set({
                    action: 'edit-review'
                });
            }, 500);
        },

        confirmation: function (appointment) {
            // get id from original appointment and asign to new appointment
            appointment.set({id: originalAppointment.id});  //

            // pick data.
            var data = _.pick(appointment.toJSON(), 'id', 'sessionTypeId', 'trainerId', 'startDate', 'endDate', 'message');

            require(['entities/update'], function () {
                var promise = msgBus.reqres.request('entities:update:appointment', data);
                promise.done(function (response) {

                    // update model with new id and pass APIEndpoint
                    appointment.set({
                        id: response.id,
                        APIEndpoint: App.APIEndpoint
                    });

                    msgBus.reqres.request('schedule:header', {
                        pageTitle: 'Enjoy your workout.',
                        subTitle: null
                    });

                    view = new ConfirmationView({
                        model: appointment,
                        original: originalAppointment
                    });

                    App.layout.navigation.close();
                    App.layout.content.show(view);

                    App.analytics.set({
                        action: 'edit-complete'
                    });
                });

                promise.fail(function (model, response, options) {
                    msgBus.reqres.request('schedule:error', model, response.responseJSON, options);
                });

            });
        }
    });
});