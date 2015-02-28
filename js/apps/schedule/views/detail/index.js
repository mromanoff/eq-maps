define(function (require, exports, module) {
    'use strict';

    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');

    var Marionette = require('marionette');
    var moment = require('moment');
    var template = require('text!templates/detail/index.tpl');

    module.exports = Marionette.ItemView.extend({
        template: _.template(template),

        events: {
            'click .cancel-all': 'cancelAll',
            'click .cancel': 'cancel',
            'click .reschedule': 'reschedule'
        },

        initialize: function () {
            msgBus.commands.execute('scroll:top');
        },

        onBeforeRender: function () {
            var weekDay = moment(this.model.get('startDate')).format('dddd');
            var shortMonth = moment(this.model.get('startDate')).format('MMM');
            var date = moment(this.model.get('startDate')).format('DD');
            var startTime = moment(this.model.get('startDate')).format('hh:mm');
            var endTime = moment(this.model.get('endDate')).format('hh:mm');
            var meridiemIndicator = moment(this.model.get('endDate')).format('A');

            this.model.set({
                shortMonth: shortMonth,
                appointmentDate: weekDay + ', ' + shortMonth + ' ' + date,
                appointmentTime: startTime + ' - ' + endTime + ' ' + meridiemIndicator
            });
        },

        cancelAll: function (e) {
            e.preventDefault();
            this.model.set({cancelAll: true});
            // update URL address
            App.navigate('cancel/' + this.model.id);
            msgBus.reqres.request('schedule:cancel:review', this.model);
        },

        cancel: function (e) {
            e.preventDefault();
            this.model.set({cancelAll: false});
            // update URL address
            App.navigate('cancel/' + this.model.id);
            msgBus.reqres.request('schedule:cancel:review', this.model);
        },

        reschedule: function (e) {
            e.preventDefault();
            App.navigate('update/' + this.model.id);
            msgBus.reqres.request('schedule:update', this.model.id);
        }
    });
});