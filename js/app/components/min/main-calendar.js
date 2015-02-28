(function(global, App) {
    "use strict";
    var Backbone = global.Backbone, _ = global._;
    var DayDetail = Backbone.Model.extend({
        defaults: {
            displayTime: ""
        }
    });
    var Event = Backbone.Model.extend();
    var WeekCollection = Backbone.Collection.extend({
        model: DayDetail
    });
    var EventsCollection = Backbone.Collection.extend({
        model: Event
    });
    var DaySingleViewHelpers = {
        isCurrentDay: function() {
            var today = new Date();
            return this.id === today.getDay() ? true : false;
        },
        getDateString: function(dateString) {
            return EQ.Helpers.dateTime.convertDateToString(dateString);
        },
        getCurrentDay: function() {
            var currentDay = new Date(), currentDayString;
            currentDayString = currentDay.toString().substr(4, 6);
            return currentDayString;
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
        getEventDuration: function(eventDetail) {
            return EQ.Helpers.dateTime.getTimeRange(eventDetail.startDate, eventDetail.endDate);
        }
    };
    var CalendarSingleViewHelpers = {
        getLocalDate: function() {
            if (EQ.Helpers.user.getUserCountry() === "US") {
                return this.date.month + " " + this.date.dayNum;
            } else {
                return this.date.dayNum + " " + this.date.month;
            }
        }
    };
    var WeekView = Backbone.View.extend({
        initialize: function(options) {
            this.fromDate = options.fromDate;
            this.toDate = options.toDate;
            this.hasTrainer = options.hasTrainer;
            this.month = options.month;
        },
        renderWeek: function(week) {
            var that = this, weekContainer = $(document.createElement("div")).addClass("main-calendar-week"), el = [];
            $.each(week, function(key) {
                el.push(that.renderDay(week[key]));
            });
            weekContainer.append(el);
            this.$el.append(weekContainer);
        },
        renderDay: function(dayModel) {
            var daySingleView, dateObject = {
                day: "",
                month: "",
                dayNum: ""
            };
            dateObject.day = moment(dayModel.date).format("ddd");
            dateObject.month = moment(dayModel.date).format("MMM");
            dateObject.dayNum = moment(dayModel.date).format("DD");
            dateObject.momentDate = moment(dayModel.date);
            daySingleView = new DaySingleView({
                model: dayModel.model,
                date: dateObject,
                specialClass: dayModel.specialClass,
                hasTrainer: this.hasTrainer
            });
            return daySingleView.render().el;
        },
        render: function() {
            for (var i = 0; i < this.month.length; i++) {
                this.renderWeek(this.month[i]);
            }
            return this;
        }
    });
    var DaySingleView = Backbone.View.extend({
        className: "day-detail-main-container",
        template: _.template($("#dayTemplateMainCalendar").html()),
        events: {
            "click .add-event": "addEvent",
            "click .close-event-overlay": "hideEventOverlay",
            "click a.add-class": "addClassToCalendar"
        },
        initialize: function(options) {
            this.date = options.date;
            this.specialClass = options.specialClass;
            this.hasTrainer = options.hasTrainer;
        },
        addEvent: function(e) {
            e.preventDefault();
            App.Events.trigger("addEventOpened");
            this.$el.addClass("show-add-event-menu");
        },
        hideEventOverlay: function(e) {
            e.preventDefault();
            this.$el.removeClass("show-add-event-menu");
        },
        addClassToCalendar: function(e) {
            var currentDate = moment(), limitDayThirtyDaysBefore = moment(currentDate.format()).subtract(30, "days");
            if (this.date.momentDate.isBefore(limitDayThirtyDaysBefore.format("YYYY-MM-DD"))) {
                e.preventDefault();
                App.Events.trigger("classOlderThanThirtyDays");
            }
        },
        render: function() {
            var eventCount = this.model.length, eventsContainer, events = [];
            this.$el.html(this.template(_.extend({
                hasTrainer: this.hasTrainer,
                date: this.date
            }, CalendarSingleViewHelpers)));
            if (this.specialClass !== "") {
                this.$el.addClass(this.specialClass);
            }
            if (eventCount > 0) {
                eventsContainer = new EventsContainerView({
                    collection: new EventsCollection(this.model)
                });
                events.push(eventsContainer.render().el);
                this.$el.find(".day-detail-container").append(events);
            } else {
                this.$el.addClass("empty-day");
                this.$el.find(".add-event").addClass("empty-day");
            }
            return this;
        }
    });
    var EventsContainerView = Backbone.View.extend({
        className: "events-container",
        template: _.template($("#eventsContainerTemplate").html()),
        events: {
            "click .see-more-classes": "toggleExtraClasses"
        },
        toggleExtraClasses: function() {
            this.$el.find(".extra-event-container, .see-more-classes").toggleClass("active");
        },
        extractCheckInEvents: function() {
            var checkInEvents = [], checkInEventsToClear = [], checkInsParentEvent, self = this;
            this.collection.each(function(eventDetail) {
                if (eventDetail.get("eventType") === "CheckIn") {
                    var formattedHour = moment(eventDetail.get("startLocal")), finalEventObject;
                    finalEventObject = _.extend({
                        formattedHour: formattedHour.format("LT")
                    }, eventDetail.toJSON());
                    checkInEvents.push(finalEventObject);
                    checkInEventsToClear.push(eventDetail);
                }
            }, this);
            if (checkInEventsToClear.length) {
                _.each(checkInEventsToClear, function(ckeckInModel) {
                    self.collection.remove(ckeckInModel);
                });
            }
            if (checkInEvents.length) {
                checkInsParentEvent = new Event();
                checkInsParentEvent.set("eventType", "CheckIn");
                checkInsParentEvent.set("checkInsList", checkInEvents);
                return checkInsParentEvent;
            } else {
                return null;
            }
        },
        renderEvents: function() {
            var firstEvent = new EventSingleView({
                model: this.collection.models[0]
            }), $seeMoreClassesContainer = this.$el.find(".see-more-classes"), extraEvents = [], isFirst = false, extraEventsView;
            $seeMoreClassesContainer.removeClass("hidden");
            $seeMoreClassesContainer.find("span.number").html(this.collection.length - 1);
            this.$el.prepend(firstEvent.render().el);
            this.collection.each(function(event) {
                if (isFirst === false) {
                    isFirst = true;
                } else {
                    extraEvents.push(event);
                }
            });
            extraEventsView = new ExtraEventsView({
                collection: new EventsCollection(extraEvents)
            });
            this.$el.find(".see-more-classes").append(extraEventsView.render().el);
        },
        render: function() {
            var checkins = this.extractCheckInEvents();
            this.$el.html(this.template());
            if (this.collection.length > 2) {
                this.renderEvents();
            } else {
                this.collection.each(function(eventDetail) {
                    var eventSingleView = new EventSingleView({
                        model: eventDetail
                    });
                    this.$el.append(eventSingleView.render().el);
                }, this);
                if (this.collection.length === 1) {
                    this.$el.addClass("single-event");
                }
            }
            if (checkins) {
                var checkInEvent = new EventSingleView({
                    model: checkins
                });
                this.$el.prepend(checkInEvent.render().el);
            }
            return this;
        }
    });
    var EventSingleView = Backbone.View.extend({
        className: "event-view",
        template: _.template($("#eventSingleViewTemplate").html()),
        getRenderData: function() {
            var data = this.model.toJSON();
            return _.extend(data, DaySingleViewHelpers);
        },
        render: function() {
            this.$el.html(this.template(this.getRenderData()));
            if (this.model.get("eventType") === "CheckIn") {
                this.$el.addClass("check-in");
            }
            if (moment().isAfter(moment(this.model.get("endLocal")))) {
                this.$el.addClass("past");
            }
            return this;
        }
    });
    var ExtraEventsView = Backbone.View.extend({
        className: "extra-event-container",
        template: _.template($("#extraEventViewTemplate").html()),
        render: function() {
            this.$el.html(this.template());
            this.collection.each(function(extraEvent) {
                var extraEventSingleView = new ExtraEventSingleView({
                    model: extraEvent
                });
                this.$el.find(".extra-event-wrapper").append(extraEventSingleView.render().el);
            }, this);
            return this;
        }
    });
    var ExtraEventSingleView = Backbone.View.extend({
        className: "extra-event-view",
        template: _.template($("#extraEventSingleViewTemplate").html()),
        getRenderData: function() {
            var data = this.model.toJSON();
            return _.extend(data, DaySingleViewHelpers);
        },
        render: function() {
            this.$el.html(this.template(this.getRenderData()));
            return this;
        }
    });
    var WeekMobileView = Backbone.View.extend({
        el: ".mobile-calendar-small-container",
        events: {
            "click .prev-week": "goToPrevWeek",
            "click .next-week": "goToNextWeek"
        },
        initialize: function(options) {
            this.month = options.month;
            this.currentWeek = 0;
            this.updateCurrentWeekText();
            this.hasTrainer = options.hasTrainer;
        },
        updateMonth: function(options) {
            this.month = options.month;
            this.hasTrainer = options.hasTrainer;
            this.currentWeek = options.prevNext && options.prevNext === 1 ? 0 : this.month.length - 1;
            this.updateCurrentWeekText();
            this.render();
        },
        toggleControls: function() {
            this.$el.find(".controls").toggleClass("hidden");
        },
        clearList: function() {
            this.$el.find(".calendar-box").empty();
        },
        goToPrevWeek: function(e) {
            e.preventDefault();
            this.changeWeek(-1);
        },
        goToNextWeek: function(e) {
            e.preventDefault();
            this.changeWeek(1);
        },
        changeWeek: function(prevNext) {
            var newWeek = this.currentWeek + prevNext;
            if (this.month[newWeek]) {
                this.$el.find(".calendar-box").data("publicMethods").update({
                    weekData: this.month[newWeek],
                    hasTrainer: this.hasTrainer
                });
                this.currentWeek = newWeek;
                this.updateCurrentWeekText();
            } else {
                this.unbind();
                $(".main-calendar.is-desktop").data("mainCalendar").movetoNextFourWeeks(prevNext);
            }
        },
        updateCurrentWeekText: function() {
            var firstDayDate = this.month[this.currentWeek].Mo.date, lastDayDate = this.month[this.currentWeek].Su.date, firstDayNumber = firstDayDate.format("MMM DD"), lastDayNumber = lastDayDate.format("MMM DD"), $currentWeekText = this.$el.find(".current-week-text"), currentWeekText = firstDayNumber + " - " + lastDayNumber, currentStartOfWeek = moment().startOf("isoWeek"), currentEndOfWeek = moment().endOf("week").add("day", 1);
            if (moment(currentStartOfWeek.format("YYYY-MM-DD")).isSame(firstDayDate.format("YYYY-MM-DD")) && moment(currentEndOfWeek.format("YYYY-MM-DD")).isSame(lastDayDate.format("YYYY-MM-DD"))) {
                currentWeekText = "This week";
            }
            $currentWeekText.text(currentWeekText);
        },
        render: function() {
            var $calendarBox = this.$el.find(".calendar-box");
            this.toggleControls();
            App.loadComponent("week-calendar", $calendarBox, {
                weekData: this.month[this.currentWeek],
                hasTrainer: this.hasTrainer
            });
            return this;
        }
    });
    var PopUpMessage = Backbone.View.extend({
        className: "pop-up-wrapper hidden",
        template: _.template($("#popUpMessageTemplate").html()),
        events: {
            "click .close": "closePopUp"
        },
        openPopUp: function() {
            this.$el.removeClass("hidden");
        },
        closePopUp: function(e) {
            e.preventDefault();
            this.$el.addClass("hidden");
        },
        render: function() {
            this.$el.html(this.template());
            return this;
        }
    });
    var CalendarClass = {}, WorkoutsCategories = null;
    CalendarClass.init = function($el) {
        var currentDate = moment(), fromDate, toDate, popUpMessage;
        CalendarClass.$el = $el;
        CalendarClass.$el.data("mainCalendar", this.publicMethods);
        fromDate = moment(currentDate).startOf("isoWeek").format("YYYY-MM-DD");
        toDate = moment(currentDate).add("week", 3).endOf("isoWeek").format("YYYY-MM-DD");
        CalendarClass.currentMonthDate = moment(currentDate.format());
        popUpMessage = new PopUpMessage();
        $("body").append(popUpMessage.render().el);
        CalendarClass.loadData(CalendarClass.$el, {
            fromDate: fromDate,
            toDate: toDate
        });
        App.Events.on("addEventOpened", function() {
            $(".day-detail-main-container").removeClass("show-add-event-menu");
        });
        App.Events.on("classOlderThanThirtyDays", function() {
            popUpMessage.openPopUp();
        });
        CalendarClass.omnitCall();
    };
    CalendarClass.createMonthObject = function(toDate, fromDate, weekCollection) {
        var week = {}, month = [], monthEndWeek = moment(toDate), current = moment(fromDate);
        while (!current.isAfter(monthEndWeek)) {
            for (var i = 0; i < 7; i++) {
                var day = {};
                day.date = current;
                day.model = [];
                day.specialClass = "";
                if (moment(current.format("YYYY-MM-DD")).isSame(moment().format("YYYY-MM-DD"))) {
                    day.specialClass = "current-day";
                } else if (current.isBefore(moment())) {
                    day.specialClass = "past";
                }
                week[current.format("dd")] = day;
                current = moment(current).add("day", 1);
            }
            month.push(week);
            week = {};
        }
        weekCollection.each(function(dayModel) {
            var date = dayModel.get("startLocal"), current = moment(date), currentDay = current.format("dd"), facility = EQ.Helpers.getFacilityById(dayModel.get("facilityId"));
            dayModel.set("checkedInDetail", null);
            dayModel.set("primaryCategory", _.findWhere(WorkoutsCategories, {
                categoryId: "" + dayModel.get("workoutCategoryId")
            }));
            dayModel.set("displayTime", moment(dayModel.get("startLocal")).format("hh:mm a") + "-" + moment(dayModel.get("endLocal")).format("hh:mm a"));
            if (facility) {
                dayModel.set("facility", {
                    facilityId: dayModel.get("facilityId"),
                    clubId: facility.ClubID,
                    name: facility.ClubName,
                    shortName: facility.ShortName,
                    mobileName: facility.ShortName,
                    webName: facility.ShortName,
                    urlName: facility.ShortName,
                    timeZoneId: null,
                    regionId: null,
                    isPresale: facility.isPresale
                });
            } else {
                dayModel.set("facility", {});
            }
            for (var i = 0; i < month.length; i++) {
                var thisMoment = moment(current.format("YYYY-MM-DD")), monthMoment = moment(month[i][currentDay].date.format("YYYY-MM-DD"));
                if (thisMoment.isSame(monthMoment)) {
                    month[i][currentDay].model.push(dayModel);
                }
            }
            console.log("createMonthObject", dayModel.get("workoutCategoryId"), dayModel.get("primaryCategory"));
        }, this);
        return month;
    };
    CalendarClass.loadData = function($el, options) {
        var calendarContainerView, weekCollection, daysJSON, ENDPOINT, monthObject, loaderAndError, plusDayToDate, $loaderContainer = $el.siblings(".loader-error-box");
        CalendarClass.currentToDate = moment(options.toDate);
        CalendarClass.currentFromDate = moment(options.fromDate);
        App.Events.trigger("dateRangeUpdated");
        $el.empty();
        if (CalendarClass.weekMobileView) {
            CalendarClass.weekMobileView.toggleControls();
            CalendarClass.weekMobileView.clearList();
        }
        plusDayToDate = moment(options.toDate).add("day", 1).format("YYYY-MM-DD");
        ENDPOINT = APIEndpoint26 + "/me/calendar?fromDate=" + options.fromDate + "&toDate=" + plusDayToDate + "&count=100";
        CalendarClass.status = false;
        $loaderContainer.removeClass("hidden");
        loaderAndError = EQ.Helpers.loaderAndErrorHandler($loaderContainer, {
            color: "black"
        });
        loaderAndError.showLoader();
        $.when($.ajax({
            type: "GET",
            url: ENDPOINT,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            dataType: "json"
        }), EQ.Helpers.getService("/v2.6/workouts/categories", {}, {}, true)).done(function(calendardata, categoriesdata) {
            var data = calendardata[0];
            WorkoutsCategories = categoriesdata[0];
            debug("[CALENDAR SERVICE OK]", data);
            loaderAndError.hideLoader();
            $loaderContainer.addClass("hidden");
            daysJSON = data;
            weekCollection = new WeekCollection(daysJSON.events);
            monthObject = CalendarClass.createMonthObject(CalendarClass.currentToDate.format(), CalendarClass.currentFromDate.format(), weekCollection);
            calendarContainerView = new WeekView({
                month: monthObject,
                el: $el,
                fromDate: options.fromDate,
                toDate: options.toDate,
                hasTrainer: data.hasTrainer
            });
            calendarContainerView.render();
            if (!CalendarClass.weekMobileView) {
                CalendarClass.weekMobileView = new WeekMobileView({
                    month: monthObject,
                    hasTrainer: data.hasTrainer
                });
                CalendarClass.weekMobileView.render();
            } else {
                CalendarClass.weekMobileView.updateMonth({
                    month: monthObject,
                    hasTrainer: data.hasTrainer,
                    prevNext: options.prevNext
                });
            }
            CalendarClass.status = true;
        }).fail(function() {
            debug("Server Error");
            loaderAndError.showError();
        });
    };
    CalendarClass.omnitCall = function() {
        $("#Omnit-search-menu li a").on("click", function() {
            var hrefVal = this.href.split("/")[this.href.split("/").length - 1];
            if (hrefVal === "search") {
                window.tagData.searchLink = window.tagData.searchLink || {};
                window.tagData.searchLink = {
                    type: "findaclass",
                    value: ""
                };
                window.track("clickClassSearchLink", window.tagData.searchLink);
            } else if (hrefVal === "bookabike") {
                window.tagData.searchLink = window.tagData.searchLink || {};
                window.tagData.searchLink = {
                    type: "bike",
                    value: ""
                };
                window.track("clickClassSearchLink", window.tagData.searchLink);
            }
        });
    };
    CalendarClass.publicMethods = {
        goToNextMonth: function() {
            CalendarClass.publicMethods.movetoNextFourWeeks(1);
        },
        goToPrevMonth: function() {
            CalendarClass.publicMethods.movetoNextFourWeeks(-1);
        },
        getCurrentAndYear: function() {
            return CalendarClass.currentMonthDate.format("MMMM YYYY");
        },
        getCurrentDataRange: function() {
            var dateRange = {
                fromDate: moment(CalendarClass.currentFromDate.format()),
                toDate: moment(CalendarClass.currentToDate.format())
            };
            return dateRange;
        },
        movetoNextFourWeeks: function(prevNext) {
            var newFromDate, newToDate;
            if (prevNext === 1) {
                newFromDate = moment(CalendarClass.currentToDate.format()).add("day", 1);
                newToDate = moment(newFromDate.format()).add("day", 6).add("week", 3);
                CalendarClass.currentMonthDate = moment(newFromDate.format());
            } else {
                newToDate = moment(CalendarClass.currentFromDate.format()).add("day", -1);
                newFromDate = moment(newToDate.format()).add("week", -4).add("day", 1);
                CalendarClass.currentMonthDate = moment(newToDate.format());
            }
            CalendarClass.loadData(CalendarClass.$el, {
                fromDate: newFromDate.format("YYYY-MM-DD"),
                toDate: newToDate.format("YYYY-MM-DD"),
                prevNext: prevNext
            });
        }
    };
    App.Components["main-calendar"] = function($el) {
        CalendarClass.init($el);
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
