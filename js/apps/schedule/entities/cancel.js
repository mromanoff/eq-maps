define(function (require) {
    'use strict';

    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var Loading = require('views/spinner');

    var loadingView = new Loading();
    var Model = Backbone.Model.extend({
        defaults: {
            id: null, //"BC494EF7-60E8-4AF0-8A19-5786D2ABAE62",
            cancelAll: null,  // true|false
            message: null
        },

        url: function () {
            return App.APIEndpoint + '/personal-training-schedule/cancel';
        }
    });

    var API = {
        /**
         * @name cancelAppointment
         * @function
         * @returns {object} promise object
         */
        cancelAppointment: function (data) {
            var model = new Model();
            var deferred = $.Deferred();

            App.layout.content.show(loadingView);

            //setTimeout(function () {
            model.save(data, {
                success: function(data) {
                    deferred.resolve(data);
                },
                error: function(model, response, options){
                    deferred.reject(model, response, options);
                }
            });
            //}, 2000);
            return deferred.promise();
        }
    };

    msgBus.reqres.setHandler('entities:cancel:appointment', function (data) {
        return API.cancelAppointment(data);
    });
});
