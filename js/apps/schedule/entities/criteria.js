define(function (require, exports, module) {
    'use strict';

    var msgBus = require('schedule/msgbus');
    var Backbone = require('backbone');

    module.exports = Backbone.Model.extend({
        defaults: {
            trainerId: null,
            trainerName: null,
            sessionTypeId: null,
            duration: null,
            startDate: null
        },

        initialize: function () {
            this.on('change', this.updateCalendar);
        },

        updateCalendar: function () {
            msgBus.reqres.request('schedule:calendar', {
                startDate: this.get('startDate'),
                trainerId: this.get('trainerId'),
                sessionTypeId: this.get('sessionTypeId')
            });
        }
    });
});
