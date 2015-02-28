(function (global, App) {
    'use strict';

    /* global APIEndpoint26, debug, EQ, moment, localStorage */

    var Backbone = global.Backbone,
        _ = global._;

    /**
    * Models
    */

    var UpcomingClass = Backbone.Model.extend({
        defaults: {
            startDate: '',
            endDate: '',
            eventType: '',
            facility: null,
            name: '',
            trainerName: ''
        }
    });

    var Event = Backbone.Model.extend();

    /**
    * Views Helpers
    */

    var DaySingleViewHelpers = {
        isCurrentDay: function () {
            //var today = new Date();
            // return this.id === today.getDay() ? true : false;

            return moment(this.date.format('YYYY-MM-DD')).isSame(moment().format('YYYY-MM-DD')) ? true : false;
        },
        getDateString: function (dateString) {
            return EQ.Helpers.dateTime.convertDateToString(dateString);
        },
        getCurrentDay: function () {
            var currentDay = new Date(),
                currentDayString;

            // note: 'toLocaleString' is cleaner but doesn't work on FF
            currentDayString = currentDay.toString().substr(4, 6);

            return currentDayString;
        },
        getInstructors: function (instructors) {
            var instructorsString;

            if (instructors.length) {
                _.each(instructors, function (instructor) {
                    if (_.isNull(instructor.substitute)) {
                        instructorsString = instructor.instructor.firstName + ' ' + instructor.instructor.lastName;
                    } else {
                        instructorsString = instructor.substitute.firstName + ' ' + instructor.substitute.lastName + ' (SUB)';
                    }
                });
            }

            return instructorsString;
        },
        getEventDuration: function (eventDetail) {
            return EQ.Helpers.dateTime.getTimeRange(eventDetail.startDate, eventDetail.endDate);
        }
    };

    /**
    * Views
    */

    var CalendarContainerView = Backbone.View.extend({
        events: {
            'click a.calendar-menu.calendar': 'showCalendar'
            //'click a.calendar-menu.workout': 'showWorkout'
        },
        showCalendar: function (e) {
            e.preventDefault();
            var calendarIsEmpty = this.collection.toJSON()[0].calendarIsEmpty;

            this.$el.find('.calendar-detail')
                .add('.calendar-box')
                .removeClass('hidden');

            this.$el.find('.workout-box').addClass('hidden');

            this.$el.find('a.calendar-menu.calendar').addClass('active');
            this.$el.find('a.calendar-menu.workout').removeClass('active');

            if (calendarIsEmpty) {
                this.$el.find('.no-classes-overlay').removeClass('hidden');
            }
        },
        showWorkout: function (e) {
            e.preventDefault();
            this.$el.find('.calendar-detail')
                .add('.calendar-box')
                .addClass('hidden');

            this.$el.find('.workout-box').removeClass('hidden');

            this.$el.find('a.calendar-menu.calendar').removeClass('active');
            this.$el.find('a.calendar-menu.workout').addClass('active');

            this.$el.find('.no-classes-overlay').addClass('hidden');
        },
        render: function () {
            var upcomingClassView,
                calendarIsEmpty = this.collection.toJSON()[0].calendarIsEmpty,
                calendarDays = this.collection.toJSON()[0].eventsByDay,
                upcomingClass = this.collection.toJSON()[0].upcomingEvent;

            if (calendarIsEmpty) {
                this.$el.find('.no-classes-overlay').removeClass('hidden');
            }

            // Init small calendar plugin
            App.loadComponent('week-calendar', this.$el.find('.calendar-box'), {
                weekData: calendarDays
            });

            // Init workout plugin
			//removed the plugin for now
			//App.loadComponent('mini-sessions', this.$el.find('.workout-box'));

            if (upcomingClass) {
                upcomingClassView = new UpcomingClassView({ model: new UpcomingClass(upcomingClass) });
                this.$el.find('section.upcoming-class').append(upcomingClassView.render().el);
            }

            return this;
        },
        renderActivity: function (visits) {
            var now = moment().startOf('month'),
                visitsCopy = visits === 1 ? ' check-in' : ' check-ins';
            this.$el.find('a.calendar-menu').text('view ' + now.format('MMMM') + ' activity');
            this.$el.find('.calendar-header-visits .visits-count').text(visits + visitsCopy);
        }
    });

    var UpcomingClassView = Backbone.View.extend({
        model: UpcomingClass,
        template: _.template($('#upcomingClassTemplate').html()),
        getRenderData: function () {
            var data = this.model.toJSON();
            return _.extend(data, DaySingleViewHelpers);
        },
        render: function () {
            this.$el.html(this.template(this.getRenderData()));
            return this;
        }
    });

    var CalendarSmall = {},
        WorkoutsCategories = null;


    CalendarSmall.init = function ($el) {
        var currentWeek = EQ.Helpers.dateTime.getCurrentWeek(),
            today = new Date(),
            fromDate = currentWeek.startDate,
            toDate = currentWeek.endDate,
            now = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(),
            url = APIEndpoint26 + '/me/calendar/preview?fromDate=' + fromDate + '&toDate=' + toDate + '&now=' + now,
            $expandCollapseButton = $el.find('button.expand-collapse'),
            hasCollapsed = localStorage.getItem('calendar_collapsed'),
            loaderAndError;

        // Loader init

        loaderAndError = EQ.Helpers.loaderAndErrorHandler($el.find('.small-calendar'));
        loaderAndError.showLoader();

        // Expand/Collapse behavior

        $expandCollapseButton.on('click', function (e) {
            e.preventDefault();
            var $buttonExpand = $(this).find('span');
            $el.closest('.columnsContainer').toggleClass('expanded');

            if ($buttonExpand.hasClass('icon-left-arrow')) {
                // It was Collapsed
                $buttonExpand.addClass('icon-right-arrow')
                    .removeClass('icon-left-arrow');
                localStorage.setItem('calendar_collapsed', false);
            } else {
                // It was Expanded
                $buttonExpand.addClass('icon-left-arrow')
                    .removeClass('icon-right-arrow');
                localStorage.setItem('calendar_collapsed', true);
            }
        });

        if (!hasCollapsed || hasCollapsed === 'false') {
            $expandCollapseButton.trigger('click');
        }

        // Calendar Request
        $.when(
        $.ajax({
            type: 'GET',
            url: url,
            contentType: 'application/json',
            xhrFields: { 'withCredentials': true },
            dataType: 'json'
        }),
        EQ.Helpers.getService('/v2.6/workouts/categories')
        ).done(function (calendardata, categoriesdata) {
            debug('[SMALL CALENDAR SERVICE OK]', calendardata[0]);
            
            WorkoutsCategories = categoriesdata[0];

            var calendarContainerView,
                parsedData = CalendarSmall.parseData(calendardata[0], fromDate);


            loaderAndError.hideLoader();

            calendarContainerView = new CalendarContainerView({
                el: $el,
                collection: new Backbone.Collection(parsedData)
            });
            calendarContainerView.render();

            calendarContainerView.renderActivity(calendardata[0].visitsCount);
        }).fail(function () {
            debug('Server Error');
            loaderAndError.showError();
        });

    };

    CalendarSmall.parseData = function (response, fromDate) {
        var parsedData = {},
            calendarIsEmpty = false,
            fromDateMoment = moment(fromDate),
            eventsByDay = {},
            newDay,
            dayCode;

        // Create empty days
        for (var i = 0; i < 7; i++) {
            newDay = fromDateMoment.add('day', (i !== 0) ? 1 : 0);
            dayCode = newDay.format('dd');

            eventsByDay[dayCode] = {
                date: moment(newDay.format()),
                model: []
            };
        }

        // Load the current events in the correct days
        if (response.eventsByDay.length) {
            _.each(response.eventsByDay, function (day) {
                var dayCode = day.dayOfWeek.substr(0, 2),
                    dateMoment = eventsByDay[dayCode].date;

                if (moment(dateMoment.format('YYYY-MM-DD'))
                    .isSame(moment().format('YYYY-MM-DD'))) {
                    eventsByDay[dayCode].specialClass = 'current-day';
                } else if (dateMoment.isBefore(moment())) {
                    eventsByDay[dayCode].specialClass = 'past';
                }

                _.each(day.events, function (event) {
                    // Add missing fields (facility, category and displaytime)
                    event.displayTime = moment(event.startLocal).format('hh:mm a') + '-' + moment(event.endLocal).format('hh:mm a');
                    
                    var facility = EQ.Helpers.getFacilityById(event.facilityId);

                    if (facility) {
                        event.facility = {
                            'facilityId': event.facilityId,
                            'clubId': facility.ClubID,
                            'name': facility.ClubName,
                            'shortName': facility.ShortName,
                            'mobileName': facility.ShortName,
                            'webName': facility.ShortName,
                            'urlName': facility.ShortName,
                            'timeZoneId': null,
                            'regionId': null,
                            'isPresale': facility.isPresale
                        };
                    } else {
                        event.facility = {};
                    }

                    event.primaryCategory = _.findWhere(WorkoutsCategories, {categoryId: '' + event.workoutCategoryId});

                    event.checkedInDetaild = null;

                    eventsByDay[dayCode].model.push(new Event(event));
                });
            });
        } else {
            calendarIsEmpty = true;
        }

        if (response.upcomingEvent) {
            parsedData.upcomingEvent = response.upcomingEvent;
        }

        parsedData.eventsByDay = eventsByDay;
        parsedData.calendarIsEmpty = calendarIsEmpty;

        return parsedData;
    };

    /**
    * Component Init.
    */

    App.Components.calendar = function ($el) {
        CalendarSmall.init($el);
    };

} (window, window.App));