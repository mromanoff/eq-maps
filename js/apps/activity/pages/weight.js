define(function(require, exports, modules){
    "use strict";
    var WeightPage = function(d, cp) {
        var date = d,
            currentPeriod = cp,
            $elementToAppendTo = $('#activity-app-page'),
            ActivityList = require('components/activity-list'),
            EqGraph = require('components/activity-eq-graph'),
            ActivityGenericPage = require('components/activity-generic-page'),
            WeightPage,
            weightPageComponent,
            list_data;

        // Empty Graph Markup
        var emptyGraphMarkup =  '<div>Log your weight using the <span class="plus"></span> button.</div>';

        //Endpoints for the weight page
        var endpoint = {
            ME_WEIGHT_MONTH : '/v2.6/me/profile/measurement/weight-history/',
            ME_WEIGHT_YEAR : '/v2.6/me/profile/measurement/weight-history/' + date.format("YYYY")
        };

        WeightPage = ActivityGenericPage.extend({
            loadMonthComponents: function () {
                var self = this,
                    weightMonthEndpoint = endpoint.ME_WEIGHT_MONTH + self.options.date.format("YYYY/M");

                this.xhrWeight = EQ.Helpers.getService(weightMonthEndpoint).done(function (data) {
                    var list_data = self.parseListData(data);
                    var graphOptionsAndData = self.parseGraphStatsData(data, self.options.date, 'month');

                    Backbone.Events.trigger('activityLoader:remove');

                    self.activity_graph = new EqGraph(self.$el, graphOptionsAndData, emptyGraphMarkup);

                    if (list_data.length > 0) {
                        self.activity_list = new ActivityList();
                        self.activity_list.update_data(list_data, self.options.currentPeriod, "Your Weigh-Ins", "ALL", {type: 'weight'});
                    }
                });
            },
            loadYearComponents: function () {
                var self = this;

                this.xhrWeightYearStats = EQ.Helpers.getService(endpoint.ME_WEIGHT_YEAR).done(function (data) {
                    var graphOptionsAndData = self.parseGraphStatsData(data, self.options.date, 'year');

                    Backbone.Events.trigger('activityLoader:remove');

                    self.activity_graph = new EqGraph(self.$el, graphOptionsAndData, emptyGraphMarkup);
                });
            },
            destroyAllComponents : function() {
                EQ.Helpers.abortService(this.xhrWeight);
                EQ.Helpers.abortService(this.xhrWeightYearStats);

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
            checkPrevValue: function (collection, index) {
                if (index >= 0)
                {
                    if (collection[index] > 0) {
                        return index;
                    } else {
                        return this.checkPrevValue(collection, index - 1);
                    }
                }

                return 0;
                
            },
            checkNextValue: function (collection, index) {

                if(index <= collection.length)
                {
                    if (collection[index] > 0) {
                        return index;
                    } else {
                        return this.checkNextValue(collection, index + 1);
                    }
                }

                return 0;
                
            },
            parseGraphStatsData : function(originalData, date, type) {
                var data = _.clone(originalData, true),
                    self = this,
                    dataset = {
                        data: [],
                        labels: []
                    },
                    flattenData,
                    lastItem = 0,
                    tooltip = true,
                    dateTitle,
                    activePoint,
                    activeLabel = '',
                    axisXLabel,
                    average,
                    averageData = [],
                    today = moment();

                // Disable tooltips for small devices
                if (EQ.Helpers.getDeviceSize() === 'small') {
                    tooltip = false;
                }


                if (type === 'year') {
                    axisXLabel = 'MONTHS';
                    dateTitle = date.year();
                    activeLabel = moment().format('MMM').toUpperCase();

                    // Create year dataset array
                    dataset.labels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    dataset.data = _.range(12).map(function () { return 0 });

                    // Create alternative labels for small devices
                    if (EQ.Helpers.getDeviceSize() === 'small') {
                        _.each(dataset.labels, function (label, index) {
                            dataset.labels[index] = label[0];
                        });
                    }

                    // Fill year dataset
                    _.each(data.weightMeasurements, function (weightItem) {
                        var currentDateMoment = moment(weightItem.date);
                        dataset.data[parseInt(currentDateMoment.format('M') - 1, 10)] = EQ.Helpers.numbers.roundToTwoDecimals(EQ.Helpers.convertLBStoKGS(weightItem.weight, data.weightUnit));
                    });

                } else if (type === 'month') {
                    axisXLabel = 'DAYS';
                    dateTitle = date.format('MMMM');

                    if (date.year() === today.year() && date.month() === today.month()) {
                        activeLabel = parseInt(moment().format('D'), 10);
                    }

                    // Create month dataset array
                    dataset.labels = _.range(1, date.daysInMonth() + 1);
                    dataset.data = _.range(date.daysInMonth()).map(function () { return 0 });

                    // Create alternative labels for small devices
                    if (EQ.Helpers.getDeviceSize() === 'small') {
                        for (var i = 0; i < dataset.labels.length ; i++) {
                            if (i !== 0 && ((i+1) % 7) !== 0) {
                                dataset.labels[i] = '';
                            }
                        };
                    }

                    // Fill month dataset
                    _.each(data.weightMeasurements, function (weightItem) {
                        var currentDateMoment = moment(weightItem.date),
                            weightVal = EQ.Helpers.numbers.roundToTwoDecimals(EQ.Helpers.convertLBStoKGS(weightItem.weight, data.weightUnit));
                        dataset.data[parseInt(currentDateMoment.format('D') - 1, 10)] = weightVal;
                        averageData.push(weightVal);
                    });
                }


                // Remove datasets without data
                flattenData = _.compact(_.flatten(dataset.data));

                // Calculate last Item
                if (flattenData.length > 0) {
                    lastItem = EQ.Helpers.numbers.roundToTwoDecimals(_.last(flattenData));
                }


                // Calculate Avg
                if (type === 'month') {
                    averageData = _.compact(averageData);
                } else {
                    averageData = flattenData;
                }

                average = _.reduce(averageData, function(memo, num) {
                            return memo + num;
                        }, 0) / averageData.length;

                average = EQ.Helpers.numbers.roundToTwoDecimals(average);


                // Set active point to the latest data available
                if (type === 'year' && date.year() === today.year()
                    || type === 'month' && date.month() === today.month() && date.year() === today.year()) {
                    activePoint = _.lastIndexOf(dataset.data, lastItem);
                }

                // Fill the first and last values with the nearest working value, and set as negative to properly represent the weight chart
                if (dataset.data[0] === 0) {
                    dataset.data[0] = - dataset.data[self.checkNextValue(dataset.data, 0)];
                }
                if (dataset.data[dataset.data.length-1] === 0) {
                    dataset.data[dataset.data.length-1] = - dataset.data[self.checkPrevValue(dataset.data, dataset.data.length-1)];
                }
                
                return {
                    graphType: 'points',
                    chartConfig: {
                        activeLabel: activeLabel,
                        activePoint: activePoint,
                        labels: dataset.labels,
                        datasets: [
                            {
                                fillColor : "rgba(63,236,173,.15)",
                                highlightFill : "rgba(63,236,173,1)",
                                strokeColor: "rgba(63,236,173,1)",
                                pointColor: "rgba(63,236,173,1)"
                            }
                        ]
                    },
                    chartData: [
                        dataset.data
                    ],
                    textReferences: [
                        {
                            title: 'Current Weight',
                            value: lastItem,
                            unit: data.weightUnit
                        }, {
                            title: dateTitle + '\'s Avg',
                            value: average,
                            unit: data.weightUnit
                        }
                    ],
                    section: 'weight',
                    type: type,
                    yLabel: data.weightUnit.toUpperCase(),
                    xLabel: axisXLabel,
                    month: date.format('MMM'),
                    monthLargeName: date.format('MMMM'),
                    year: date.format('YYYY'),
                    unit: data.weightUnit,
                    showTooltip: tooltip,
                    hideCTAButtton: true,
                    hasLogWeightButton: true
                };
            },
            parseListData: function (data) {
                var list_data = data.weightMeasurements ? data.weightMeasurements : [],
                    listToReturn = [];

                // Add extra data for list
                _.each(list_data, function(weight) {
                    var weightItem = _.clone(weight);

                    weightItem.startMoment = moment(weight.date);
                    weightItem.startDate = weight.date;
                    weightItem.weightValue = EQ.Helpers.numbers.roundToTwoDecimals(weight.weight);
                    weightItem.weightUnit = data.weightUnit;

                    listToReturn.push(weightItem);
                });

                return listToReturn;
            }
        });


        Backbone.Events.trigger('activityLoader:start');

        weightPageComponent = new WeightPage({
            el: $elementToAppendTo,
            currentPeriod: currentPeriod,
            date: date
        });
        weightPageComponent.render();

        var api = {
            destroy: function () {
                weightPageComponent.close();
            },
            changePeriodType: function (type) {
                weightPageComponent.changePeriodPage(type);
            },
            'updateDate': function (date) {
                weightPageComponent.updateDate(date);
            }
        };

        return api;
    };
    
    modules.exports = WeightPage;
});