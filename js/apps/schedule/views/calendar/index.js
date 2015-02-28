define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var App = require('schedule/app');
    var msgBus = require('schedule/msgbus');

    var moment = require('moment');
    var calendarTemplate = require('text!templates/calendar/index.tpl');
    var itemTemplate = require('text!templates/calendar/item.tpl');
    var emptyItemTemplate = require('text!templates/calendar/empty_item.tpl');
    var headerItemTemplate = require('text!templates/calendar/header_item.tpl');

    var noOfVisibleItem = 7;
    
    var Item = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template(itemTemplate),
        events: {
            'click .available': 'selectAppointment'
        },

        initialize: function () {
        	this.addAttribute('data-item' + this.model.get('indexOfWeek'));
            this.addAttribute('data-date', this.model.get('startDate'));
        },

        onBeforeRender: function () {
            var startTime;
            var endTime;
            var meridiemIndicator;
            var scheduled = this.model.has('id') ? ' scheduled' : false;

            if (this.model.get('isAvailable')) {
                startTime = moment(this.model.get('startDate')).format('hh:mm');
                endTime = moment(this.model.get('endDate')).format('hh:mm');
                meridiemIndicator = moment(this.model.get('endDate')).format('A');
                this.model.set({
                    cid: this.model.cid, // client ID.
                    className: (scheduled) ? 'scheduled' : 'available',
                    appointment: startTime + ' - ' + endTime + ' ' + meridiemIndicator,
                    scheduled: scheduled
                });
            }
        },

        addAttribute: function (attrName, attrValue) {
            return this.$el.attr(attrName, attrValue);
        },

        selectAppointment: function (e) {
            e.preventDefault();
            msgBus.reqres.request('schedule:' + App.flow + ':review', this.options.model);
        }
    });

    var EmptyItem = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'empty',
        template: _.template(emptyItemTemplate),

        initialize: function () {
            this.addClass('item-' + this.model.get('indexOfWeek'));
        },

        addClass: function (className) {
            return this.$el.addClass(className);
        }
    });
    
    var NoItem = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'no-item',
        template: _.template(''),

        initialize: function () {
            this.addClass('item-' + this.model.get('indexOfWeek'));
        },

        addClass: function (className) {
            return this.$el.addClass(className);
        }
    });

    var DayPartView = Marionette.CollectionView.extend({
        tagName: 'ul',

        itemViewOptions: function (model, index) {
            return {
                itemIndex: index
            };
        },

        getItemView: function (item) {
            if (item.get('indexOfWeek') > noOfVisibleItem) {
                return NoItem;
            }

            if (item.get('isAvailable')) {
                return Item;
            }
            else {
                return EmptyItem;
            }
        }
    });

    var CalendarHeaderItem = Marionette.ItemView.extend({
        tagName: 'li',

        initialize: function () {
            if (this.model.get('selected')) {
                this.$el.addClass('selected');
            }
        },

        template: _.template(headerItemTemplate)
    });

    var CalendarHeaderView = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'day-dates',
        itemView: CalendarHeaderItem
    });

    var AppointmentsLayout = Marionette.Layout.extend({
        template: _.template(calendarTemplate),
        regions: {
            header: '.appointments-header',
            morning: '.morning',
            afternoon: '.afternoon',
            evening: '.evening'
        },

        events: {
            'click .toggle-day': 'toggleDayPart'
        },

        initialize: function () {
            noOfVisibleItem = $('.calendar-list-container ul:first li').not('.disabled').length;
        },
        
        toggleDayPart: function (e) {
            e.preventDefault();
            $(e.currentTarget).next().toggle();
        }
    });

    module.exports = function (options) {
        var appointmentsLayout = new AppointmentsLayout();

        App.layout.content.show(appointmentsLayout);
        
        appointmentsLayout.header.show(new CalendarHeaderView({
            collection: options.dates
        }));

        appointmentsLayout.morning.show(new DayPartView({
            collection: new Backbone.Collection(options.appointments.models[0].get('morning'))
        }));

        appointmentsLayout.afternoon.show(new DayPartView({
            collection: new Backbone.Collection(options.appointments.models[0].get('afternoon'))
        }));

        appointmentsLayout.evening.show(new DayPartView({
            collection: new Backbone.Collection(options.appointments.models[0].get('evening'))
        }));
    };
});
