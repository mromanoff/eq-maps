(function (global, App) {
    'use strict';

    /* global debug, Chart, EQ, moment */

    /**
    * Views 
    */

    var endpoint = {
        ME_ACTIVITY_CYCLING : '/v3/me/activity/cycling',
        GRAPH_STATS : function (classInstanceID) { return '/v3/classes/' + classInstanceID + '/me/data'; },
        CLASS_STATS : function (classInstanceID) { return '/v3/classes/' + classInstanceID + '/me/statistics'; }
    };

    var ActivityCyclingDetailStatsView = Backbone.View.extend({
        className: 'class-stats-container',
        initialize: function (options) {
            this.options = options || {};
        },
        template: _.template($('#cyclingDetailStatsTemplate').html()),
        events: {
            'click .small-menu a': 'changeGraphMode'
        },
        createCanvas: function () {
            var $canvasContainer = this.$el.find('.canvas-container');
            var $graphContainer = $canvasContainer.find('#statsGraph');

            // if there is a canvas, remove it first
            if ($graphContainer.length) {
                $graphContainer.remove();
            }

            // add canvas
            $canvasContainer.prepend('<canvas id="statsGraph"></canvas>');
            $graphContainer = $canvasContainer.find('#statsGraph');

            return $graphContainer;
        },
        render: function () {
            this.$el.html(this.template(this.options));

            //Runs the graph
            _(function (view) {
                view.initGraph();
                view.renderGraph();
            }).defer(this);

            return this;
        },
        close: function () {
            this.remove();
            delete this.$el;
            delete this.el;
        },
        initGraph: function () {
            this.options.unit = 'Watts';
            this.options.shortUnit = 'W';
            this.statsGraph = {
                ctx : '',
                chart : '',
                graph : '',
                datasets : {
                    energy: [
                        {
                            label: 'Best Ride',
                            fillColor: '#373e47',
                            strokeColor: '#373e47',
                            pointColor: '#373e47',
                            pointStrokeColor: '#fff',
                            pointHighlightFill: '#fff',
                            pointHighlightStroke: 'rgba(220,220,220,1)',
                            data: this.options.finalMetrics.data.bestRide.Energy.dataPoints,
                            totalValue: this.options.finalMetrics.data.bestRide.Energy.totalValue
                        },
                        {
                            label: 'This Ride',
                            fillColor: this.options.color,
                            strokeColor: this.options.color,
                            pointColor: this.options.color,
                            pointStrokeColor: '#fff',
                            pointHighlightFill: '#fff',
                            pointHighlightStroke: this.options.color,
                            data: this.options.finalMetrics.data.thisRide.Energy.dataPoints,
                            totalValue: this.options.finalMetrics.data.thisRide.Energy.totalValue
                        }
                    ],
                    distance: [
                        {
                            label: 'Best Ride',
                            fillColor: '#373e47',
                            strokeColor: '#373e47',
                            pointColor: '#373e47',
                            pointStrokeColor: '#fff',
                            pointHighlightFill: '#fff',
                            pointHighlightStroke: 'rgba(220,220,220,1)',
                            data: this.options.finalMetrics.data.bestRide.Distance.dataPoints,
                            totalValue: this.options.finalMetrics.data.bestRide.Distance.totalValue
                        },
                        {
                            label: 'This Ride',
                            fillColor: this.options.color,
                            strokeColor: this.options.color,
                            pointColor: this.options.color,
                            pointStrokeColor: '#fff',
                            pointHighlightFill: '#fff',
                            pointHighlightStroke: this.options.color,
                            data: this.options.finalMetrics.data.thisRide.Distance.dataPoints,
                            totalValue: this.options.finalMetrics.data.thisRide.Distance.totalValue
                        }
                    ]
                }
            };
        },
        getGraphOptions: function (datasets) {
            var steps = 30,
                scaleSteps = (EQ.Helpers.getDeviceSize() === 'small') ? 4 : 8,
                scaleMaxData = _.max(_.flatten(_.pluck(datasets, 'data'))),
                scaleNumOfZeroes = Math.floor(Math.log(scaleMaxData) / Math.LN10),
                scaleMaxValue = Math.ceil(scaleMaxData / (1 * Math.pow(10, scaleNumOfZeroes))) * Math.pow(10, scaleNumOfZeroes),
                stepsWidth = Math.round(scaleMaxValue / scaleSteps);

            return {
                labelTrimSeconds: true,
                showAxisLabels: true,
                xLabel: 'MINS          ',
                yLabel: this.options.unit + '          ',
                scaleOverride: true,
                scaleSteps: scaleSteps,
                scaleStepWidth: stepsWidth,
                scaleStartValue: 0,
                showTooltips : true,
                labelStepping : true,
                labelStep : steps,
                hideZeroValues : true,
                scaleLabel : '<%=value%>      ', //Do not remove these spaces
                scaleGridLineColor : '#7c878e',
                scaleLineColor : '#7c878e',
                pointDot : false,
                pointHitDetectionRadius : 0,
                datasetFill : false,
                datasetStrokeWidth : 4,
                legendTemplate : '<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
                responsive: true,
                bezierCurve: false,
                tooltipFillColor: 'rgba(255,255,255,1)',
                tooltipFontColor: '#000',
                tooltipTitleFontColor: '#000',
                tooltipCornerRadius: 0,
                tooltipYPadding: 26,
                tooltipXPadding: 28,
                multiTooltipTemplate: '<%= value %> ' + this.options.shortUnit,
                tooltipTitleTemplate: 'AT ',
                tooltipTemplate: '<%= value %>',
                tooltipTitleFontStyle: 'bold',
                tooltipFontStyle: 'normal',
                tooltipTitleFontSize: 14,
                tooltipFontSize: 14
            };
        },
        renderGraph: function () {
            var data = {
                labels: this.options.finalMetrics.labels,
                datasets: this.statsGraph.datasets.energy
            };

            this.statsGraph.ctx = this.createCanvas().get(0).getContext('2d');
            this.statsGraph.chart = new Chart(this.statsGraph.ctx);
            this.statsGraph.graph = this.statsGraph.chart.eqLine(data, this.getGraphOptions(data.datasets));
            this.updateMetrics('energy');
        },
        changeGraphMode: function (e) {

            e.preventDefault();

            var $currentOption = $(e.currentTarget);
            //var $optionsGroupType = $currentOption.parent().parent();

            if (!$currentOption.hasClass('selected')) {

                var ndata;

                // Set on the current, remove selected class for all the elements
                $currentOption
                .addClass('selected')
                .parent().siblings().find('a').removeClass('selected');

                switch ($currentOption.data('type')) {
                case 'energy':
                    ndata = {
                        labels: this.options.finalMetrics.labels,
                        datasets: this.statsGraph.datasets.energy
                    };
                    break;
                case 'distance':
                    ndata = {
                        labels: this.options.finalMetrics.labels,
                        datasets: this.statsGraph.datasets.distance
                    };

                    break;
                }

                this.updateMetrics($currentOption.data('type'));

                this.statsGraph.ctx = this.createCanvas().get(0).getContext('2d');
                this.statsGraph.chart = new Chart(this.statsGraph.ctx);
                this.statsGraph.graph = this.statsGraph.chart.eqLine(ndata, this.getGraphOptions(ndata.datasets));
            }
        },
        updateMetrics: function (metricType) {
            var $statsBox = this.$el.find('.graphic-stats'),
                metricUnit = metricType === 'energy' ? 'AVG WATTS' : 'MI',
                bestRideValue = metricType === 'energy' ? parseInt(this.statsGraph.datasets[metricType][0].totalValue, 10) : EQ.Helpers.numbers.roundToTwoDecimals(this.statsGraph.datasets[metricType][0].totalValue),
                currentRideValue = metricType === 'energy' ? parseInt(this.statsGraph.datasets[metricType][1].totalValue, 10) : EQ.Helpers.numbers.roundToTwoDecimals(this.statsGraph.datasets[metricType][1].totalValue);

            this.options.unit = metricType === 'energy' ? 'Watts' : 'MI';
            this.options.shortUnit = metricType === 'energy' ? 'W' : 'MI';

            $statsBox.find('.currentRide .value').text(currentRideValue + ' ' + metricUnit);
            $statsBox.find('.bestRide .value').text(bestRideValue + ' ' + metricUnit);
        }
    });

    var utils = {
        getSpecificMetric: function (serviceData, metric) {
            var points = (_.where(serviceData.metrics, {name: metric}))[0].dataPoints,
                pointsToSimulate = [],
                lastPointValue,
                differenceBetweenPoints,
                step;

            _.each(points, function (point, index) {
                var currentPointValue = EQ.Helpers.numbers.trimDecimals(points[index]);

                if (point === -1) {
                    pointsToSimulate.push(index);
                } else {
                    // there is an actual value, so we check if there are points to simulate
                    if (pointsToSimulate.length) {
                        // get the difference between the two points

                        if (lastPointValue) {
                            differenceBetweenPoints = currentPointValue - lastPointValue;
                            step = Math.abs(differenceBetweenPoints) / (pointsToSimulate.length + 1);

                            _.each(pointsToSimulate, function (simulatedPoint) {
                                points[simulatedPoint] = EQ.Helpers.numbers.trimDecimals(differenceBetweenPoints > 0 ? lastPointValue + step : lastPointValue - step);
                                lastPointValue = points[simulatedPoint];
                            });
                        } else {
                            // if there is no prevous value, fill the empty points with the current value
                            _.each(pointsToSimulate, function (simulatedPoint) {
                                points[simulatedPoint] = currentPointValue;
                            });
                        }

                        pointsToSimulate = [];
                    }

                    lastPointValue = currentPointValue;
                }

                points[index] = currentPointValue;
            });

            // check if there are empty points after finish the loop
            if (pointsToSimulate.length) {
                // if there are, fill them with the last value
                _.each(pointsToSimulate, function (simulatedPoint) {
                    points[simulatedPoint] = lastPointValue;
                });
            }

            return points;
        },
        parseGraphData: function (currentClassData, bestWattData, bestDistanceData) {
            var time,
                minutes = 0,
                seconds = 0,
                finalMetrics = {
                data: {
                    thisRide: {
                        Energy: {
                            dataPoints: utils.getSpecificMetric(currentClassData, 'AverageWatts'),
                            totalValue: currentClassData.energyValue
                        },
                        Distance: {
                            dataPoints: utils.getSpecificMetric(currentClassData, 'TotalDistance'),
                            totalValue: currentClassData.distanceValue
                        }
                    },
                    bestRide: {
                        Energy: {
                            dataPoints: utils.getSpecificMetric(bestWattData, 'AverageWatts'),
                            date: bestWattData.date,
                            totalValue: bestWattData.value
                        },
                        Distance: {
                            dataPoints: utils.getSpecificMetric(bestDistanceData, 'TotalDistance'),
                            date: bestDistanceData.date,
                            totalValue: bestDistanceData.value
                        }
                    }
                },
                labels: []
            };

            debug('LABELS SIZE', finalMetrics.data.thisRide.Energy.dataPoints.length);
            debug('INTERVAL STEPS', currentClassData.intervalStep);

            _.each(finalMetrics.data.thisRide.Energy.dataPoints, function (point, index) {
                if (index !== 0) {
                    time = index * currentClassData.intervalStep;
                    minutes = Math.floor(time / 60);
                    seconds = time - minutes * 60;

                    if (seconds === 0) {
                        seconds = '00';
                    }

                    finalMetrics.labels.push(minutes + ':' + seconds);
                }
            });


            debug('FINAL METRICS +++++++++', finalMetrics);
            return finalMetrics;
        },
        checkIfHasMetrics: function (graphData) {
            if (utils.getSpecificMetric(graphData, 'AverageWatts').length === 0 &&
                utils.getSpecificMetric(graphData, 'TotalDistance').length === 0) {
                return false;
            } else {
                return true;
            }
        }
    };

    App.Components['activity-cycling-detail-stats'] = function ($el, options) {
        require(['/assets/js/app/amd_components/chart.js'], function () {
            debug('INIT STATS CYCLING');

            // First get best stats
            var xhrActivityCycling = EQ.Helpers.getService(endpoint.ME_ACTIVITY_CYCLING);
            // and current ride total values
            var xhrActivityCyclingThisRide = EQ.Helpers.getService(endpoint.CLASS_STATS(options.classId));

            EQ.Helpers.when(xhrActivityCycling, xhrActivityCyclingThisRide).done(function (generalDataResponse) {
                var bestClassMetricsData = generalDataResponse[0].bestClassMetrics || [],
                    currentClassMetrics = generalDataResponse[1].metrics,
                    bestDistanceClass,
                    bestWattsClass,
                    xhrBestWatt,
                    xhrBestDistance,
                    xhrCurrentClass;

                // get best distance and avdg watts classinstance to compare later
                bestDistanceClass = (_.where(bestClassMetricsData, {name: 'TotalDistance'}))[0];
                debug('BEST DISTANCE CLASS ID', bestDistanceClass);

                bestWattsClass = (_.where(bestClassMetricsData, {name: 'AverageWatts'}))[0];
                debug('BEST WATTS CLASS ID', bestWattsClass);

                debug('CURRENT CLASS ID', options.classId);

                // Prepare the 3 ajax call for best watts, best distance and current Class
                xhrCurrentClass = EQ.Helpers.getService(endpoint.GRAPH_STATS(options.classId));
                xhrBestWatt = EQ.Helpers.getService(endpoint.GRAPH_STATS(bestWattsClass.classInstanceId));
                xhrBestDistance = EQ.Helpers.getService(endpoint.GRAPH_STATS(bestDistanceClass.classInstanceId));

                EQ.Helpers.when(xhrBestWatt, xhrBestDistance, xhrCurrentClass).done(function (response) {
                    var detailStatsComponent,
                        bestWattData = response[0],
                        bestDistanceData = response[1],
                        currentClassData = response[2];

                    if (utils.checkIfHasMetrics(currentClassData)) {
                        // add dates for best distance and best watts classes
                        bestWattData.date = moment(bestWattsClass.metricDate);
                        bestWattData.value = bestWattsClass.value;
                        bestDistanceData.date = moment(bestDistanceClass.metricDate);
                        bestDistanceData.value = bestDistanceClass.value;
                        currentClassData.energyValue = (_.where(currentClassMetrics, {name: 'AverageWatts'}))[0].value;
                        currentClassData.distanceValue = (_.where(currentClassMetrics, {name: 'TotalDistance'}))[0].value;

                        // add data to the options array
                        options.finalMetrics = utils.parseGraphData(currentClassData, bestWattData, bestDistanceData);

                        detailStatsComponent = new ActivityCyclingDetailStatsView(options);
                        $el.append(detailStatsComponent.render().el);
                    }
                });
            });

            $('.leaderboards-module .remove-class').removeClass('hidden');
        });
    };

} (window, window.App));
