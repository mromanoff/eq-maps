define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var ReviewView = require('views/create/review');
    var ConfirmationView = require('views/create/confirmation');

    var view;

    App.flow = 'create';

    module.exports = Marionette.Controller.extend({

        index: function (date) {
            //console.log('Create: date attr', date);
            date = (App.utils.isValidDate(date)) ? date : App.utils.TOMORROW;
            //console.log('Create: date attr is valid', App.utils.isValidDate(date));

            msgBus.reqres.request('schedule:header', {
                pageTitle: 'Schedule Training'
            });

            msgBus.reqres.request('schedule:trainer:filter');

            msgBus.reqres.request('schedule:calendar:navigation', {
                startDate: date
            });

            //todo: move this to msgBus
            App.filterCriteria.set({startDate: date});

            App.analytics.set({
                action: 'add-start'
            });
        },

        review: function (appointment) {
            msgBus.reqres.request('schedule:header', { pageTitle: 'Review your session' });
            view = new ReviewView({model: appointment});

            App.layout.filter.close();
            App.layout.navigation.close();
            App.layout.content.show(view);

            App.analytics.set({
                action: 'add-review'
            });
        },

        confirmation: function (appointment) {
            // pick data.
            var data = _.pick(appointment.toJSON(), 'id', 'sessionTypeId', 'trainerId', 'startDate', 'endDate', 'message');

            require(['entities/create'], function () {
                var promise = msgBus.reqres.request('entities:create:appointment', data);
                promise.done(function (response) {

                    // update model with new id and pass APIEndpoint
                    appointment.set({
                        id: response.id,
                        APIEndpoint: App.APIEndpoint
                    });

                    msgBus.reqres.request('schedule:header', { pageTitle: 'Enjoy your workout.' });
                    view = new ConfirmationView({model: appointment});

                    App.layout.navigation.close();
                    App.layout.content.show(view);

                    App.analytics.set({
                        action: 'add-complete'
                    });
                });

                promise.fail(function (model, response, options) {
                    msgBus.reqres.request('schedule:error', response.responseJSON);
                    console.warn('RESPONSE :: ', model, response, options);
                });

            });
        }
    });
});