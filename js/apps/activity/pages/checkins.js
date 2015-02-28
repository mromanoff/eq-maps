define(function(require, exports, modules){
    "use strict";
    var CheckInsPage = function(d, cp) {
        var date = d,
            currentPeriod = cp,
            $elementToAppendTo = $('#activity-app-page'),
            ActivityList = require('components/activity-list'),
            ActivityCalendar = require('components/activity-calendar'),
            EqGraph = require('components/activity-eq-graph'),
            ActivityGenericPage = require('components/activity-generic-page'),
            CheckinPage,
            checkinPageComponent;

        //Endpoints for the check ins page
        var endpoint = {
			ME_CHECKINS : '/v2.6/me/check-ins/',
            ME_CHECKINS_STATS : '/v2.6/me/check-ins/stats/' + date.format("YYYY"),
        };

        CheckinPage = ActivityGenericPage.extend({
            loadMonthComponents: function () {
                var self = this,
                    checkinsEndpoint = endpoint.ME_CHECKINS + self.options.date.format("YYYY/M");

                this.xhrCheckinsList = EQ.Helpers.getService(checkinsEndpoint).done(function (data) {

                    Backbone.Events.trigger('activityLoader:remove');
                    var list_data = self.parseListData(data)

                    self.activity_calendar = new ActivityCalendar(self.$el, list_data, self.options.date, function (date) {
                        self.goToDay(date);
                    });
                    if (list_data.length > 0) {
                        self.activity_list = new ActivityList();
                        self.activity_list.update_data(list_data, self.options.currentPeriod, "Check-Ins", "ALL", {type: 'checkin'});
                    }
                }).fail(function (e) {
                    Backbone.Events.trigger('activityLoader:error');
                });
            },
            loadYearComponents: function () {
                var self = this;

                this.xhrCheckinsYearStats = EQ.Helpers.getService(endpoint.ME_CHECKINS_STATS).done(function (data) {
                    Backbone.Events.trigger('activityLoader:remove');
                    var graphOptionsAndData = self.parseGraphStatsData(data, self.options.date);

                    self.activity_graph = new EqGraph(self.$el, graphOptionsAndData);
                }).fail(function (e) {
                    Backbone.Events.trigger('activityLoader:error');
                });
            },
            goToDay: function (d) {
                this.activity_list.goToDay(d);
            },
            destroyAllComponents : function() {
                EQ.Helpers.abortService(this.xhrCheckinsList);
                EQ.Helpers.abortService(this.xhrCheckinsYearStats);

                if (this.activity_calendar) {
                    this.activity_calendar.destroy();
                    this.activity_calendar = null;
                }
                if (this.activity_graph) {
                    this.activity_graph.destroy();
                    this.activity_graph = null;
                }
                if (this.activity_list) {
                    this.activity_list.destroy();
                    this.activity_list = null;
                }
            },
            parseGraphStatsData : function(data, date) {
                var graphOptions,
                    totalCheckins = 0,
                    avgCheckins,
                    activeLabel,
                    chartLabels,
                    yearMonths = 12,
                    tooltip = true,
                    monthMap = [];

                // Disable tooltips for small devices
                if (EQ.Helpers.getDeviceSize() === 'small') {
                    tooltip = false;
                }

                // First fill the map with all empty values
                for (var i = 1; i < 13 ; i++) {
                    monthMap.push(0);
                };

                _.each(data.checkInStatistics, function (monthStat) {
                    monthMap[monthStat.month -1] = monthStat.checkInEventCount;
                    totalCheckins += monthStat.checkInEventCount;
                });

                // Check if we are in the same year and set the month quantity to calculate the avg of the current year
                if (date.year() === moment().year()) {
                    yearMonths = moment().month() + 1;
                }

                chartLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

                // Create alternative labels for small devices
                if (EQ.Helpers.getDeviceSize() === 'small') {
                    _.each(chartLabels, function (label, index) {
                        chartLabels[index] = label[0];
                    });
                }

                activeLabel = moment().format('MMM').toUpperCase();

                avgCheckins = Math.round(totalCheckins / yearMonths );

                graphOptions = {
                    graphType: 'bar',
                    chartConfig: {
                        activeLabel: activeLabel,
                        activeColor: 'rgba(63,236,173,1)',
                        labels: chartLabels,
                        datasets: [
                            {
                                fillColor: 'rgba(63,236,173,1)',
                                strokeColor: 'rgba(151,187,205,0.8)',
                                highlightFill: 'rgba(14,130,93,1)',
                                highlightStroke: 'rgba(151,187,205,1)'
                            }
                        ]
                    },
                    chartData: [monthMap],
                    textReferences: [
                        {
                            title: 'Check-Ins',
                            value: totalCheckins,
                            unit: ''
                        },
                        {
                            title: 'AVG per month',
                            value: avgCheckins,
                            unit: ''
                        }
                    ],
                    section: 'check-in',
                    type: 'year',
                    yLabel: 'CHECK-INS',
                    xLabel: 'MONTHS',
                    month: date.format('MMMM'),
                    monthLargeName: date.format('MMMM'),
                    year: date.format('YYYY'),
                    unit: 'checkins',
                    showTooltip: tooltip,
                    hideCTAButtton: true
                };

                return graphOptions;
            },
            parseListData: function (data) {
                var list_data = data.checkIns ? data.checkIns : [];

                // Add extra data for list
                _.each(list_data, function(checkin) {
                    var facilityData = EQ.Helpers.getFacilityById(checkin.facilityId);

                    checkin.startMoment = moment(checkin.startLocal);

                    // Activity list uses startDate and endDate, so we need to assign local dates to these vars
                    checkin.startDate = checkin.startLocal;
                    checkin.location = (facilityData) ? facilityData.ClubName : '';
                });

                return list_data;
            }
        });

        Backbone.Events.trigger('activityLoader:start');

        checkinPageComponent = new CheckinPage({
            el: $elementToAppendTo,
            currentPeriod: currentPeriod,
            date: date
        });
        checkinPageComponent.render();

        var api = {
            'destroy': function () {
                checkinPageComponent.close();
            },
            'changePeriodType': function (type) {
                checkinPageComponent.changePeriodPage(type);
            },
            'updateDate': function (date) {
                checkinPageComponent.updateDate(date);
            }
        };

        return api;
    };
    
    modules.exports = CheckInsPage;
});