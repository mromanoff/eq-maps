define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var moment = require('moment');
    var template = require('text!templates/cancel/index.tpl');

    module.exports = Marionette.ItemView.extend({
        template: _.template(template),

        events: {
            'click .cancel-all': 'cancelAll',
            'click .cancel': 'cancel',
            'click .update': 'update'
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
            msgBus.reqres.request('schedule:cancel:review', this.model);
        },

        cancel: function (e) {
            e.preventDefault();
            this.model.set({cancelAll: false});
            msgBus.reqres.request('schedule:cancel:review', this.model);
        },

        update: function (e) {
            e.preventDefault();
            App.navigate('update/' + this.model.id, {trigger: false});
            msgBus.reqres.request('schedule:update', this.model.id);
        }
    });
});