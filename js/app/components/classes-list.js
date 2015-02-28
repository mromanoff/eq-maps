(function (App) {
    'use strict';

    /* global APIEndpoint, APIEndpoint26, allRegionsData, Backbone, debug, _, moment, EQ, user */

    App.Components['classes-list'] = function ($el) {
        // Check for ACCE
        var ACCEEnabled = false;

        var ClassesList = {};

        ClassesList.desktopTabViewClassesCount = [];
        ClassesList.mobileViewClassesCount = 0;
        
        ClassesList.currentXHR = null;
        ClassesList.currentFilters = null;

        // QS DATE
        if (EQ.Helpers.getQueryStringVariable('date')) {
            ClassesList.currentDate = moment(EQ.Helpers.getQueryStringVariable('date'));
        } else {
            ClassesList.currentDate = moment();
        }

        //Omniture Tag
        window.tagData = window.tagData || {};
        window.tagData.search = window.tagData.search || {};
        window.tagData.search.type = 'class';

        // Dropdowns Toggle
        $('.classes-list .toggle-day').on('click', function (e) {
            e.preventDefault();
            $(this).parent().toggleClass('active');
            $(this).find('span').toggleClass('icon-right-arrow icon-dropdown');
        });

        // Selected day fetch
        Backbone.Events.on('dayfilter:click', function (e) {
            e.preventDefault();
            var day = $(e.currentTarget).data('date');
            if (ClassesList.currentDate !== day) {
                Backbone.Events.trigger('classes-list:fetch', null, day);
            }
        });

        // Week change fetch
        Backbone.Events.on('dayfilter:prev-week', function () {
            var week = moment(ClassesList.currentDate).subtract(1, 'week');
            Backbone.Events.trigger('classes-list:fetch', null, week);
        });
        Backbone.Events.on('dayfilter:next-week', function () {
            var week = moment(ClassesList.currentDate).add(1, 'week');
            Backbone.Events.trigger('classes-list:fetch', null, week);
        });

        // Day change fetch
        Backbone.Events.on('dayfilter:prev-day', function () {
            var day = moment(ClassesList.currentDate).subtract(1, 'day');
            Backbone.Events.trigger('classes-list:fetch', null, day);
        });
        Backbone.Events.on('dayfilter:next-day', function () {
            var day = moment(ClassesList.currentDate).add(1, 'day');
            Backbone.Events.trigger('classes-list:fetch', null, day);
        });

        // Switch Days on mobile
        Backbone.Events.on('dayfilter-mobile:click', function (e) {
            e.preventDefault();

            var day = $(e.currentTarget).data('index');

            // Change current indicator
            $('.calendar-list-container').find('.mobile-first').removeClass('mobile-first');
            $('.calendar-list-container').find('.mobile-current').removeClass('mobile-current');
            $(e.currentTarget).addClass('mobile-current');

            // Show/Hide Days
            $el.find('.classes-day.current').removeClass('current');
            $el.find('[data-day="' + day + '"]').addClass('current');
        });

        // Models
        var ClassModel = Backbone.Model.extend({});

        // Views
        var DatesHeaderView = Backbone.View.extend({
            el: $('.classes-list .day-dates'),
            initialize: function (options) {
                // Attach options to the view.
                this.options = {};
                _.extend(this.options, options);
            },
            render: function () {
                this.$el.html('');
                //Add week
                for (var i = 0; i <= 6; i++) {
                    var day = moment(this.options.startDate);

                    day.add('days', i);

                    var name = moment(day).format('ddd'),
                        month = moment(day).format('MMM'),
                        number = moment(day).format('D'),
                        isToday = moment(day).isSame(moment(), 'day') ? 'current-day' : '',
                        isSelected = moment(day).isSame(this.options.startDate, 'day') ? 'current-day' : '';

                    console.log(isToday);

                    var calendarDay = {
                        'name': name,
                        'date': month + ' ' + number,
                        'isToday': isToday,
                        'isSelected': isSelected
                    };

                    if (isToday) {
                        calendarDay.name = 'Today';
                    }

                    // Set data-date for the dates containers.
                    $el.find('[data-day="' + (i + 1) + '"]').attr('data-date', moment(day).format('YYYY-MM-DD'));

                    // Append days headers.
                    var dayHeaderTpl = _.template($('#dayHeaderTemplate').html());
                    this.$el.append(dayHeaderTpl(calendarDay));
                }
            }
        });

        var EmptyResultsView = Backbone.View.extend({
            template: _.template($('#emptyResult').html()),
            events: {
                'click .clear-filters': 'clearFilters'
            },
            clearFilters: function (e) {
                e.preventDefault();
                Backbone.Events.trigger('classes-list:remove-filters');
                Backbone.Events.trigger('classes-list:fetch', null);
            },
            initialize: function () {
                this.listenTo(Backbone.Events, 'classes-list:fetch', this.remove);
            },
            render: function () {
                this.setElement(this.template({}));
                return this;
            }
        });

        var EmptyFilterView = Backbone.View.extend({
            template: _.template($('#emptyFilterResult').html()),
            initialize: function () {
                this.listenTo(Backbone.Events, 'classes-list:fetch', this.remove);
            },
            render: function () {
                this.setElement(this.template({}));
                return this;
            }
        });

        var EmptyDayView = Backbone.View.extend({
            template: _.template($('#emptyDay').html()),
            initialize: function () {
                this.listenTo(Backbone.Events, 'classes-list:fetch', this.remove);
            },
            render: function () {
                this.setElement(this.template({}));
                return this;
            }
        });

        var DayView = Backbone.View.extend({
            template: _.template($('#classTemplate').html()),
            events: {
                'click .add': 'addClass'
            },
            'addClass': function (e) {
                e.preventDefault();
                var self = this,
                    ENDPOINT = APIEndpoint26 + '/me/calendar/' + this.model.get('classInstanceId') + '?isRecurring=false',
                    loaderAndError,
                    $link = self.$el.find('a.add'),
                    $message = self.$el.find('.message');

                // Loader init
                loaderAndError = EQ.Helpers.loaderAndErrorHandler(self.$el.find('.add'), {
                    type: 'button'
                });
                loaderAndError.showLoader();
                var currentDateTime = this.model.get('facilityCurrentDateTime');
                var addClassSuccess = function (data) {
                    debug('[ADDCLASS OK]', data);


                    //Omniture classAction
                    window.tagData.classAction = window.tagData.classAction || {};
                    window.tagData.classAction = {
                        module: ''
                    };

                    var timeOffset = moment(data.result.startDate).diff(currentDateTime, 'hours'),
                    timeOffsetMinutes = moment(data.result.startDate).diff(currentDateTime, 'minutes');

                    if (timeOffset || timeOffsetMinutes) {

                        if (timeOffset > 0) {
                            timeOffset = Math.floor(timeOffset);
                        } else {
                            timeOffset = Math.ceil(timeOffset);
                        }

                        if (timeOffset === 0) {
                            if (timeOffsetMinutes > 0) {
                                timeOffset = 1;
                            } else {
                                timeOffset = -1;
                            }
                        }
                    }
                    window.tagData.classInstance = window.tagData.classInstance || {};
                    window.tagData.classInstance = {
                        classId: data ? (data.result.classId !== '' && data.result.classId !== null ? data.result.classId.toString() : '') : '',
                        facilityId: data ? (data.result.facilityId !== '' && data.result.facilityId !== null ? data.result.facilityId.toString() : '') : '',
                        classInstanceId: data ? (data.result.classInstanceId !== '' && data.result.classInstanceId !== null ? data.result.classInstanceId.toString() : '') : '',
                        categoryId: data ? (data.result.workoutCategoryId !== '' && data.result.workoutCategoryId !== null ? data.result.workoutCategoryId.toString() : '') : '',
                        timeOffset: timeOffset ? timeOffset.toString() : ''
                    };

                    window.track('classCalendarAdd', window.tagData.classAction);

                    loaderAndError.hideLoader();

                    $link.remove();
                    $message.removeClass('closed');
                    setTimeout(function () {
                        $message.addClass('closed');
                    }, 5000);

                    self.$el.find('.class-added').removeClass('hidden');
                },
                addClassError = function (d) {
                    loaderAndError.hideLoader();

                    if (d.status === 401) {
                        self.$el.find('.grey-popup').fadeIn().delay(5000).fadeOut();
                    } else {
                        debug('server error', d);
                        $link.remove();
                        $message.find('.copy').html('<p><strong></strong></p>').find('strong').text(d.responseJSON.error.message || d.responseJSON.message);
                        $message.addClass('bike').removeClass('closed');
                        setTimeout(function () {
                            $message.addClass('closed');
                        }, 5000);
                    }
                };
                $.ajax({
                    type: 'POST',
                    url: ENDPOINT,
                    contentType: 'application/json',
                    xhrFields: { 'withCredentials': true },
                    dataType: 'json',
                    success: function (data, methodName, d) {
                        console.log(arguments);
                        if (data.error) {
                            addClassError(d);
                        } else {
                            addClassSuccess(data);
                        }
                    },
                    error: function (d) {
                        addClassSuccess(d);
                    }
                });
            },
            render: function () {
                var data = this.model.toJSON();

                data.isPastACCE = moment(data.startDate).isBefore(moment()) && ACCEEnabled;

                console.log(data.isPastACCE);

                this.setElement(this.template(data));
                return this;
            }
        });

        // Collections
        var ClassCollection = Backbone.Collection.extend({
            model: ClassModel,
            configRequest: function (options) {
                this.options = {};
                _.extend(this.options, options);
            },
            url: function () {
                var url = APIEndpoint26 + '/search/classes';
                return url;
            }
        });

        ClassesList.loaderAndError = EQ.Helpers.loaderAndErrorHandler($('.classes-list .loader-holder'), {
            color: 'black'
        });

        ClassesList.refresh = function (data, date) {
            var startDate = new Date();

            // Dates Headers
            var datesHeaderView = new DatesHeaderView({
                startDate: moment(date || startDate)
            }),
                $loader = $('.classes-list .loader-holder'),
                $classesListError = $('.classes-list .error-state');

            datesHeaderView.render();

            // Cancel ongoing request.
            if (ClassesList.currentXHR !== null) {
                ClassesList.currentXHR.abort();
            }

            var classCollection = new ClassCollection();
            window.tagData.search.results = classCollection ? classCollection.length.toString() : '0';

            // Update QS with date
            EQ.Helpers.setQueryStringVariable('date', moment(EQ.Helpers.dateTime.getCurrentDay(date || startDate).startDate).format('YYYY-MM-DD'), false, true);

            // Configure class search request with filters
            classCollection.configRequest({
                'fromDate': moment(EQ.Helpers.dateTime.getCurrentDay(date || startDate).startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss\\Z'),
                'toDate': moment(EQ.Helpers.dateTime.getCurrentDay(date || startDate).startDate).add('week', 1).startOf('day').format('YYYY-MM-DDTHH:mm:ss\\Z'),
                'clubs': data.clubs || [],
                'instructors': data.instructors || [],
                'categories': data.categories || [],
                'classes': data.classes || []
            });

            console.log(date, classCollection.options.fromDate);

            // Loader & Errors
            $loader.removeClass('hidden');
            $classesListError.removeClass('hidden');
            $('.results-list').addClass('hidden');

            ClassesList.loaderAndError.hideError();
            ClassesList.loaderAndError.showLoader();

            ClassesList.classesCount = function ($this, index) {
                $this.find('li').each(function () {
                    var $self = $(this);

                    if ($self.find('.wrapper:not(.empty)').length) {
                        ClassesList.desktopTabViewClassesCount[index] += 1;
                        ClassesList.mobileViewClassesCount += 1;
                    }
                });
            };

            EQ.Helpers.getService('/v2.6/workouts/categories').done(function (WorkoutCategories) {
                // Fetch
                ClassesList.currentXHR = classCollection.fetch({
                    'method': 'POST',
                    'data': JSON.stringify({
                        'startDate': classCollection.options.fromDate,
                        'endDate': classCollection.options.toDate,
                        'facilityIds': classCollection.options.clubs || [],
                        'instructorIds': classCollection.options.instructors || [],
                        'classCategoryIDs': classCollection.options.categories || [],
                        'classIds': classCollection.options.classes,
                        'dateIsUtc': false
                    }),
                    'xhrFields': { 'withCredentials': true },
                    'contentType': 'application/json',
                    'dataType': 'json',
                    'success': function (collection, response) {
                        ClassesList.loaderAndError.hideLoader();

                        if (response.classes.length === 0) {
                            $loader.addClass('hidden');

                            var emptyView = new EmptyResultsView();
                            emptyView.listenTo(Backbone.Events, 'classes-list:remove-classes', emptyView.remove);
                            $classesListError.html(emptyView.render().el);
                        } else {
                            $('.results-list').removeClass('hidden');
                            $loader.addClass('hidden');
                            $classesListError.addClass('hidden');

                            response.classes.forEach(function (c) {
                                // Class Model
                                var classModel = new ClassModel(c);

                                // Add Categories
                                classModel.set('primaryCategory', _.findWhere(WorkoutCategories, {categoryId: '' + classModel.get('workoutCategoryId')}));

                                // Create dayView
                                var dayView = new DayView({
                                    model: classModel
                                });

                                dayView.listenTo(Backbone.Events, 'classes-list:remove-classes', dayView.remove);
                                $('[data-period="' + c.timeSlot.toLowerCase() + '"] [data-date="' + moment(c.startLocal).format('YYYY-MM-DD') + '"]').append(dayView.render().el);
                            });

                            /*
                            // -- commented for DPLAT-5240 -- //

                            $('[data-period]').removeClass('active');
                            $('[data-period]').find('.toggle-day span').removeClass('icon-dropdown');
                            $('[data-period]').find('.toggle-day span').addClass('icon-right-arrow');

                            if (moment().isBefore(moment('12:59:59', 'HH:mm:ss'))) {
                                $('[data-period="morning"]').addClass('active');
                                $('[data-period="morning"]').find('.toggle-day span').addClass('icon-dropdown');
                                $('[data-period="morning"]').find('.toggle-day span').removeClass('icon-right-arrow');
                            } else if (moment().isAfter(moment('13:00:00', 'HH:mm:ss')) && moment().isBefore(moment('15:59:59', 'HH:mm:ss'))) {
                                $('[data-period="afternoon"]').addClass('active');
                                $('[data-period="afternoon"]').find('.toggle-day span').removeClass('icon-right-arrow');
                                $('[data-period="afternoon"]').find('.toggle-day span').addClass('icon-dropdown');
                            } else if (moment().isAfter(moment('16:00:00', 'HH:mm:ss'))) {
                                $('[data-period="evening"]').addClass('active');
                                $('[data-period="evening"]').find('.toggle-day span').removeClass('icon-right-arrow');
                                $('[data-period="evening"]').find('.toggle-day span').addClass('icon-dropdown');
                            }
                            */
                            // Reset class count
                            ClassesList.desktopTabViewClassesCount = [0, 0, 0, 0, 0, 0, 0];
                            ClassesList.mobileViewClassesCount = 0;
                            
                            $('[data-period] [data-day]').each(function () {
                                var $this = $(this);

                                if ($this.children().length === 0) {
                                    var emptyDayView = new EmptyDayView();
                                    emptyDayView.listenTo(Backbone.Events, 'classes-list:remove-classes', emptyDayView.remove);

                                    if ($this.data('period') !== 'morning') {
                                        $(emptyDayView.render().el).addClass('is-tablet is-desktop');
                                    }

                                    $this.prepend(emptyDayView.render().el);
                                }

                                // Calculate class count
                                if ($this.data('day') === 1) {
                                    ClassesList.classesCount($this, 0);
                                }
                                else if ($this.data('day') === 2) {
                                    ClassesList.classesCount($this, 1);
                                }
                                else if ($this.data('day') === 3) {
                                    ClassesList.classesCount($this, 2);
                                }
                                else if ($this.data('day') === 4) {
                                    ClassesList.classesCount($this, 3);
                                }
                                else if ($this.data('day') === 5) {
                                    ClassesList.classesCount($this, 4);
                                }
                                else if ($this.data('day') === 6) {
                                    ClassesList.classesCount($this, 5);
                                }
                                else if ($this.data('day') === 7) {
                                    ClassesList.classesCount($this, 6);
                                }
                            });

                            // Render class count for desktop & tablet view
                            $('.day-dates li').each(function (i) {
                                $(this).find('.class-count').html(ClassesList.desktopTabViewClassesCount[i] + ' classes');
                            });

                            // Render class count for mobile view
                            $('#mobile-class-count').html(ClassesList.mobileViewClassesCount + ' classes');
                            
                            // Append "empty day" view to days without events inside.
                            var tallestClass = 0;

                            $('[data-day] li').each(function () {
                                if ($(this).height() >= tallestClass) {
                                    tallestClass = $(this).height();
                                }
                            });

                            $('[data-day] li').height(tallestClass);

                            window.tagData.search.results = response.classes.length.toString();
                        }


                    },
                    'error': function (xhr, textStatus) {
                        if (textStatus !== 'abort') {
                            debug('Server Error');
                            ClassesList.loaderAndError.hideLoader();
                            ClassesList.loaderAndError.showError();
                        }
                    }
                });
            }).fail(function () {
                ClassesList.loaderAndError.hideLoader();
                ClassesList.loaderAndError.showError();
            });
        };

        ClassesList.fixHeader = function () {
            if ($('.classes-list .day-dates')) {
                var pos = $('.classes-list .day-dates').offset().top;
                $(window).on('scroll resize', function () {
                    var height = $('.main .full-wrapper').height();
                    var pos2 = $(document).scrollTop();
                    if (height <= 62) {
                        if ((pos2 + 130) > pos) {
                            $('.classes-list .day-dates').addClass('fixedNav');
                            $('.classes-list .day-dates').next().css({ 'paddingTop': '90px' });
                        } else {
                            $('.classes-list .day-dates').removeClass('fixedNav');
                            $('.classes-list .day-dates').next().css({ 'paddingTop': '0' });
                        }
                    } else if (height >= 125) {
                        if ((pos2 + 130) > pos) {
                            $('.classes-list .day-dates').addClass('fixedNav2');
                            $('.classes-list .day-dates').next().css({ 'paddingTop': '160px' });
                        } else {
                            $('.classes-list .day-dates').removeClass('fixedNav2');
                            $('.classes-list .day-dates').next().css({ 'paddingTop': '0' });
                        }
                    }
                });
            }
        };

        ClassesList.fixHeader();

        ClassesList.init = function () {
            Backbone.Events.on('classes-list:remove-filters', function () {
                ClassesList.currentFilters = null;
            });

            
            //$(window).on('scroll', function () {
            //    ClassesList.fixHeader();
            //});

            // Init Class Search (Bind event for future updates)
            Backbone.Events.on('classes-list:fetch', function (data, date) {
                $('#mobile-class-count').empty();
                
                Backbone.Events.trigger('classes-list:remove-classes');

                if (data) {
                    ClassesList.currentFilters = data;
                }

                

                if (ClassesList.currentFilters === null || (ClassesList.currentFilters.classes.length === 0 && ClassesList.currentFilters.clubs.length === 0 && ClassesList.currentFilters.instructors.length === 0)) {
                    if (ClassesList.currentXHR !== null) {
                        ClassesList.currentXHR.abort();
                    }
                    $('.classes-list .loader-holder').addClass('hidden');
                    $('.results-list').addClass('hidden');
                    var emptyView = new EmptyFilterView();
                    emptyView.listenTo(Backbone.Events, 'classes-list:remove-classes', emptyView.remove);
                    $('.classes-list .error-state').removeClass('hidden').html(emptyView.render().el);
                    window.tagData.search.filterLocationIds = 'na';
                    window.tagData.search.results = '0';
                } else {
                    if (ClassesList.currentFilters.clubs) {
                        window.tagData.search.filterLocationIds = data ? (data.clubs.length === 0 ? 'na' : data.clubs.toString()) : 'na';
                    }
                    if (ClassesList.currentFilters.categories) {
                        window.tagData.search.filterCategoryIds = data ? (data.categories.length === 0 ? 'na' : data.categories.toString()) : 'na';
                    }
                    if (ClassesList.currentFilters.classes) {
                        window.tagData.search.filterClassIds = data ? (data.classes.length === 0 ? 'na' : data.classes.toString()) : 'na';
                    }
                    if (ClassesList.currentFilters.instructors) {
                        window.tagData.search.filterInstructorIds = data ? (data.instructors.length === 0 ? 'na' : data.instructors.toString()) : 'na';
                    }
                    //window._satellite = window._satellite || {};
                    //window._satellite.pageBottom();

                    window.tagData.search.filterClassType = 'na';

                    // If there is a date, re-populate the current week
                    if (date) {
                        ClassesList.currentDate = date;
                        Backbone.Events.trigger('classes-list:generate-week', ClassesList.currentDate);
                    }

                    // Update "current" week
                    var week = moment(ClassesList.currentDate),
                        weekText = week.isSame(moment(), 'week') ? 'This Week' : week.format('D') + '-' + week.add(6, 'day').format('D') + ' ' + week.format('MMM');

                    $('.classes-calendar .current-week').text(weekText);

                    // Reset to first day
                    $('.classes-day-container').find('.classes-day.current').removeClass('current');
                    $('.classes-day-container').find('[data-day="1"]').addClass('current');

                    // Fetch Classes
                    if (user) {
                        EQ.Helpers.getService('/v2.6/me/profile/acce').always(function (data) {
                            if (data && data.acceEnabled === true) {
                                ACCEEnabled = true;
                            }
                            ClassesList.refresh(ClassesList.currentFilters || {}, ClassesList.currentDate || '');
                        });
                    } else {
                        ClassesList.refresh(ClassesList.currentFilters || {}, ClassesList.currentDate || '');
                    }
                }
            });

            // Fill in category based from querystring
            if (EQ.Helpers.getQueryStringVariable('categories')) {
                (function () {
                    var categories = [],
                        categoriesIds = [];

                    //Check for NaN
                    var preIds = EQ.Helpers.getQueryStringVariable('categories').split(',');

                    for (var i = 0; i < preIds.length; i++) {
                        var c = preIds[i];
                        var id = parseInt(c, 0);
                        if (!isNaN(id)) {
                            categoriesIds.push(id);
                        }
                    }

                    $.ajax({
                        type: 'GET',
                        url: APIEndpoint + '/classes/categories',
                        contentType: 'application/json',
                        xhrFields: { 'withCredentials': true },
                        dataType: 'json',
                        success: function (data) {
                            categoriesIds.forEach(function (c) {
                                console.log(c);
                                var cat = _.find(data, { categoryId: '' + c });
                                if (cat) {
                                    categories.push({
                                        displayText: cat.categoryName,
                                        id: c,
                                        score: 1
                                    });
                                }
                            });
                            Backbone.Events.trigger('classes-filter:add-filters', {
                                categories: categories
                            });
                        }
                    });
                })();
            }

            if (EQ.Helpers.getQueryStringVariable('clubs')) {
                (function () {
                    // Flatten facilities for easier search
                    var flattenedClubs = [];
                    _.each(allRegionsData, function (region) {
                        if (region.SubRegions.length === 0) {
                            _.each(region.Facilities, function (facilty) {
                                flattenedClubs.push(facilty);
                            });
                        } else {
                            _.each(region.SubRegions, function (subregion) {
                                _.each(subregion.Facilities, function (facilty) {
                                    flattenedClubs.push(facilty);
                                });
                            });
                        }
                    });

                    // Add to filters
                    var clubs = [];

                    EQ.Helpers.getQueryStringVariable('clubs').split(',').forEach(function (c) {
                        var club = _.find(flattenedClubs, { 'Id': c });
                        if (club) {
                            clubs.push({
                                displayText: club.ClubName,
                                id: c,
                                score: 1
                            });
                        }
                    });

                    Backbone.Events.trigger('classes-filter:add-filters', {
                        clubs: clubs
                    });
                })();
            }

            // Instructors
            if (EQ.Helpers.getQueryStringVariable('instructors')) {
                (function () {
                    var ids = EQ.Helpers.getQueryStringVariable('instructors');

                    $.ajax({
                        type: 'GET',
                        url: APIEndpoint + '/classes/instructors?instructorIds=' + ids,
                        contentType: 'application/json',
                        xhrFields: { 'withCredentials': true },
                        dataType: 'json',
                        success: function (instructors) {
                            // Add score to match expected object
                            // displayName -> displayText
                            instructors.forEach(function (instructor) {
                                instructor.score = 1;
                                instructor.displayText = instructor.displayName;
                            });

                            // Add to filters
                            Backbone.Events.trigger('classes-filter:add-filters', {
                                instructors: instructors
                            });
                        }
                    });
                })();
            }

            // Classes
            if (EQ.Helpers.getQueryStringVariable('classes')) {
                (function () {
                    var classesIds = [];
                    //Check for NaN
                    var preIds = EQ.Helpers.getQueryStringVariable('classes').split(',');

                    for (var i = 0; i < preIds.length; i++) {
                        var c = preIds[i];
                        var id = parseInt(c, 0);
                        if (!isNaN(id)) {
                            classesIds.push(id);
                        }
                    }

                    if (classesIds.length > 0) {
                        classesIds.forEach(function (c) {
                            $.ajax({
                                type: 'GET',
                                url: APIEndpoint + '/classes/small/' + c,
                                contentType: 'application/json',
                                xhrFields: { 'withCredentials': true },
                                dataType: 'json',
                                success: function (data) {
                                    Backbone.Events.trigger('classes-filter:add-filters', {
                                        classes: [{
                                            displayText: data.className,
                                            id: data.classId,
                                            score: 1
                                        }]
                                    });
                                }
                            });
                        });
                    }
                })();
            }

            ClassesList.loaderAndError.showLoader();

            var anyQueryString = EQ.Helpers.getQueryStringVariable('clubs') !== false || EQ.Helpers.getQueryStringVariable('categories') !== false || EQ.Helpers.getQueryStringVariable('classes') !== false || EQ.Helpers.getQueryStringVariable('instructors') !== false;

            // AddDefaults -> What should we add to the filters based on the QS, Favorites and logged status.
            if (anyQueryString) {
                if (EQ.Helpers.getQueryStringVariable('clubs') === false && EQ.Helpers.getQueryStringVariable('instructors') === false && EQ.Helpers.getQueryStringVariable('classes') === false) {
                    if (user) {
                        EQ.Helpers.user.getFavorites(function (data) {
                            Backbone.Events.trigger('classes-filter:add-filters', {
                                clubs: data.clubs
                            });
                        }, function () {
                            Backbone.Events.trigger('classes-list:fetch', null);
                        });
                    } else {
                        EQ.Geo.getLatLng(function () {
                            EQ.Geo.getNearestClub(function (club) {
                                Backbone.Events.trigger('classes-filter:add-filters', {
                                    clubs: [{
                                        displayText: club.ClubName,
                                        id: club.Id,
                                        score: 1
                                    }]
                                });
                            });
                        });
                    }
                }
            } else {
                if (user) {
                    EQ.Helpers.user.getFavorites(function (data) {
                        Backbone.Events.trigger('classes-filter:add-filters', {
                            clubs: data.clubs,
                            categories: data.categories
                        });
                    }, function () {
                        Backbone.Events.trigger('classes-list:fetch', null);
                    });
                } else {
                    EQ.Geo.getLatLng(function () {
                        EQ.Geo.getNearestClub(function (club) {
                            Backbone.Events.trigger('classes-filter:add-filters', {
                                clubs: [{
                                    displayText: club.ClubName,
                                    id: club.Id,
                                    score: 1
                                }]
                            });
                        });
                    });
                }
            }

            if (user) {
                EQ.Helpers.getService('/v2.6/me/profile/acce').done(function (data) {
                    console.log('ACCE', data);

                    if (data.acceEnabled === null) {
                        var $caloriesOverlay = $('<div></div>');

                        $('.page').append($caloriesOverlay);
                        App.loadComponent('automatic-calories-overlay', $caloriesOverlay, {}, function () {
                            Backbone.Events.trigger('automatic-calories-overlay:open');
                        });
                    }
                });
            }
        };

        ClassesList.init();

        window.track('search', window.tagData.search);
        //window._satellite = window._satellite || {};
        //window._satellite.pageBottom();
    };

}(window.App));