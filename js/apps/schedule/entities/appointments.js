/**
 * @module entities/appointments
 */

define(function (require) {
    'use strict';

    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var Loading = require('views/spinner');

    var loadingView = new Loading();
    var DayPart = Backbone.Model.extend({
        defaults: {
            morning: null,
            afternoon: null,
            evening: null
        }
    });

    var Appointments = Backbone.Collection.extend({
        model: DayPart
    });

    var API = {
        /**
         * @name getAppointments
         * @function
         * @returns {object} promise object
         */
        getAppointments: function () {
            var appointments = new Appointments();
            var deferred = $.Deferred();

            App.layout.content.show(loadingView);

            appointments.url = function () {
                var query = '?startDate=' + App.filterCriteria.get('startDate') + '&sessionTypeId=' + App.filterCriteria.get('sessionTypeId') + '&trainerId=' + App.filterCriteria.get('trainerId');
                return App.APIEndpoint + '/personal-training-schedule/appointments' + query;
            };

            //setTimeout(function () {
            appointments.fetch({
                success: deferred.resolve,
                error: deferred.reject
            });
            //}, 2000);
            return deferred.promise();
        }
    };

    msgBus.reqres.setHandler('entities:appointments', function () {
        return API.getAppointments();
    });
});