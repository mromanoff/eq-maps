define(function (require) {
    'use strict';

    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var Loading = require('views/spinner');

    var loadingView = new Loading();
    var Model = Backbone.Model.extend({
        defaults: {
            trainerId: null,
            sessionTypeId: null,
            startDate: null,
            endDate: null,
            message: null
        },

        url: function () {
            return App.APIEndpoint + '/personal-training-schedule/create';
        }
    });


    var API = {
        /**
         * @name createAppointment
         * @function
         * @returns {object} promise object
         */
        createAppointment: function (data) {
            var model = new Model();
            var deferred = $.Deferred();

            App.layout.content.show(loadingView);
            
            //setTimeout(function () {
            model.save(data, {
                success: function(data) {
                    deferred.resolve(data);
                },
                error: function (model, response, options) {
                    console.log('IN CREATE - ERROR model :: ', model);
                    console.log('IN CREATE - ERROR response :: ', response);
                    console.log('IN CREATE - ERROR options :: ', options);
                    deferred.reject(model, response, options);
                }
            });
            //}, 2000);
            return deferred.promise();
        }
    };

    msgBus.reqres.setHandler('entities:create:appointment', function (data) {
        return API.createAppointment(data);
    });
});



