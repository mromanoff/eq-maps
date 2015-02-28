define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var moment = require('moment');
    var template = require('text!templates/update/review.tpl');

    module.exports = Marionette.ItemView.extend({
        template: _.template(template),

        events: {
            'click .schedule': 'schedule',
            'click .update': 'update',
            'click .add-message': 'addMessage',
            'keyup textarea': 'countLimit'
        },

        initialize: function () {
            msgBus.commands.execute('scroll:top');
        },

        ui: {
            textarea: 'textarea'
        },

        onBeforeRender: function () {
            //TODO: make it DRY
            var weekDay = moment(this.model.get('startDate')).format('dddd');
            var shortMonth = moment(this.model.get('startDate')).format('MMM');
            var date = moment(this.model.get('startDate')).format('DD');
            var startTime = moment(this.model.get('startDate')).format('hh:mm');
            var endTime = moment(this.model.get('endDate')).format('hh:mm');
            var meridiemIndicator = moment(this.model.get('endDate')).format('A');

            var originalWeekDay = moment(this.options.original.get('startDate')).format('dddd');
            var originalShortMonth = moment(this.options.original.get('startDate')).format('MMM');
            var originalDate = moment(this.options.original.get('startDate')).format('DD');
            var originalStartTime = moment(this.options.original.get('startDate')).format('hh:mm');
            var originalEndTime = moment(this.options.original.get('endDate')).format('hh:mm');
            var originalMeridiemIndicator = moment(this.options.original.get('endDate')).format('A');

            this.model.set({
                shortMonth: shortMonth,
                appointmentDate: weekDay + ', ' + shortMonth + ' ' + date,
                appointmentTime: startTime + ' - ' + endTime + ' ' + meridiemIndicator,

                originalShortMonth: originalShortMonth,
                originalAppointmentDate: originalWeekDay + ', ' + originalShortMonth + ' ' + originalDate,
                originalAppointmentTime: originalStartTime + ' - ' + originalEndTime + ' ' + originalMeridiemIndicator
            });
        },

        schedule: function (e) {
            e.preventDefault();
            if (!_.isEmpty(this.ui.textarea.val())) {
                this.model.set({ message: this.ui.textarea.val() });
            }
            msgBus.reqres.request('schedule:update:confirmation', this.model);
        },

        update: function (e) {
            e.preventDefault();
            App.navigate('update/' + this.options.original.id, {trigger: false});
            msgBus.reqres.request('schedule:update',  this.options.original.id);
        },

        countLimit: function (e) {
            e.preventDefault();
            // limit 300 chars
            var count = 300 - this.ui.textarea.val().length;
            this.ui.textarea.next('.char-counter').text(count);
        },

        addMessage: function (e) {
            e.preventDefault();
            this.$('.add-message-container').toggleClass('hidden');
        }
    });
});