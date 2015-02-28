define(function (require) {
    'use strict';

    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var Loading = require('views/spinner');

    var loadingView = new Loading();
    var Model = Backbone.Model.extend({
        defaults: {
            id: null,
            trainerId: null,
            startDate: null,
            endDate: null,
            sessionTypeId: null,
            message: null
        },

        url: function () {
            return App.APIEndpoint + '/personal-training-schedule/update';
        }
    });

    var API = {
        /**
         * @name updateAppointment
         * @function
         * @returns {object} promise object
         */
        updateAppointment: function (data) {
            var model = new Model();
            var deferred = $.Deferred();

            App.layout.content.show(loadingView);

            //setTimeout(function () {
            model.save(data, {
                success: function(data) {
                    deferred.resolve(data);
                },
                error: function(model, response, options){
                    //console.log('IN UPDATE - ERROR model :: ', model);
                    //console.log('IN UPDATE - ERROR response :: ', response);
                    //console.log('IN UPDATE - ERROR options :: ', options);
                    deferred.reject(model, response, options);
                }
            });
            //}, 2000);
            return deferred.promise();
        }
    };

    msgBus.reqres.setHandler('entities:update:appointment', function (data) {
        return API.updateAppointment(data);
    });

});
