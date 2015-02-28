define(function(require, exports, module){
    "use strict";
    var Activity = function() {
    
        if (!window.moment) require('moment');
        if (!window.$) require('jquery');
        if (!window._) require('underscore');
        if (!window.EQ) require('helpers');
        
        var $dom = $('#app-main'),
            PAGE_TYPE = 'WORKOUTS',
            DATE = moment().startOf('month'),
            PERIOD = 'month',
            page,
            ActivityAppTour = require('components/activity-app-tour'),
            app_tour,
			ActivityAppNav = require('components/activity-app-nav'),
            ActivityAppTimeframe = require('components/activity-app-timeframe'),
            ActivityAppPage = require('components/activity-app-page'),
            app_nav,
            app_timeframe,
            app_page,
            resize_interval,
            //ActivityAppConnect = require('components/activity-app-connect'),
            //app_connect,
            WorkoutsPage = require('pages/workouts'),
            CaloriesPage = require('pages/calories'),
            CheckInsPage = require('pages/checkins'),
            WeightPage = require('pages/weight'),
            CyclingCategoryPage = require('pages/cycling-category-page'),
            STORAGE_TOUR_KEY = 'activity-tour',
            router;

        var ActivityRouter = Backbone.Router.extend({
            routes: {
                '' : 'default',
                ':page' : 'default',
                ':page/:year(/:month)(/:section)' : 'render'
            },
            default : function (pagetype) {
                if (pagetype) {
                    PAGE_TYPE = pagetype;
                }
                render.activity_page_section();
            },

            render : function (pagetype, year, month, section) {

                // Remove "open" section from route.
                /*if (section) {
                    Backbone.Router.prototype.navigate(pagetype + '/' + year + '/' + month);
                }*/

                //Destroys the previous page if there was one
                if (page) {
                    page.destroy();
                    app_page.getVisual().empty();
                    app_page.getList().empty();
                }

                //Sets the current page type and date information
                PAGE_TYPE = pagetype;
                if (pagetype == 'WORKOUTS' && !month) {
                    year = moment().format('YYYY');
                    month = moment().format('M');
                }

                if (month) {
                    DATE = moment( new Date(year, (parseInt(month)-1) ) ).startOf('month');
                    PERIOD = 'month';
                }else{
                    DATE = moment( new Date(year, 0, 1) );
                    PERIOD = 'year';
                }

                //Sets the updated page type in the top nav menu
                app_nav.setSelected(PAGE_TYPE);
                app_nav.setDate(DATE, PERIOD);

                switch (PAGE_TYPE) {
                    case 'WORKOUTS' :
                        if(section && section.toLowerCase() === 'cycling'){
                            page = new CyclingCategoryPage(DATE, PERIOD);
                        }else{
                            page = new WorkoutsPage(DATE, PERIOD, "month");
                        }
                        break;
                    case 'CHECKINS' :
                        page = new CheckInsPage(DATE, PERIOD);
                        break;
                    case 'CALORIES' :
                        page = new CaloriesPage(DATE, PERIOD);
                        break;
                    case 'WEIGHT' :
                        page = new WeightPage(DATE, PERIOD);
                        break;

                }

                app_timeframe.updateBoxesVisibility(PAGE_TYPE === 'WORKOUTS' ? 'month' : 'year', PAGE_TYPE);
                app_timeframe.setDate(DATE, PAGE_TYPE === 'WORKOUTS' ? 'month' : PERIOD);
                app_timeframe.selectPeriodType(PAGE_TYPE === 'WORKOUTS' ? 'month' : PERIOD, true);
            }

		});

		var init = function() {
            $(window).on('resize orientationchange', events.resize_app);
            $('footer').addClass('activity');
            $('body').addClass('activity');

            // Enable this block to re-enable Activity "Get Started Page"            
            // if (localStorage.getItem(STORAGE_TOUR_KEY)) {
             render.activity_page();
            // } else {
            //  render.tour();
            // }
            var $logWeightOverlay = $('<div class="automatic-calories-overlay"></div>');

            $('.page').append($logWeightOverlay);
            App.loadComponent('log-weight-overlay', $logWeightOverlay, {});
        };

        var render = {
            tour : function() {
                app_tour = new ActivityAppTour($dom, events.close_tour);
                //app_connect = new ActivityAppConnect($dom);
                app_tour.setOverlay($dom);
            },
            activity_page : function() {
                app_nav = new ActivityAppNav($dom);
                app_timeframe = new ActivityAppTimeframe($dom, {
                    selectedDateCallback: events.new_date_selected,
                    changePeriodTypeCallback: render.changePeriodType
                });
                
                app_page = new ActivityAppPage($dom);
                
                events.start_up_router();
            },
            changePeriodType: function (type, currentDateToUse) {
                var currentDate = currentDateToUse;

                PERIOD = type;

                if (PERIOD === 'month') {
                    // According to XD team, when the user toggle to month navigation
                    // date needs to be resetted to current month-year
                    currentDate = moment().format('YYYY/M');
                    app_timeframe.setDate(moment(currentDate + '/1'), 'month');
                }

                app_nav.setDate(currentDate, PERIOD);

                router.navigate(PAGE_TYPE + '/' + currentDate, { trigger: false });

                page && page.updateDate && page.updateDate(currentDate);

                page && page.changePeriodType(type);
            },
            activity_page_section : function () {
                router.navigate(PAGE_TYPE + '/' + DATE.format('YYYY')
                    + (PERIOD == 'month' ? '/' + DATE.format('M') : ''), { trigger: true });
            }
        };

        var events = {
            new_date_selected : function(d) {
                EQ.Helpers.goToTop();
                DATE = d;
                app_nav.setDate(d, PERIOD);
                render.activity_page_section();
            },
            close_tour : function() {
                app_tour.destroy();
                EQ.Helpers.goToTop();
                localStorage.setItem(STORAGE_TOUR_KEY, true);
                render.activity_page();
            },
            resize_app : function() {
                if (page) {
                    clearTimeout(resize_interval);
                    resize_interval = setTimeout(page.resize, 200);
                }
            },
            start_up_router : function () {
                router = new ActivityRouter();
                Backbone.history.start();
            }
        };

        init();

        var api = {
            'start' : events.start
        };
        return api;
    };
        
    module.exports = new Activity();
    
});