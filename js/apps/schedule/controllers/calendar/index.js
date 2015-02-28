/**
 * @module controller/calendar
 */

define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var moment = require('moment');
    var View = require('views/calendar/index');

    var Model = Backbone.Model.extend();
    var daysHeader = new Backbone.Collection();

    /**
     * Create 7 days
     * @param {string} startDate - 2014-05-31 format
     * @returns {Backbone.Collection}
     */
    var getDates = function (startDate) {
        var i = 0;
        var date = moment(startDate);
        var model;

        for (i; i < 7; i++) {
            model = new Model({
                date: date.format('ddd'),
                day: date.format('DD'),
                month: date.format('MMM'),
                selected: i === 0 ? 'selected' : null
            });
            daysHeader.add(model);
            date.add('days', 1);
        }
        return daysHeader;
    };

    module.exports = Marionette.Controller.extend({

        index: function () {
            var date = App.filterCriteria.get('startDate');

            require(['entities/appointments'], function () {

                var promise = msgBus.reqres.request('entities:appointments', date);
                promise.done(function (appointments) {

                    // reset collection
                    daysHeader.reset();
                    daysHeader = getDates(date);

                    module.exports = new View({
                        appointments: appointments,
                        dates: daysHeader
                    });
                });

                promise.fail(function (model, jqXHR, textStatus) {
                    msgBus.reqres.request('schedule:error', { error: [model, jqXHR, textStatus]});
                });

            });
        }
    });
});