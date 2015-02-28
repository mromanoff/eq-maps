(function (global, App) {
    'use strict';

    /* global APIEndpoint, APIEndpoint26, debug, EQ, moment */

    /*
     * Recommended Classes: Creates a list of recommended classes
     *
     * @param  {jQuery Object}      Component object reference
     * @param  {JSON Options Object}        Component Options
     *
     *      OPTIONS Object
     *
     *      hideDescription {Boolean}   Specifies if description should be hidden, shown by default
     *      showFilters {Boolean}       Specifies if filters should be displayed, hidden by default
     *      multipleItems {Boolean}     Specifies if on desktop/tablet should display multiple items
     *
     *      Example:
     *          {hideDescription: true, showFilters: true, multipleItems: true}
     */

    var Backbone = global.Backbone,
        _ = global._;

    /**
    * Models
    */

    var RecommendedClass = Backbone.Model.extend();

    /**
    * Collections
    */

    var RecommendedClassesCollection = Backbone.Collection.extend({
        model: RecommendedClass,
        url: function () {
            var url = APIEndpoint + '/me/classes/recommended';
            return url;
        },
        parse: function (response) {
            debug('[RECOMMENDED CLASSES SERVICE OK]', response);
            var classes = [];

            if (response.recommendedClasses.length) {
                _.each(response.recommendedClasses, function (event) {
                    classes.push(event);
                });
            }

            return classes;
        }
    });

    /**
    * Views Helpers
    */

    // TODO - These helpers are very similar to the ones used in calendar.js, maybe we can use 
    //  some abstraction to avoid code replication

    var ClassSingleViewHelpers = {
        getDateString: function (dateString) {
            return EQ.Helpers.dateTime.convertDateToString(dateString);
        },
        getInstructors: function (instructors) {
            var instructorsString;

            if (instructors.length) {
                _.each(instructors, function (instructor) {
                    instructorsString = instructor.instructor.firstName + ' ' + instructor.instructor.lastName;
                });
            }

            return instructorsString;
        },
        getClassId: function (model) {
            return model.classInstanceId;
        },
        getEventDuration: function (eventDetail) {
            return EQ.Helpers.dateTime.getTimeRange(eventDetail.startDate, eventDetail.endDate);
        }
    };

    /**
    * Views
    */

    var RecommendedClassesView = Backbone.View.extend({
        events: {
            'click .next-class': 'goToNext',
            'click .prev-class': 'goToPrev'
        },
        initialize: function (options) {
            this.config = options.config || {};
        },
        goToNext: function (e) {
            e.preventDefault();
            this.$el.find('.owl-carousel').data('owlCarousel').next();
        },
        goToPrev: function (e) {
            e.preventDefault();
            this.$el.find('.owl-carousel').data('owlCarousel').prev();
        },
        render: function () {
            var recommendedClassesCarousel = new RecommendedClassesCarousel({
                collection: this.collection,
                items: this.config.multipleItems
            });

            this.$el.find('.carousel-container').append(recommendedClassesCarousel.render().el);
            if (this.config.showFilters) {
                this.$el.find('.recommended-filters').show();
            }
            if (!this.config.hideDescription) {
                this.$el.find('.description').show();
            }
            if (this.collection.length < 2) {
                this.$el.find('.navigation').addClass('hidden');
            }
            return this;
        }
    });

    var RecommendedClassesCarousel = Backbone.View.extend({
        tagName: 'div',
        className: 'owl-carousel',
        initialize: function (options) {
            this.options = options || {};
        },
        render: function () {
            var sliderOpts = {singleItem: true};

            this.collection.each(function (classDetail) {
                var classSingleView = new ClassSingleView({ model: classDetail });
                this.$el.append(classSingleView.render().el);
            }, this);

            if (this.options.items) {
                sliderOpts = {
                    singleItem: false,
                    items: 3,
                    itemsDesktop: [1200, 3],
                    itemsTablet: [1023, 2],
                    itemsMobile : [768, 1]
                };
            }

            // Init carousel
            App.loadComponent('owl-slider', this.$el, sliderOpts);

            return this;
        }
    });

    var ClassSingleView = Backbone.View.extend({
        tagName: 'div',
        className: 'recommended-item',
        template: _.template($('#recomendedClassTemplate').html()),
        events: {
            'click .button.add-class': 'addClass',
            'click .button.remove-class': 'removeClass'
        },
        buildLoader: function (loaderName, selector) {
            var loader;

            if (this[loaderName]) {
                return this[loaderName];
            } else {
                loader = EQ.Helpers.loaderAndErrorHandler(selector, {
                    type: 'button',
                    errorTitle: 'Error',
                    color: 'white'
                });

                this[loaderName] = loader;
                return loader;
            }
        },
        addClass: function (e) {
            e.preventDefault();
            var self = this,
                ENDPOINT,
                loaderAndError;

            if (!self.requestExecuting) {
                ENDPOINT = APIEndpoint26 + '/me/calendar/' + this.model.get('classInstanceId') + '?isRecurring=false';
                loaderAndError = self.buildLoader('loaderAndError', this.$el.find('.button.add-class'));

                // Set status var to avoid multiple request
                self.requestExecuting = true;
                loaderAndError.showLoader();
                var currentDateTime = this.model.get('facilityCurrentDateTime');

                $.ajax({
                    type: 'POST',
                    url: ENDPOINT,
                    contentType: 'application/json',
                    xhrFields: { 'withCredentials': true },
                    dataType: 'json',
                    success: function (data) {
                        debug('[ADDCLASS OK]', data);

                        //Omniture classAction
                        window.tagData.classAction = window.tagData.classAction || {};
                        window.tagData.classAction = {
                            module: 'recommended'
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
                            facilityId: data ? (data.result.facilityId !== '' && data.result.facilityId !== null ? data.result.facilityId : '') : '',
                            classInstanceId: data ? (data.result.classInstanceId !== '' && data.result.classInstanceId !== null ? data.result.classInstanceId.toString() : '') : '',
                            categoryId: null, // This is no longer coming from the API
                            timeOffset: timeOffset ? timeOffset.toString() : ''
                        };

                        window.track('classCalendarAdd', window.tagData.classAction);

                        loaderAndError.hideLoader();
                        self.requestExecuting = false;

                        // set eventId used to delete
                        self.model.set('userEventId', data.result.id);

                        self.$el.find('.overlay-box.add, .remove-class').addClass('active');
                        self.$el.find('.add-class').removeClass('active');
                        setTimeout(function () {
                            self.$el.find('.overlay-box.add').removeClass('active');
                        }, 5000);
                    },
                    error: function (d) {
                        debug('server error', d.responseJSON);
                        loaderAndError.showError();
                        self.requestExecuting = false;
                        $('.active .class-overlay').addClass('active');
                    }
                });
            }
        },
        removeClass: function (e) {
            e.preventDefault();
            var  self = this,
                ENDPOINT,
                loaderAndError;

            if (!self.requestExecuting) {
                ENDPOINT = APIEndpoint + '/me/calendar/cancel/' + this.model.get('userEventId') + '?removeRecurring=false';
                loaderAndError = self.buildLoader('loaderAndErrorRemove', this.$el.find('.button.remove-class'));

                // Set status var to avoid multiple request
                self.requestExecuting = true;
                loaderAndError.showLoader();

                $.ajax({
                    type: 'DELETE',
                    url: ENDPOINT,
                    contentType: 'application/json',
                    xhrFields: { 'withCredentials': true },
                    dataType: 'json',
                    success: function (data) {
                        debug('[REMOVECLASS OK]', data);
                        self.requestExecuting = false;
                        var currentDateTime = self.model.get('facilityCurrentDateTime');

                        var timeOffset = moment(self.model.attributes.startDate).diff(currentDateTime, 'hours'),
                                    timeOffsetMinutes = moment(self.model.attributes.startDate).diff(currentDateTime, 'minutes');

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
                            classId: self.model.attributes ? (self.model.attributes.classId !== '' && self.model.attributes.classId !== null ? self.model.attributes.classId.toString() : '') : '',
                            facilityId: self.model.attributes ? (self.model.attributes.facility.facilityId !== '' && self.model.attributes.facility.facilityId !== null ? self.model.attributes.facility.facilityId.toString() : '') : '',
                            classInstanceId: self.model.attributes ? (self.model.attributes.classInstanceId !== '' && self.model.attributes.classInstanceId !== null ? self.model.attributes.classInstanceId.toString() : '') : '',
                            categoryId: self.model.attributes ? (self.model.attributes.primaryCategory.categoryId !== '' && self.model.attributes.primaryCategory.categoryId !== null ? self.model.attributes.primaryCategory.categoryId.toString() : '') : '',
                            timeOffset: timeOffset ? timeOffset.toString() : ''
                        };
                        window.track('classCalendarDelete', window.tagData.classInstance);
                        loaderAndError.hideLoader();

                        self.$el.find('.overlay-box.remove, .add-class').addClass('active');
                        self.$el.find('.remove-class').removeClass('active');
                        setTimeout(function () {
                            self.$el.find('.overlay-box.remove').removeClass('active');
                        }, 5000);
                    },
                    error: function (d) {
                        debug('server error', d.responseJSON);
                        self.requestExecuting = false;
                        loaderAndError.showError();
                    }
                });
            }
        },
        getRenderData: function () {
            var data = this.model.toJSON();
            return _.extend(data, ClassSingleViewHelpers);
        },
        render: function () {
            this.$el.html(this.template(this.getRenderData()));

            // Render components
            this.renderComponents(this.$el);

            return this;
        }
    });

    /**
    * Component Init
    */

    App.Components['recomended-classes'] = function ($el, options) {
        debug('INIT RECOMMENDED CLASSES');
        var recommendedClassesCollection = new RecommendedClassesCollection(),
            loaderAndError;

        // Set default options
        _.extend(options, {showFilters: true});

        // Loader init

        loaderAndError = EQ.Helpers.loaderAndErrorHandler($el.find('.carousel-container'), {
            color: 'white'
        });
        
        loaderAndError.showLoader();

        recommendedClassesCollection.fetch({
            'xhrFields': { 'withCredentials': true },
            'success': function (collection) {
                var recommendedClassesView = new RecommendedClassesView({
                    collection: collection,
                    config: options,
                    el: $('.recommended-classes.class-module')
                });
                loaderAndError.hideLoader();
                $el.append(recommendedClassesView.render().el);
            },
            'error': function () {
                debug('Server Error');
                loaderAndError.showError();
            }
        });
    };

} (window, window.App));