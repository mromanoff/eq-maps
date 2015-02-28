define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var msgBus = require('schedule/msgbus');
    var template = require('text!templates/cancel/review.tpl');
    var moment = require('moment');

    module.exports = Marionette.ItemView.extend({
        template: _.template(template),

        events: {
            'click .cancel': 'cancel',
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

        cancel: function (e) {
            e.preventDefault();
            if (!_.isEmpty(this.ui.textarea.val())) {
                this.model.set({ message: this.ui.textarea.val() });
            }
            msgBus.reqres.request('schedule:cancel:confirmation', this.model);
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