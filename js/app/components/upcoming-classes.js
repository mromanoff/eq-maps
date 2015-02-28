(function (global, App) {
    'use strict';

    /* global APIEndpoint, Backbone, debug, EQ, _, moment */

    /*
     * Upcoming Classes: Creates a list of upcoming classes for certain club
     *
     * @param  {jQuery Object}      Component object reference
     * @param  {JSON Options Object}        Component Options
     *
     *      OPTIONS Object
     *
     *      clubId {Boolean}            Club that needs to be shown
     *
     *      Example:
     *          {clubId: 303}
     */


    /**
     * Models
     */

    var UpcommingClass = Backbone.Model.extend();

    /**
     * Collections
     */

    var UpcomingClassesCollection = Backbone.Collection.extend({
        model: UpcommingClass,
        url: function () {
            var url = APIEndpoint + '/search/classes';
            return url;
        },
        parse: function (response) {
            debug('[UPCOMING CLASSES SERVICE OK]', response);
            var classes = [];

            if (response.classes.length) {
                _.each(response.classes, function (event) {
                    classes.push({
                        className: event.name,
                        fullName: event.instructors[0].instructor.firstName + ' ' + event.instructors[0].instructor.lastName,
                        date: moment(event.startLocal).format('dddd, MMM DD'),
                        displayTime: event.displayTime,
                        image: {
                            large: event.primaryCategory.iconImageUrl,
                            small: event.primaryCategory.iconImageUrl
                        }
                    });
                });
            }

            return classes;
        }
    });

    /**
     * Views
     */

    var UpcomingClassViewContainer = Backbone.View.extend({
        render: function () {
            var content = [];
            this.collection.each(function (upcomingClass) {
                var upcomingClassSingleView = new UpcomingClassSingleView({ model: upcomingClass });
                content.push(upcomingClassSingleView.render().$el);
            });
            this.$el.append(content);
            return this;
        }
    });

    var UpcomingClassSingleView = Backbone.View.extend({
        tagName: 'li',
        className: 'big-circle-column',
        template: _.template($('#upcomingClassesCircleSingleView').html()),
        render: function () {
            var self = this;

            self.$el.append(self.template(this.model.toJSON()));

            return this;
        }
    });


    /**
     * Component Init
     */

    App.Components['upcoming-classes'] = function ($el, options) {
        debug('INIT UPCOMMING CLASSES', options);
        var upcomingClassesCollection = new UpcomingClassesCollection(),
            loaderAndError;

        // Loader init

        loaderAndError = EQ.Helpers.loaderAndErrorHandler($el.find('.upcoming-container'), {
            color: 'white'
        });

        loaderAndError.showLoader();


        upcomingClassesCollection.fetch({
            method: 'POST',
            data: JSON.stringify({
                startDate: moment(EQ.Helpers.dateTime.getCurrentDay(new Date()).startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss\\Z'),
                endDate: moment(EQ.Helpers.dateTime.getCurrentDay(new Date()).startDate).add('week', 1).startOf('day').format('YYYY-MM-DDTHH:mm:ss\\Z'),
                facilityIds: [options.clubId] || [],
                instructorIds:  [],
                classCategoryIDs:  [],
                maxResults: 3,
                dateIsUtc: false
            }),
            xhrFields: { 'withCredentials': true },
            contentType: 'application/json',
            dataType: 'json',
            success: function (collection) {
                var upcomingClassViewContainer = new UpcomingClassViewContainer({
                    el: $('ul', $el),
                    collection: collection,
                    config: options
                });
                loaderAndError.hideLoader();
                $el.append(upcomingClassViewContainer.render().el);
            },
            error: function () {
                debug('Server Error');
                loaderAndError.showError();
            }
        });
    };

}(window, window.App));