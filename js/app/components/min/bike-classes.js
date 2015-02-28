(function(global, App) {
    "use strict";
    window.tagData = window.tagData || {};
    window.tagData.search = window.tagData.search || {};
    window.tagData.search.type = "bike";
    var Backbone = global.Backbone, _ = global._;
    var BikeClass = Backbone.Model.extend({
        defaults: {
            description: "",
            type: 1
        }
    });
    var CalendarDay = Backbone.Model.extend({
        defaults: {
            name: "",
            smallName: "",
            date: "",
            isToday: false,
            dateFormat: ""
        }
    });
    var BikeClassCollection = Backbone.Collection.extend({
        model: BikeClass,
        configRequest: function(options) {
            this.clubs = options.clubs;
            this.classes = options.classes;
            this.fromDate = options.fromDate;
            this.toDate = options.toDate;
            this.instructors = options.instructors;
        },
        parse: function(response) {
            var bikeClasses = [];
            if (response.classes.length) {
                _.each(response.classes, function(event) {
                    if (event.isFinished) {
                        event.isFinished = true;
                    }
                    bikeClasses.push(event);
                });
            }
            bikeClasses = _.sortBy(bikeClasses, function(m) {
                return new Date(m.startDate).getTime();
            });
            return bikeClasses;
        },
        url: function() {
            var url = APIEndpoint + "/classes/bikes?facilities=" + this.clubs + "&instructors=" + this.instructors + "&classes=" + this.classes + "&fromDate=" + this.fromDate + "&toDate=" + this.toDate;
            return url;
        }
    });
    var CalendarWeekCollection = Backbone.Collection.extend({
        model: CalendarDay
    });
    var BikeClassViewHelpers = {
        getEventDuration: function(classDetail) {
            return EQ.Helpers.dateTime.getTimeRange(classDetail.startDate, classDetail.endDate);
        },
        getDetailUrl: function(classDetail) {
            return classDetail.isBookableOnline === true ? "/bookabike/detail/" + classDetail.classInstanceId : "";
        },
        getInstructors: function(instructors) {
            var instructorsString;
            if (instructors.length) {
                _.each(instructors, function(instructor) {
                    if (_.isNull(instructor.substitute)) {
                        if (_.isNull(instructor.instructor)) {
                            instructorsString = "";
                        } else {
                            instructorsString = instructor.instructor.firstName + " " + instructor.instructor.lastName;
                        }
                    } else {
                        if (_.isNull(instructor.instructor)) {
                            instructorsString = instructor.substitute.firstName + " " + instructor.substitute.lastName;
                        } else {
                            instructorsString = instructor.substitute.firstName + " " + instructor.substitute.lastName + " (SUB for " + instructor.instructor.firstName + " " + instructor.instructor.lastName + ")";
                        }
                    }
                });
            }
            return instructorsString;
        },
        getBikeStatus: function(status) {
            if (status === "") {
                return "";
            } else if (status.hasReservation === true) {
                return "Bike " + this.status.localId;
            } else {
                return this.status.bikesLeft === 1 ? this.status.bikesLeft + " Bike left" : this.status.bikesLeft + " Bikes left";
            }
        },
        getBikeClassStatus: function(status) {
            if (status.isFull === true) {
                return "full";
            }
            if (status.isWithinBookingWindow === false) {
                return "icon-lock";
            }
            if (status.hasReservation === true) {
                return "icon-check";
            }
            if (status.isWithinBookingWindow === true && status.hasReservation === false && status.isFull === false) {
                return "icon-status";
            }
        }
    };
    var CalendarViewHelpers = {
        isCurrentDay: function() {
            if (this.isToday === true) {
                return "current mobile-first";
            }
        },
        getLocalDate: function() {
            var month = this.dateObject.format("MMM").toUpperCase(), day = this.dateObject.format("D");
            if (EQ.Helpers.user.getUserCountry() === "US") {
                return month + " " + day;
            } else {
                return day + " " + month;
            }
        }
    };
    var BikeClassesListView = Backbone.View.extend({
        tagName: "ul",
        className: "bike-classes",
        render: function() {
            this.collection.each(function(bikeClass) {
                var bikeClassSingleView = new BikeClassSingleView({
                    model: bikeClass
                });
                this.$el.append(bikeClassSingleView.render().el);
            }, this);
            return this;
        }
    });
    var BikeClassSingleView = Backbone.View.extend({
        tagName: "li",
        template: _.template($("#bikeClassTemplate").html()),
        initialize: function() {
            this.listenTo(Backbone.Events, "classes-list:remove-classes", this.remove);
        },
        getRenderData: function() {
            var data = this.model.toJSON();
            return _.extend(data, BikeClassViewHelpers);
        },
        render: function() {
            if (this.model.get("isFinished")) {
                this.$el.addClass("past");
            }
            this.$el.html(this.template(this.getRenderData()));
            if (this.model.get("isBookableOnline") === false) {
                this.$el.find("a").on("click", function(e) {
                    e.preventDefault();
                    return false;
                });
            }
            return this;
        }
    });
    var CalendarWeekView = Backbone.View.extend({
        tagName: "ul",
        render: function() {
            this.collection.each(function(calendarDay) {
                var calendarDayView = new CalendarDayView({
                    model: calendarDay
                });
                this.$el.append(calendarDayView.render().el);
            }, this);
            return this;
        }
    });
    var CalendarDayView = Backbone.View.extend({
        tagName: "li",
        template: _.template($("#calendarDayTemplate").html()),
        events: {
            "click a": "filterByDay"
        },
        getRenderData: function() {
            var data = this.model.toJSON();
            return _.extend(data, CalendarViewHelpers);
        },
        render: function() {
            this.$el.html(this.template(this.getRenderData()));
            return this;
        },
        filterByDay: function(e) {
            e.preventDefault();
            $(e.currentTarget).parent().parent().find(".current").removeClass("current mobile-first");
            $(e.currentTarget).addClass("current mobile-first");
            Backbone.Events.trigger("classes-list:filterByDay", {
                date: this.model.get("dateFormat")
            });
        }
    });
    var EmptyView = Backbone.View.extend({
        template: _.template($("#emptyResult").html()),
        events: {
            "click .clear-filters": "clearFilters"
        },
        clearFilters: function(e) {
            e.preventDefault();
            Backbone.Events.trigger("classes-list:remove-filters");
            Backbone.Events.trigger("classes-list:fetch", null);
        },
        initialize: function() {
            this.listenTo(Backbone.Events, "classes-list:fetch", this.remove);
        },
        render: function() {
            this.setElement(this.template({}));
            return this;
        }
    });
    var EmptyFilterView = Backbone.View.extend({
        template: _.template($("#emptyFilterResult").html()),
        initialize: function() {
            this.listenTo(Backbone.Events, "classes-list:fetch", this.remove);
        },
        render: function() {
            this.setElement(this.template({}));
            return this;
        }
    });
    var BikeClasses = {};
    BikeClasses.isValidBrowser = function() {
        var browserName = EQ.Helpers.getBrowser(), browserVersion = parseInt(EQ.Helpers.getBrowserVersion(), 10), isValid = true;
        debug("BROWSER INFO", browserName, browserVersion);
        if (browserName === "Chrome" && browserVersion < 34) {
            isValid = false;
        }
        if (browserName === "Firefox" && browserVersion < 29) {
            isValid = false;
        }
        if (browserName === "Safari" && browserVersion < 6) {
            isValid = false;
        }
        if (browserName === "MSIE" && browserVersion < 11) {
            isValid = false;
        }
        return isValid;
    };
    BikeClasses.init = function($el) {
        var calendarWeekCollection, calendarWeekView, htmlBrowserWarning;
        if (!BikeClasses.isValidBrowser()) {
            htmlBrowserWarning = '<div class="browser_upgrade_warning">You are using an unsupported browser. Please update your browser to the latest version.</div>';
            $(".book-a-bike-hedaer").after(htmlBrowserWarning);
        }
        BikeClasses.loaderAndError = EQ.Helpers.loaderAndErrorHandler($el.find(".bike-classes-container"), {
            color: "black"
        });
        this.$el = $el;
        calendarWeekCollection = new CalendarWeekCollection();
        var calendarDate = moment(), currentDay = moment();
        for (var i = 0; i <= 6; i++) {
            var day = moment(calendarDate);
            day.add("days", i);
            var name = day.format("ddd"), month = day.toString().substring(4, 7), number = day.format("D"), isToday = moment(currentDay).isSame(day, "day"), dateFormat = day.format("YYYY-MM-DD");
            var calendarDay = {
                name: name,
                smallName: name.substring(0, 1),
                dateObject: day,
                date: month + " " + number,
                isToday: isToday,
                dateFormat: dateFormat
            };
            if (isToday) {
                calendarDay.name = "Today";
            }
            calendarWeekCollection.push(calendarDay);
        }
        calendarWeekView = new CalendarWeekView({
            collection: calendarWeekCollection
        });
        $el.find(".calendar-list-container").append(calendarWeekView.render().el);
        var filters = null, selectedDate = EQ.Helpers.dateTime.getCurrentDay();
        Backbone.Events.on("classes-list:filterByDay", function(data) {
            selectedDate = EQ.Helpers.dateTime.getCurrentDay(data.date);
            Backbone.Events.trigger("classes-list:fetch", null);
        });
        Backbone.Events.on("classes-list:fetch", function(data) {
            if (data) {
                filters = data;
            }
            console.log(filters, data);
            if (filters === null) {
                BikeClasses.loaderAndError.hideLoader();
                BikeClasses.loaderAndError.hideError();
                window.tagData.search.results = "0";
                if (BikeClasses.currentXHR !== null) {
                    console.log("abort xhr");
                    BikeClasses.currentXHR.abort();
                }
                var emptyView = new EmptyFilterView();
                emptyView.listenTo(Backbone.Events, "classes-list:remove-classes", emptyView.remove);
                $(".bike-classes-container .bike-classes").remove();
                $(".bike-classes-container").append(emptyView.render().el);
            } else {
                if (filters.clubs.length > 0) {
                    window.tagData.search.filterLocationIds = filters.clubs ? filters.clubs.length === 0 ? "na" : filters.clubs.toString() : "na";
                }
                if (filters.classes.length > 0) {
                    window.tagData.search.filterClassIds = filters.classes ? filters.classes.length === 0 ? "na" : filters.classes.toString() : "na";
                }
                if (filters.instructors.length > 0) {
                    window.tagData.search.filterInstructorIds = filters.instructors ? filters.instructors.length === 0 ? "na" : filters.instructors.toString() : "na";
                }
                window.tagData.search.filterClassIds = "na";
                window.tagData.search.filterClassType = "na";
                BikeClasses.refreshList($el, {
                    date: selectedDate,
                    clubs: filters.clubs || "",
                    classes: filters.classes || "",
                    instructors: filters.instructors || ""
                });
            }
        });
        Backbone.Events.on("classes-list:remove-filters", function() {
            filters = null;
        });
    };
    BikeClasses.currentXHR = null;
    BikeClasses.refreshList = function($el, data) {
        BikeClasses.loaderAndError.hideError();
        BikeClasses.loaderAndError.showLoader();
        if (BikeClasses.currentXHR !== null) {
            BikeClasses.currentXHR.abort();
        }
        var bikeClassCollection = new BikeClassCollection();
        window.tagData.search.results = bikeClassCollection ? bikeClassCollection.length.toString() : "0";
        $el.find(".bike-classes-container .bike-classes").remove();
        bikeClassCollection.configRequest({
            fromDate: moment(data.date.startDate).startOf("day").format("YYYY-MM-DD"),
            toDate: moment(data.date.endDate).startOf("day").format("YYYY-MM-DD"),
            clubs: data.clubs || [],
            classes: data.classes || [],
            instructors: data.instructors || []
        });
        BikeClasses.currentXHR = bikeClassCollection.fetch({
            xhrFields: {
                withCredentials: true
            },
            success: function(collection, response) {
                debug("[BIKECLASSES SERVICE OK]", response, response.classes.length);
                BikeClasses.loaderAndError.hideLoader();
                window.tagData.search.results = response.classes.length;
                if (response.classes.length === 0) {
                    var emptyView = new EmptyView();
                    $el.find(".bike-classes-container").append(emptyView.render().el);
                } else {
                    var bikeClassesListView = new BikeClassesListView({
                        collection: collection
                    });
                    $el.find(".bike-classes-container").append(bikeClassesListView.render().el);
                }
            },
            error: function(xhr, textStatus) {
                if (textStatus.statusText !== "abort") {
                    debug("Server Error");
                    BikeClasses.loaderAndError.showError();
                }
            }
        });
    };
    App.Components["bike-classes"] = function($el) {
        BikeClasses.init($el);
        BikeClasses.loaderAndError.showLoader();
        if (EQ.Helpers.getQueryStringVariable("clubs")) {
            (function() {
                var flattenedClubs = [];
                _.each(allRegionsData, function(region) {
                    if (region.SubRegions.length === 0) {
                        _.each(region.Facilities, function(facilty) {
                            flattenedClubs.push(facilty);
                        });
                    } else {
                        _.each(region.SubRegions, function(subregion) {
                            _.each(subregion.Facilities, function(facilty) {
                                flattenedClubs.push(facilty);
                            });
                        });
                    }
                });
                var clubs = [];
                EQ.Helpers.getQueryStringVariable("clubs").split(",").forEach(function(c) {
                    var club = _.find(flattenedClubs, {
                        Id: c
                    });
                    if (club) {
                        clubs.push({
                            displayText: club.ClubName,
                            id: c,
                            score: 1
                        });
                    }
                });
                Backbone.Events.trigger("classes-filter:add-filters", {
                    clubs: clubs
                });
            })();
        }
        if (EQ.Helpers.getQueryStringVariable("instructors")) {
            (function() {
                var ids = EQ.Helpers.getQueryStringVariable("instructors");
                $.ajax({
                    type: "GET",
                    url: APIEndpoint + "/classes/instructors?instructorIds=" + ids,
                    contentType: "application/json",
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function(instructors) {
                        instructors.forEach(function(instructor) {
                            instructor.score = 1;
                            instructor.displayText = instructor.displayName;
                        });
                        Backbone.Events.trigger("classes-filter:add-filters", {
                            instructors: instructors
                        });
                    }
                });
            })();
        }
        if (EQ.Helpers.getQueryStringVariable("classes")) {
            (function() {
                var classesIds = [];
                var preIds = EQ.Helpers.getQueryStringVariable("classes").split(",");
                for (var i = 0; i < preIds.length; i++) {
                    var c = preIds[i];
                    var id = parseInt(c, 0);
                    if (!isNaN(id)) {
                        classesIds.push(id);
                    }
                }
                if (classesIds.length > 0) {
                    classesIds.forEach(function(c) {
                        $.ajax({
                            type: "GET",
                            url: APIEndpoint + "/classes/small/" + c,
                            contentType: "application/json",
                            xhrFields: {
                                withCredentials: true
                            },
                            dataType: "json",
                            success: function(data) {
                                Backbone.Events.trigger("classes-filter:add-filters", {
                                    classes: [ {
                                        displayText: data.className,
                                        id: data.classId,
                                        score: 1
                                    } ]
                                });
                            }
                        });
                    });
                }
            })();
        }
        var anyQueryString = EQ.Helpers.getQueryStringVariable("clubs") !== false || EQ.Helpers.getQueryStringVariable("classes") !== false || EQ.Helpers.getQueryStringVariable("instructors") !== false;
        if (anyQueryString) {
            if (EQ.Helpers.getQueryStringVariable("clubs") === false && EQ.Helpers.getQueryStringVariable("instructors") === false) {
                if (user) {
                    EQ.Helpers.user.getFavorites(function(data) {
                        Backbone.Events.trigger("classes-filter:add-filters", {
                            clubs: data.clubs
                        });
                    }, function() {
                        Backbone.Events.trigger("classes-list:fetch", null);
                    });
                }
            }
        } else {
            if (user) {
                EQ.Helpers.user.getFavorites(function(data) {
                    Backbone.Events.trigger("classes-filter:add-filters", {
                        clubs: data.clubs
                    });
                }, function() {
                    Backbone.Events.trigger("classes-list:fetch", null);
                });
            }
        }
    };
    window.track("search", window.tagData.search);
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
