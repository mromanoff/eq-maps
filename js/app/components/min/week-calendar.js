(function(global, App) {
    "use strict";
    var Backbone = global.Backbone, _ = global._;
    var WeekDayModel = Backbone.Model.extend({
        defaults: {
            specialClass: "",
            displayTime: ""
        }
    });
    var DaySingleViewHelpers = {
        isCurrentDay: function() {
            return moment(this.date.format("YYYY-MM-DD")).isSame(moment().format("YYYY-MM-DD")) ? true : false;
        },
        getDateString: function(dateString) {
            return EQ.Helpers.dateTime.convertDateToString(dateString);
        },
        getInstructors: function(instructors) {
            var instructorsString;
            if (instructors.length) {
                _.each(instructors, function(instructor) {
                    if (_.isNull(instructor.substitute)) {
                        instructorsString = instructor.instructor.firstName + " " + instructor.instructor.lastName;
                    } else {
                        instructorsString = instructor.substitute.firstName + " " + instructor.substitute.lastName + " (SUB)";
                    }
                });
            }
            return instructorsString;
        },
        getEventDuration: function(startDate, endDate) {
            return EQ.Helpers.dateTime.getTimeRange(startDate, endDate);
        },
        isPastday: function(endLocal) {
            return moment().isAfter(moment(endLocal)) ? "pastEvent" : "";
        },
        formatDisplayTime: function(displayTimeString) {
            return EQ.Helpers.dateTime.formatDisplayTime(displayTimeString);
        }
    };
    var CalendarView = Backbone.View.extend({
        tagName: "table",
        initialize: function(options) {
            this.weekData = options.weekData;
            this.hasTrainer = options.hasTrainer;
        },
        render: function() {
            debug("SMALL CALENDAR", this.weekData);
            _.each(this.weekData, function(dayDetail) {
                var daySingleView = new DaySingleView({
                    model: new WeekDayModel(dayDetail),
                    hasTrainer: this.hasTrainer
                });
                this.$el.append(daySingleView.render().el);
            }, this);
            return this;
        }
    });
    var DaySingleView = Backbone.View.extend({
        tagName: "tr",
        className: "day-detail-container",
        template: _.template($("#dayTemplate").html()),
        initialize: function(options) {
            this.hasTrainer = options.hasTrainer;
        },
        events: {
            "click .add-class": "openOverlay",
            "click .close-event-overlay": "closeOverlay",
            "click a.add-class": "addClassToCalendar"
        },
        addClassToCalendar: function(e) {
            e.preventDefault();
            var currentDate = moment(), limitDayThirtyDaysBefore = moment(currentDate.format()).subtract(30, "days"), $currentLink = $(e.target);
            if (this.model.get("date").isBefore(limitDayThirtyDaysBefore.format("YYYY-MM-DD"))) {
                App.Events.trigger("classOlderThanThirtyDays");
            } else {
                window.location.href = $currentLink.attr("href");
            }
        },
        openOverlay: function() {
            this.$el.addClass("active");
        },
        closeOverlay: function() {
            this.$el.removeClass("active");
        },
        getRenderData: function() {
            var data;
            this.model.set("hasTrainer", this.hasTrainer);
            data = this.model.toJSON();
            return _.extend(data, DaySingleViewHelpers);
        },
        render: function() {
            this.$el.html(this.template(this.getRenderData()));
            return this;
        }
    });
    var WeekCalendar = {};
    WeekCalendar.publicMethods = {
        update: function(options) {
            WeekCalendar.calendarView.remove();
            WeekCalendar.calendarView = new CalendarView({
                weekData: options.weekData,
                hasTrainer: options.hasTrainer
            });
            WeekCalendar.$el.append(WeekCalendar.calendarView.render().el);
        }
    };
    WeekCalendar.init = function($el, options) {
        this.$el = $el;
        this.calendarView = new CalendarView({
            weekData: options.weekData,
            hasTrainer: options.hasTrainer
        });
        $el.append(this.calendarView.render().el);
        var currDay = $("tr").find(".current-day").length > 0 ? $(".current-day").parent() : $(".active-day").parent();
        if (currDay.length !== 0) {
            $(".small-calendar").animate({
                scrollTop: currDay.position().top
            }, "slow");
        }
        $el.data("publicMethods", this.publicMethods);
    };
    App.Components["week-calendar"] = function($el, options) {
        WeekCalendar.init($el, options);
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
