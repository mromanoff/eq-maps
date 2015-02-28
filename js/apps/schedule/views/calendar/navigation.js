define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');
    var moment = require('moment');
    var template = require('text!templates/calendar/navigation.tpl');
    var templateItem = require('text!templates/calendar/navigation_item.tpl');

    var Item = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template(templateItem),
        events: {
            'click': 'updateCalendar'
        },

        onRender: function () {
            var date = this.model.get('dataDate');

            if (!App.utils.isValidDate(date)) {
                this.$el.addClass('disabled');
            }
        },

        updateCalendar: function (e) {
            e.preventDefault();
            var date = this.model.get('dataDate');

            // trigger event if isValidDate = true
            if (App.utils.isValidDate(date)) {
                App.filterCriteria.set({startDate: date});
                msgBus.reqres.request('schedule:calendar:navigation', {
                    startDate: date
                });
            }
        }
    });

    module.exports = Marionette.CompositeView.extend({
        itemView: Item,
        className: 'classes-calendar',
        template: _.template(template),
        itemViewContainer: 'ul',

        initialize: function () {
            this.first = moment(this.collection.at(0).attributes.dataDate);
            this.last = moment(this.collection.at(6).attributes.dataDate);

            // moment() modifies data. so cache it.
            var first = moment(this.first);
            var last = moment(this.last);

            // create step - 7 or + 7  days
            this.prevWeek = first.subtract('days', 7).format('YYYY-MM-DD');
            this.nextWeek = last.add('days', 1).format('YYYY-MM-DD');
        },

        events: {
            'click .icon-left-arrow': 'updateCalendarPrevWeek',
            'click .icon-right-arrow': 'updateCalendarNextWeek'
        },

        ui: {
            leftArrow: '.icon-left-arrow',
            rightArrow: '.icon-right-arrow',
            currentWeek: '.current-week'
        },

        onRender: function () {
            // print JUL 21 JUL 27. update current week title
            this.ui.currentWeek.text(moment(this.first).format('MMM DD') + ' - ' + moment(this.last).format('MMM DD'));

            if (moment().add('days', 1).format('W') < this.first.format('W')) {
                this.ui.leftArrow.show();
            }
            else {
                this.ui.leftArrow.hide();
            }

            if (App.utils.isValidDate(this.nextWeek)) {
                this.ui.rightArrow.show();
            }
            else {
                this.ui.rightArrow.hide();
            }
        },

        updateCalendarPrevWeek: function (e) {
            e.preventDefault();
            var date = this.prevWeek;

            App.filterCriteria.set({startDate: date});
            msgBus.reqres.request('schedule:calendar:navigation', {
                startDate: date
            });
        },

        updateCalendarNextWeek: function (e) {
            e.preventDefault();
            var date = this.nextWeek;

            App.filterCriteria.set({startDate: date});
            msgBus.reqres.request('schedule:calendar:navigation', {
                startDate: date
            });
        }
    });
});