/**
 * @module entities/appointment
 */

define(function (require) {
    'use strict';

    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var Loading = require('views/spinner');

    var loadingView = new Loading();
    var Appointment = Backbone.Model.extend({});

    var API = {
        /**
         * @name getAppointment
         * @function
         * @returns {object} promise object
         */
        getAppointment: function (id) {
            var appointment = new Appointment({id: id});
            var deferred = $.Deferred();

            App.layout.content.show(loadingView);
            appointment.urlRoot = function () {
                return App.APIEndpoint + '/personal-training-schedule/appointments';
            };

            //setTimeout(function () {
            appointment.fetch({
                success: deferred.resolve,
                error: deferred.reject
            });
            //}, 2000);
            return deferred.promise();
        }
    };

    msgBus.reqres.setHandler('entities:appointment', function (id) {
        return API.getAppointment(id);
    });

});