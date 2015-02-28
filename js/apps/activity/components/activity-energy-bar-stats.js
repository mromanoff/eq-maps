define(function(require, exports, module){
    "use strict";
    var ActivityEnergyBarStats = function($elementToAppendTo, options) {
        var DateSelector = require('components/date-selector'),
            Chart = require('/assets/js/app/amd_components/chart.js'), // Load extented chartjs
            EnergyBarStatsView,
            EnergyBarStatsComponent,
            api;

        //Endpoints for the check ins page
        var endpoint = {
            STATS : '/v3/me/activity/cycling/stats/'
        };

        /**
        * Views
        */

        EnergyBarStatsView = Backbone.View.extend({
            className: 'graphic-bar-module',
            template: _.template($('#energyBarStatsTemplate').html()),
            events: {
                'click .small-menu a': 'changeGraphMode',
            },
            initialize : function (options) {
                this.options = options || {};
            },
            changeGraphMode: function (e) {
                e.preventDefault();
                var $currentOption = $(e.currentTarget),
                    $optionsGroupType = $currentOption.parent().parent();

                if (!$currentOption.hasClass('selected')) {
                    // First remove selected class for all the elements
                    $currentOption.removeClass('selected')
                        .parent().siblings().find('a').removeClass('selected');

                    // Set on the current
                    $currentOption.addClass('selected');

                    this[$optionsGroupType.data('type')]($currentOption.data('type'));
                    if ($optionsGroupType.data('type') === 'changeTimeLapse') {
                        this.getStatsData($currentOption.data('type'));
                    }
                }
            },
            changeTimeLapse: function (timeLapseType) {
                var $yearSelector = this.$el.find('.year.dateSelector'),
                    $monthSelector = this.$el.find('.month.dateSelector'),
                    $allTime = this.$el.find('.allTimeTitle');

                if (timeLapseType === 'month') {
                    $yearSelector.addClass('hidden');
                    $monthSelector.removeClass('hidden');
                    $allTime.addClass('hidden');
                } else if (timeLapseType === 'year') {
                    $yearSelector.removeClass('hidden');
                    $monthSelector.addClass('hidden');
                    $allTime.addClass('hidden');
                } else {
                    // empty old selector for 'all time'
                    $yearSelector.addClass('hidden');
                    $monthSelector.addClass('hidden');
                    $allTime.removeClass('hidden');
                }
            },
            changeInfoType: function (infoType) {
                this.currentInfoType = infoType;
                this.renderBarStats();
            },
            createDateSelector: function (type) {
                var $dateSelector = this.$el.find('.' + type + '.dateSelector'),
                    date_selector,
                    self = this,
                    yearList = [],
                    monthList = [];

                for (var date = moment(); date.format('YYYY') > 2011; date.add(-1, 'years')) {
                    var value = date.format('YYYY');

                    yearList.push({
                        value: value,
                        name: value,
                        selected: value == self.currentYear
                    });
                }

                // Create month array to populate the month selector
                for (var date = moment(); date.format('YYYY') > 2011; date.add(-1, 'months')) {
                    var month = date.month() + 1,
                        value = date.format('YYYY/M'),
                        monthName;

                    // if the month is in the current year show full month name otherwise show MMM + YYYY
                    monthName = date.format('YYYY') === moment().format('YYYY') ? date.format('MMMM') : date.format('MMM') + ' ' + date.format('YYYY');

                    monthList.push({
                        value: value,
                        name: monthName,
                        selected: value == self.currentMonthAndYear
                    });
                };

                // Create date selector
                date_selector = new DateSelector($dateSelector, {
                    type: 'month',
                    valuesToShow: (type === 'month' ? monthList: yearList),
                    onDateSelectedCallback: function(d) {
                       self.updateCurrentDate(type, d);
                    }
                });
            },
            updateCurrentDate: function (type, d) {
                if (type === 'year') {
                    this.currentYear = d;
                } else {
                    this.currentMonthAndYear = d;
                }
                this.getStatsData(type);
            },
            getStatsData: function (type) {
                var self = this,
                    requestParams = '',
                    response;

                // no data available (ready, set, pedal)
                if (this.options.emptyActivity === true) {
                    this.renderNoData({
                        title: 'Ready, Set, Pedal',
                        description: 'No data yet! When you take a class, the stats will appear here',
                        hasCTA: true
                    });
                    return false;
                }

                if (type === 'year') {
                    requestParams = this.currentYear;
                } else if (type === 'month') {
                    requestParams = this.currentMonthAndYear;
                }

                // if the request is for the current month, first check if there is data for current and last month
                // to avoid making the request if we already now that there is no data

                if (type === 'month' && this.currentMonthAndYear === moment().format('YYYY/M')) {
                    if (!self.options.totalDistanceThisMonth) {
                        var metricUnit = 'miles',
                            totalDistanceLastMonth = self.options.totalDistanceLastMonth, 
                            message = '';

                        if (totalDistanceLastMonth > 0) {
                            message = 'No data yet, you rode ' + self.options.totalDistanceLastMonth + ' ' + metricUnit +' last month. How far will you go this month?';
                        } else {
                            message = 'Welcome back, it\'s been a while!';
                        }

                        // NEW month - no data
                        self.renderNoData({
                            title: 'New month, new miles',
                            description: message,
                            hasCTA: true
                        });

                        return false;
                    }
                }

                EQ.Helpers.getService(endpoint.STATS + requestParams).done(function (response) {
                    if (!utils.dataIsEmpty(response)) {
                        self.statsData = utils.parseStatsData(response);
                        self.renderBarStats();
                    } else {
                        // If there is no data available for this month and this is current month
                        if (this.currentMonthAndYear === moment().format('YYYY/M')) {
                            var metricUnit = 'miles',
                                totalDistanceLastMonth = self.options.totalDistanceLastMonth, 
                                message = '';

                            if (totalDistanceLastMonth > 0) {
                                message = 'No data yet, you rode ' + self.options.totalDistanceLastMonth + ' ' + metricUnit +' last month. How far will you go this month?';
                            } else {
                                message = 'Welcome back, it\'s been a while!';
                            }

                            // NEW month - no data
                            self.renderNoData({
                                title: 'New month, new miles',
                                description: message,
                                hasCTA: true
                            });
                        } else {
                            var dateToGetMonthString = moment(self.currentMonthAndYear + '/1');
                            // PAST month - no data
                            self.renderNoData({
                                title: 'No data',
                                description: 'There is no cycling data available for ' + dateToGetMonthString.format('MMMM'),
                                hasCTA: false
                            });
                        }
                    }
                });
            },
            renderNoData: function (options) {
                var noDataTemplate = _.template($('#graphNoData').html()),
                    $noDataContainer = this.$el.find('.noDataContainer');

                $noDataContainer.html(noDataTemplate(options));
                this.$el.find('.small-menu.lower').addClass('hidden');
                this.$el.find('.results-container').addClass('hidden');
                this.$el.find('.graphic-bar').addClass('hidden');
            },
            removeNoData: function () {
                var $noDataContainer = this.$el.find('.noDataContainer');

                $noDataContainer.empty();
                this.$el.find('.small-menu.lower').removeClass('hidden');
                this.$el.find('.results-container').removeClass('hidden');
                this.$el.find('.graphic-bar').removeClass('hidden');
            },
            createCanvas: function () {
                var $canvasContainer = this.$el.find('.graph-container');
                var $graphContainer = $canvasContainer.find('.stats-bar-chart');

                // if there is a canvas, remove it first
                if ($graphContainer.length) {
                    $graphContainer.remove();
                }

                // add canvas
                $canvasContainer.prepend('<canvas class="stats-bar-chart"></canvas>');
                $graphContainer = $canvasContainer.find('.stats-bar-chart');

                return $graphContainer;
            },
            renderBarStats: function () {
                var ctx = this.createCanvas().get(0).getContext('2d'),
                    $resultsContainer = this.$el.find('.results-container'),
                    $graphContainer = this.$el.find('.graphic-bar'),
                    $avg = $resultsContainer.find('.avg'),
                    $total = $resultsContainer.find('.total'),
                    currentDate = moment(),
                    currentDateMonth = parseInt(currentDate.format('M'), 10),
                    currentDateYear = parseInt(currentDate.format('YYYY'), 10),
                    currentBar,
                    tooltipText,
                    xLabel = '',
                    dateToGetMonthString,
                    statsInfo = this.statsData.metrics[this.currentInfoType],
                    barSpacingValue = 5,
                    data,
                    loader = EQ.Helpers.loaderAndErrorHandler(this.$el.find('.graphic-bar'), { 'color' : 'white' }),
                    self = this;

                // first empty the no-data template
                this.removeNoData();

                if (this.graphicBar) {
                    this.graphicBar.destroy();
                }

                $graphContainer.removeClass('year month day');
                $resultsContainer.removeClass('year month day');
                $graphContainer.addClass(this.statsData.type);
                $resultsContainer.addClass(this.statsData.type);

                // Clear extra stats info
                $avg.find('span.val, span.unit, span.measure-type').text('');
                $total.find('span.val, span.unit, span.measure-type').text('');

                loader.showLoader();

                if (this.statsData.type === 'month') {
                    barSpacingValue = 12;
                    tooltipText = '<%if (label){%><%=label%> <%}%>' + ' ' + this.currentYear;
                    xLabel = 'MONTHS';

                    if (currentDateYear === parseInt(this.currentYear, 10)) {
                        currentBar = currentDate.format('MMM');
                    }
                } else if (this.statsData.type === 'year'){
                    barSpacingValue = 24;
                    tooltipText = 'Year <%if (label){%><%=label%> <%}%>';
                    currentBar =  parseInt(currentDate.format('YYYY'), 10);
                    xLabel = 'YEARS';
                } else {
                    // For 'day' type stats
                    dateToGetMonthString = moment(this.currentMonthAndYear + '/1');
                    tooltipText = dateToGetMonthString.format('MMMM').toUpperCase() + ' ' + '<%if (label){%><%=label%> <%}%>';
                    xLabel = 'DAYS';

                    if (currentDateYear + '/' + currentDateMonth === this.currentMonthAndYear) {
                        currentBar = currentDate.format('D');
                    }
                }

                data = {
                    activeLabel : currentBar,
                    activeColor : '#3fecad',
                    labels: this.statsData.interval,
                    datasets: [
                        {
                            fillColor: 'rgb(63,236,173)',
                            highlightFill: 'rgba(14,130,93,1)',
                            data: this.statsData.metrics[this.currentInfoType].dataPoints
                        }
                    ]
                };

                setTimeout(function(){
                    var $twoRowContainer = $resultsContainer.find('.two-row-container'),
                        $threeRowContainer = $resultsContainer.find('.three-row-container'),
                        scaleSteps = (EQ.Helpers.getDeviceSize() === 'small') ? 4 : 8,
                        scaleMaxData = _.max(_.flatten(_.pluck(data.datasets, 'data'))),
                        scaleNumOfZeroes = Math.floor(Math.log(scaleMaxData) / Math.LN10),
                        scaleMaxValue = Math.ceil(scaleMaxData / (1 * Math.pow(10, scaleNumOfZeroes))) * Math.pow(10, scaleNumOfZeroes),
                        stepsWidth = Math.round(scaleMaxValue / scaleSteps);

                    loader.hideLoader();
                    self.graphicBar = new Chart(ctx).eqBar(data, {
                        scaleOverride: true,
                        scaleSteps: scaleSteps,
                        scaleStepWidth: stepsWidth,
                        scaleStartValue: 0,
                        showAxisLabels: true,
                        xLabel : xLabel,
                        yLabel : statsInfo.metricUnit,
                        scaleShowGridLines : true,
                        scaleGridLineColor : "rgba(128,128,128,1)",
                        scaleLineColor : "rgba(128,128,128,1)",
                        responsive : true,
                        barShowStroke : false,
                        barValueSpacing : barSpacingValue,
                        tooltipFillColor: "rgba(255,255,255,1)",
                        tooltipFontColor: "#000",
                        tooltipCornerRadius: 0,
                        tooltipYPadding: 16,
                        tooltipXPadding: 16,
                        tooltipTitleTemplate: tooltipText,
                        tooltipTemplate: "<%= value %>",
                        tooltipUnitTemplate: statsInfo.metricUnit,
                        tooltipTitleFontStyle: "bold",
                        tooltipFontStyle: "normal",
                        tooltipTitleFontSize: 14,
                        tooltipFontSize: 12,
                        tooltipUnitFontSize: 10,
                        tooltipLineSpacing: 4,
                        sliceSize: 0
                    });

                    // For total energy info, we use 3 columns
                    if (self.currentInfoType === 'Energy') {
                        $twoRowContainer.addClass('hidden');
                        $threeRowContainer.removeClass('hidden');

                        $threeRowContainer.find('.total-energy span.val').text(EQ.Helpers.numbers.trimDecimals(statsInfo.total, 0));
                        $threeRowContainer.find('.total-energy span.unit').text("kJ");
                        
                        $threeRowContainer.find('.max-watts span.val').text(EQ.Helpers.numbers.trimDecimals(statsInfo.max, 0));
                        $threeRowContainer.find('.max-watts span.unit').text("W");
                        
                        $threeRowContainer.find('.avg-watts span.val').text(EQ.Helpers.numbers.trimDecimals(statsInfo.average, 0));
                        $threeRowContainer.find('.avg-watts span.unit').text("W");

                    } else {
                        $twoRowContainer.removeClass('hidden');
                        $threeRowContainer.addClass('hidden');

                        // set values

                        $avg.find('span.val').text(EQ.Helpers.numbers.trimDecimals(statsInfo.average, self.currentInfoType === 'Distance' ? undefined : 0));
                        $total.find('span.val').text(EQ.Helpers.numbers.trimDecimals(statsInfo.total, self.currentInfoType === 'Distance' ? undefined : 0));
                        // and units
                        $avg.find('span.unit').text(statsInfo.metricUnit);
                        $total.find('span.unit').text(statsInfo.metricUnit);
                        // and titles
                        $avg.find('span.measure-type').text(self.currentInfoType);
                        $total.find('span.measure-type').text(self.currentInfoType);

                        $avg.find('span').css({ width: '100%'});
                        $avg.find('span').css({ width: 'auto'});

                        $total.find('span').css({ width: '100%'});
                        $total.find('span').css({ width: 'auto'});
                    }

                }, 1000);
            },

            render: function () {
                this.$el.html(this.template());
                // Init on 'month mode'
                this.changeTimeLapse('month');

                // set default stats type
                this.currentInfoType = 'Energy';

                // set current month and year as default
                this.updateCurrentDate('month', this.options.selectedDate.format('YYYY/M'));
                this.currentYear = this.options.selectedDate.format('YYYY');

                this.createDateSelector('month');
                this.createDateSelector('year');

                return this;
            },
            close: function () {
                this.remove();
                delete this.$el;
                delete this.el;
            }
        });

        var utils = {
            parseStatsData : function(rawData) {
                var statsData = {
                        type: '',
                        interval: [],
                        metrics: {}
                    },
                    interval,
                    intervalStartDate = moment(rawData.intervalStartDate),
                    intervalEndDate = moment(rawData.intervalEndDate),
                    intervalYears,
                    yearsCount,
                    monthCount = 1,
                    currentMonth,
                    monthStartDay;


                // Set type of data
                statsData.type = rawData.intervalType;

                // First generate correct interval

                if (statsData.type === 'month') {
                    statsData.interval = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    do {
                        monthCount++;
                    } while (monthCount <= 12);

                } else if (statsData.type === 'year') {
                    //get difference in years between interval start and end
                    intervalYears = intervalEndDate.diff(intervalStartDate, 'years');
                    yearsCount = parseInt(intervalStartDate.format('YYYY'), 10);

                    do {
                        statsData.interval.push(yearsCount);
                        yearsCount++;
                    } while (yearsCount <= parseInt(intervalEndDate.format('YYYY'), 10));

                } else if (statsData.type === 'day') {
                    // get current month and its limits
                    currentMonth = parseInt(intervalStartDate.format('MM'), 10),
                    monthStartDay = moment(intervalStartDate.startOf('month').format());
                    do {
                        statsData.interval.push(monthStartDay.format('D'));
                        monthStartDay.add('day', 1);
                    } while (parseInt(monthStartDay.format('MM')) === currentMonth);
                }

                _.each(rawData.metrics, function (groupedMetric) {

                    var metricType = groupedMetric.metric,
                        decimalsToShow = metricType === 'Distance' ? undefined : 0,
                        totalEntries,
                        total;

                    // First clear metrics values to round to 2 decimals and remove -1
                    for (var i = 0; i < groupedMetric.dataPoints.length; i++) {
                        groupedMetric.dataPoints[i] = groupedMetric.dataPoints[i] < 0 ? 0 : EQ.Helpers.numbers.trimDecimals(groupedMetric.dataPoints[i], decimalsToShow);
                    };

                    totalEntries = _.reduce(groupedMetric.dataPoints, function(amount, num) {
                        if (num > 0) {
                            amount++;
                        }
                        return amount;
                    }, 0);

                    total = _.reduce(groupedMetric.dataPoints, function(sum, el) {
                        return sum + el
                    }, 0);

                    groupedMetric.total = EQ.Helpers.numbers.trimDecimals(total, decimalsToShow);
                    groupedMetric.max = EQ.Helpers.numbers.trimDecimals(_.max(groupedMetric.dataPoints), decimalsToShow);
                    groupedMetric.average = EQ.Helpers.numbers.trimDecimals(total > 0 && totalEntries > 0 ? total / totalEntries : 0, decimalsToShow);

                    // Reduce to 2 decimals
                    if (metricType === 'Calories') {
                        groupedMetric.metricUnit = 'CAL';
                    } else if(metricType === 'Distance') {
                        groupedMetric.metricUnit = 'MI';
                    } else if(metricType === 'Energy') {
                        groupedMetric.metricUnit = 'W';
                    } else if(metricType === 'Power') {
                        metricType = groupedMetric.name;
                    } else {
                        groupedMetric.metricUnit = '';
                    }

                    if (!statsData.metrics[metricType]) {
                        statsData.metrics[metricType] = {};
                    }
                    statsData.metrics[metricType] = groupedMetric;
                });

                // Energy and Power metrics need to be show in the same place, yo we need to mix this metrics
                statsData.metrics['Energy'].max = statsData.metrics['MaxWatts'].max;
                statsData.metrics['Energy'].average = statsData.metrics['AverageWatts'].average;
                statsData.metrics['Energy'].dataPoints = statsData.metrics['AverageWatts'].dataPoints;
                
                // Power metric is no longer neccesary
                statsData.metrics['Power'] = null;

                return statsData;
            },
            dataIsEmpty: function (rawData) {
                var isEmpty = true
                if (rawData.metrics && rawData.metrics.length) {
                    _.each(rawData.metrics, function(metric) {
                        if (metric.dataPoints.length > 0) {
                            isEmpty = false;
                        }
                    });
                }
                return isEmpty;
            }
        };

        /**
        * Render module and return public interface
        */

        EnergyBarStatsComponent = new EnergyBarStatsView(options);
        $elementToAppendTo.prepend(EnergyBarStatsComponent.render().el);

        api = {
            'destroy' : function () {
                EnergyBarStatsComponent.close();
            },
            'getElement': function () {
                return EnergyBarStatsComponent.$el;
            }
        };

        return api;
    };


    module.exports = ActivityEnergyBarStats;
});