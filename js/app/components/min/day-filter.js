(function(App) {
    "use strict";
    App.Components["day-filter"] = function($el) {
        var CalendarDay = Backbone.Model.extend({
            defaults: {
                name: "",
                smallName: "",
                date: "",
                isToday: false,
                dateFormat: ""
            }
        });
        $(".classes-calendar .nav-arrows .icon-left-arrow").on("click", function(e) {
            e.preventDefault();
            Backbone.Events.trigger("dayfilter:prev-week");
        });
        $(".classes-calendar .nav-arrows .icon-right-arrow").on("click", function(e) {
            e.preventDefault();
            Backbone.Events.trigger("dayfilter:next-week");
        });
        var CalendarWeekView = Backbone.View.extend({
            initialize: function(options) {
                this.options = {};
                _.extend(this.options, options);
                this.listenTo(Backbone.Events, "classes-list:generate-week", function() {
                    this.trigger("removeDays");
                });
            },
            render: function() {
                console.log(this.options.mobile);
                this.collection.each(function(calendarDay) {
                    var calendarDayView;
                    if (this.options.mobile === false) {
                        calendarDayView = new CalendarDayView({
                            model: calendarDay
                        });
                    } else {
                        calendarDayView = new CalendarDayViewMobile({
                            model: calendarDay
                        });
                    }
                    calendarDayView.listenTo(this, "removeDays", calendarDayView.remove);
                    this.$el.append(calendarDayView.render().el);
                }, this);
                return this;
            }
        });
        var CalendarViewHelpers = {
            isCurrentDay: function() {
                if (this.isToday === true) {
                    return "current";
                }
            },
            isFirstDayMobile: function() {
                if (this.index === 1) {
                    return "mobile-first";
                }
            }
        };
        var CalendarDayView = Backbone.View.extend({
            template: _.template($("#dayFilterTemplate").html()),
            events: {
                "click a": "dateClick"
            },
            getRenderData: function() {
                var data = this.model.toJSON();
                return _.extend(data, CalendarViewHelpers);
            },
            render: function() {
                this.setElement(this.template(this.getRenderData()));
                return this;
            },
            dateClick: function(e) {
                Backbone.Events.trigger("dayfilter:click", e);
            }
        });
        var CalendarDayViewMobile = Backbone.View.extend({
            template: _.template($("#dayFilterTemplate").html()),
            events: {
                "click a": "dateClick"
            },
            getRenderData: function() {
                var data = this.model.toJSON();
                return _.extend(data, CalendarViewHelpers);
            },
            render: function() {
                this.setElement(this.template(this.getRenderData()));
                return this;
            },
            dateClick: function(e) {
                Backbone.Events.trigger("dayfilter-mobile:click", e);
            }
        });
        var CalendarWeekCollection = Backbone.Collection.extend({
            model: CalendarDay
        });
        var calendarWeekCollection = new CalendarWeekCollection();
        Backbone.Events.on("classes-list:generate-week", function(date) {
            calendarWeekCollection.reset();
            var currentDay = moment(new Date());
            for (var i = 0; i <= 6; i++) {
                var day = moment(date || currentDay);
                day.add("days", i);
                var name = day.format("ddd"), month = day.toString().substring(4, 7), number = day.format("D"), isToday = moment(currentDay).isSame(day, "day"), dateFormat = day.format("YYYY-MM-DD");
                var calendarDay = {
                    index: i + 1,
                    name: name,
                    smallName: name.substring(0, 1),
                    date: month + " " + number,
                    isToday: isToday,
                    dateFormat: dateFormat
                };
                if (isToday) {
                    calendarDay.name = "Today";
                }
                calendarWeekCollection.push(calendarDay);
            }
            var calendarWeekView = new CalendarWeekView({
                el: $el.find(".calendar-list-container .is-desktop.is-tablet ul"),
                collection: calendarWeekCollection,
                mobile: false
            });
            var calendarWeekViewMobile = new CalendarWeekView({
                el: $el.find(".calendar-list-container .is-mobile ul"),
                collection: calendarWeekCollection,
                mobile: true
            });
            calendarWeekView.render();
            calendarWeekViewMobile.render();
        });
        if (EQ.Helpers.getQueryStringVariable("date")) {
            var QSDate = moment(EQ.Helpers.getQueryStringVariable("date"));
            Backbone.Events.trigger("classes-list:generate-week", QSDate);
        } else {
            Backbone.Events.trigger("classes-list:generate-week");
        }
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
