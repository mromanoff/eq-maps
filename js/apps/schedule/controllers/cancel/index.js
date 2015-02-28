define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var CancelView = require('views/cancel/index');
    var ReviewView = require('views/cancel/review');
    var ConfirmationView = require('views/cancel/confirmation');

    var view;

    App.flow = 'cancel';

    module.exports = Marionette.Controller.extend({

        index: function (id) {
            msgBus.reqres.request('schedule:header', { pageTitle: 'Cancel your session' });

            require(['entities/appointment'], function () {
                var promise = msgBus.reqres.request('entities:appointment', id);
                promise.done(function (appointment) {
                    view = new CancelView({
                        model: appointment
                    });
                    App.layout.content.show(view);

                    App.analytics.set({
                        action: 'delete-start'
                    });
                });

                promise.fail(function (model, jqXHR, textStatus) {
                    msgBus.reqres.request('schedule:error', { error: [model, jqXHR, textStatus]});
                });
            });
        },

        review: function (appointment) {
            msgBus.reqres.request('schedule:header', { pageTitle: 'Cancel your session' });

            view = new ReviewView({model: appointment});
            App.layout.content.show(view);

            App.analytics.set({
                action: 'delete-review'
            });
        },

        confirmation: function (appointment) {
            // pick data.
            var data = _.pick(appointment.toJSON(), 'id', 'cancelAll', 'message');

            require(['entities/cancel'], function () {
                var promise = msgBus.reqres.request('entities:cancel:appointment', data);
                promise.done(function (response) {

                    // update model with new id and pass APIEndpoint
                    appointment.set({
                        id: response.id,
                        APIEndpoint: App.APIEndpoint
                    });

                    msgBus.reqres.request('schedule:header', { pageTitle: 'Your session is canceled' });
                    view = new ConfirmationView({model: appointment});
                    App.layout.content.show(view);

                    App.analytics.set({
                        action: 'delete-complete'
                    });
                });

                promise.fail(function (model, response, options) {
                    msgBus.reqres.request('schedule:error', model, response.responseJSON, options);
                });
            });
        }
    });
});