define(function(require, exports, modules){
    "use strict";
    var CaloriesPage = function(d, cp) {
        var date = d,
            currentPeriod = cp,
            $elementToAppendTo = $('#activity-app-page'),
            ActivityList = require('components/activity-list'),
            EqGraph = require('components/activity-eq-graph'),
            ActivityGenericPage = require('components/activity-generic-page'),
            CaloriesPage,
            caloriesPageComponent;

        // Empty Graph Markup
        var emptyGraphMarkup =  '<div>View calories by logging a workout or adding a class.</div>';

        //Endpoints for the check ins page
        var endpoint = {
            ME_WORKOUTS : '/v2.6/me/workouts/',
            ME_WORKOUTS_STATS : '/v2.6/me/workouts/calories/stats/'
        };

        CaloriesPage = ActivityGenericPage.extend({
            loadMonthComponents: function () {
                var self = this,

                endpointMonthStats = endpoint.ME_WORKOUTS_STATS + self.options.date.format("YYYY/M"),
                endpointWorkouts = endpoint.ME_WORKOUTS + self.options.date.format("YYYY/M");

                this.xhrGraphStats = EQ.Helpers.getService(endpointMonthStats),
                this.xhrCaloriesList = EQ.Helpers.getService(endpointWorkouts, {cache: false});

                EQ.Helpers.when(this.xhrGraphStats, this.xhrCaloriesList).done( function ( response ) {
                    Backbone.Events.trigger('activityLoader:remove');
                    var list_data = self.parseListData(response[1]),
                        graphOptionsAndData = self.parseGraphStatsData(response[0], self.options.date, 'month');

                    self.activity_graph_month = new EqGraph(self.$el, graphOptionsAndData, emptyGraphMarkup);

                    // for calories clear the items without calories
                    var cloneData = _.clone(list_data);

                    list_data = _.filter(cloneData, function(item) {
                        return item.totalEnergy > 0;
                    });

                    if (list_data.length > 0) {
                        self.activity_list = new ActivityList();
                        self.activity_list.update_data(list_data, self.options.currentPeriod, "Calorie-Tracked Workouts", "ALL", {
                            type: 'workout',
                            item_callback: function (id) {
                                location.href = '/activity/workouts/' + id;
                            }
                        });
                    }
                }).fail(function (e) {
                    Backbone.Events.trigger('activityLoader:error');
                });
            },
            loadYearComponents: function () {
                var self = this,
                    endpointYearStats = endpoint.ME_WORKOUTS_STATS + self.options.date.format("YYYY/");

                this.xhrCaloriesYearStats = EQ.Helpers.getService(endpointYearStats).done(function (data) {
                    Backbone.Events.trigger('activityLoader:remove');
                    var graphOptionsAndData = self.parseGraphStatsData(data, self.options.date, 'year');

                    self.activity_graph_year = new EqGraph(self.$el, graphOptionsAndData, emptyGraphMarkup);
                }).fail(function (e) {
                    Backbone.Events.trigger('activityLoader:error');
                });
            },
            destroyAllComponents : function() {
                EQ.Helpers.abortService(this.xhrGraphStats);
                EQ.Helpers.abortService(this.xhrCaloriesList);
                EQ.Helpers.abortService(this.xhrCaloriesYearStats);

                if (this.activity_graph_month) {
                    this.activity_graph_month.destroy();
                    this.activity_graph_month = null;
                }
                if (this.activity_graph_year) {
                    this.activity_graph_year.destroy();
                    this.activity_graph_year = null;
                }
                if (this.activity_list) {
                    this.activity_list.destroy();
                    this.activity_list = null;
                }
            },
            parseGraphStatsData : function(data, date, periodType) {
                var graphOptions,
                    metricUnit = 'CAL',
                    labels = [],
                    labelsValuesMap = [],
                    graphOptions,
                    axisXLabel,
                    activeLabel = '',
                    textReferences = [],
                    tooltip = true,
                    avgDaily = 0;

                // Disable tooltips for small devices
                if (EQ.Helpers.getDeviceSize() === 'small') {
                    tooltip = false;
                }

                if (data.averageDailyBurn) {
                    avgDaily = Math.round(parseInt(data.averageDailyBurn));
                }


                if (periodType === 'month') {
                    var daysOfCurrentMonth = parseInt(date.endOf('month').format('D'), 10);
                    var today = moment();

                    if (date.year() === today.year() && date.month() === today.month()) {
                        activeLabel = parseInt(moment().format('D'), 10);
                    }

                    axisXLabel = 'DAYS';

                    // First fill the map with all empty values for all the month days
                    labels = _.range(1, date.daysInMonth() + 1);
                    labelsValuesMap = _.range(date.daysInMonth()).map(function () { return 0 });

                    // Create alternative labels for small devices
                    if (EQ.Helpers.getDeviceSize() === 'small') {
                        for (var i = 0; i < labels.length ; i++) {
                            if (i !== 0 && ((i+1) % 7) !== 0) {
                                labels[i] = '';
                            }
                        };
                    }

                    _.each(data.userCalories, function (daysCaloriesItem) {
                        var currentDateMoment = moment(daysCaloriesItem.intervalStartDate);
                        labelsValuesMap[parseInt(currentDateMoment.format('D') - 1, 10)] = daysCaloriesItem.totalCalories;
                    });

                    // Push all references
                    textReferences.push({
                        title: 'Avg Daily Burn',
                        value: avgDaily,
                        unit: metricUnit
                    });

                } else {
                    if (data.userCalories && data.userCalories.length > 0) {
                        labels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                        axisXLabel = 'MONTHS';
                        activeLabel = moment().format('MMM').toUpperCase();

                        // Create alternative labels for small devices
                        if (EQ.Helpers.getDeviceSize() === 'small') {
                            _.each(labels, function (label, index) {
                                labels[index] = label[0];
                            });
                        }

                        // First fill the map with all empty values for the 12 months
                        for (var i = 1; i < 13 ; i++) {
                            labelsValuesMap.push(0);
                        };

                        _.each(data.userCalories, function (monthCaloriesItem) {
                            var currentDateMoment = moment(monthCaloriesItem.intervalStartDate);
                            labelsValuesMap[parseInt(currentDateMoment.format('M') - 1, 10)] = monthCaloriesItem.totalCalories;
                        });

                        // Set best month
                        var bestMonth;

                        bestMonth = _.indexOf(labelsValuesMap, _.max(labelsValuesMap));
                        bestMonth = moment().month(labels[bestMonth]).format('MMMM');

                        // Push all references
                        textReferences.push({
                            title: 'Avg Monthly Burn',
                            value: avgDaily,
                            unit: metricUnit
                        });

                        textReferences.push({
                            title: 'Best Month',
                            unit: bestMonth
                        });
                    }
                }


                graphOptions = {
                    graphType: 'bar',
                    chartConfig: {
                        activeLabel: activeLabel,
                        activeColor: 'rgba(63,236,173,1)',
                        labels: labels,
                        datasets: [
                            {
                                fillColor: 'rgba(63,236,173,1)',
                                strokeColor: 'rgba(151,187,205,0.8)',
                                highlightFill: 'rgba(14,130,93,1)',
                                highlightStroke: 'rgba(151,187,205,1)'
                            }
                        ]
                    },
                    chartData: [labelsValuesMap],
                    textReferences: textReferences,
                    section: 'calorie',
                    type: periodType,
                    yLabel: metricUnit.toUpperCase(),
                    xLabel: axisXLabel,
                    month: date.format('MMM'),
                    monthLargeName: date.format('MMMM'),
                    year: date.format('YYYY'),
                    unit: metricUnit,
                    showTooltip: tooltip,
                    hideCTAButtton: true
                };

                return graphOptions;
            },
            parseListData: function (data) {
                var list_data = data.workouts ? data.workouts : [];

                // Add extra data for list
                _.each(list_data, function(workout) {
                    var facilityData = EQ.Helpers.getFacilityById(workout.facilityId);

                    if (workout.instructors && workout.instructors.length > 0) {
                        instructorInfo = workout.instructors[0].instructor;
                    }

                    workout.startMoment = moment(workout.startDate)
                    workout.location = (facilityData) ? facilityData.ClubName : '';
                    workout.instructor = workout.trainerName;
                    workout.totalEnergy = workout.totalCalories;
                    workout.totalDistance = workout.totalDistance;
                });

                return list_data;
            }
        });

        Backbone.Events.trigger('activityLoader:start');

        caloriesPageComponent = new CaloriesPage({
            el: $elementToAppendTo,
            currentPeriod: currentPeriod,
            date: date
        });
        caloriesPageComponent.render();

        var api = {
            'destroy': function () {
                caloriesPageComponent.close();
            },
            'changePeriodType': function (type) {
                caloriesPageComponent.changePeriodPage(type);
            },
            'updateDate': function (date) {
                caloriesPageComponent.updateDate(date);
            }
        };

        return api;
    };
    
    modules.exports = CaloriesPage;
});