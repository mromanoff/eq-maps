define(function (require, exports, module) {
    "use strict";
    var renderEqGraph = function ($elementToAppendTo, options, emptyGraphMarkup) {
        var EqGraphView,
            noGraphDataModel,
            EqGraphComponent,
            referencesCollection,
            Chart = require('/assets/js/app/amd_components/chart.js'), // Load extented chartjs
            randomScalingFactor = function () {
                return Math.round(Math.random() * 100);
            },
            defaultOptions = {
                graphType: 'bar',
                chartConfig: {},
                chartData: [],
                textReferences: [],
                type: '',
                section: '',
                month: '',
                year: '',
                unit: '',
                xLabel: '',
                yLabel: '',
                showTooltip: true,
                hideCTAButtton: false,
                hasLogWeightButton: false
            },
            componentOptions = _.extend(defaultOptions, options || {}),
            api;

        /**
        * Models
        */
        var TextReference = Backbone.Model.extend({
            defaults: {
                title: '',
                value: '',
                unit: ''
            }
        });

        var NoGraphModel = Backbone.Model.extend({
            defaults: {
                section: '',
                date: ''
            }
        });


        /**
        * Collections
        */
        var ReferencesCollection = Backbone.Collection.extend({
            model: TextReference
        });


        /**
        * Views
        */
        EqGraphView = Backbone.View.extend({
            className: 'graphic-information-container',
            template: _.template($('#activityEqGraphicTemplate').html()),
            events: {
                'click .addWeightButton': 'openWeightOverlay'
            },
            initialize: function (options) {
                this.options = options || {};
            },
            openWeightOverlay: function (e) {
                e.preventDefault();
                
                Backbone.Events.trigger('log-weight-overlay:open');
            },
            drawGraph: function (graphType) {
                var ctx = this.$el.find('canvas')[0].getContext('2d'),
                    graphOptions = {},
                    template = '',
                    scaleDefaultSteps = (EQ.Helpers.getDeviceSize() === 'small') ? 4 : 8,
                    scaleMaxData = _.max(_.flatten(_.pluck(this.options.data.datasets, 'data'))),
                    scaleSteps = scaleMaxData < scaleDefaultSteps ? scaleMaxData : scaleDefaultSteps,
                    scaleNumOfZeroes = Math.floor(Math.log(scaleMaxData) / Math.LN10),
                    scaleMaxValue = Math.ceil(scaleMaxData/ (1 * Math.pow(10, scaleNumOfZeroes))) * Math.pow(10, scaleNumOfZeroes),
                    stepsWidth = Math.round(scaleMaxValue / scaleSteps);

                if (this.options.type === 'year') {
                    template = '<%if (label){%><%=label%><%}%>' + ', ' + this.options.year;
                } else {
                    template = this.options.month + ' <%if (label){%><%=label%><%}%>' + ', ' + this.options.year;
                }

                switch (graphType) {
                    case 'bar':
                        graphOptions = {
                            showAxisLabels: true,
                            xLabel: this.options.xLabel,
                            yLabel: this.options.yLabel,
                            scaleOverride: true,
                            scaleSteps: scaleSteps,
                            scaleStepWidth: stepsWidth,
                            scaleStartValue: 0,
                            scaleShowGridLines : true,
                            scaleGridLineColor : "rgb(112, 112, 112)",
                            scaleLineColor : "rgb(112, 112, 112)",
                            scaleFontFamily: "'Graphik Web', sans-serif",
                            scaleFontSize: 11,
                            scaleFontStyle: "700",
                            responsive : true,
                            barShowStroke : false,
                            barValueSpacing : 8,
                            tooltipFillColor: "rgba(255,255,255,1)",
                            tooltipFontColor: "#000",
                            tooltipCornerRadius: 0,
                            tooltipYPadding: 20,
                            tooltipXPadding: 10,
                            tooltipTitleTemplate: template,
                            tooltipTemplate: "<%= value %>",
                            tooltipUnitTemplate: this.options.unit,
                            tooltipTitleFontStyle: "bold",
                            tooltipFontStyle: "normal",
                            tooltipTitleFontSize: 14,
                            tooltipFontSize: 14,
                            tooltipUnitFontSize: 14,
                            tooltipLineSpacing: 4,
                            sliceSize: 0,
                            showTooltips: this.options.showTooltips
                        };
                        this.graph = new Chart(ctx).eqBar(this.options.data, graphOptions);
                    break;
                    case 'points':
                        graphOptions = {
                            showAxisLabels: true,
                            xLabel: this.options.xLabel,
                            yLabel: this.options.yLabel,
                            scaleOverride: true,
                            scaleSteps: scaleSteps,
                            scaleStepWidth: stepsWidth,
                            scaleStartValue: 0,
                            scaleShowGridLines : true,
                            scaleGridLineColor: "rgb(112, 112, 112)",
                            scaleLineColor: "rgb(112, 112, 112)",
                            scaleFontFamily: "'Graphik Web', sans-serif",
                            scaleFontSize: 11,
                            scaleFontStyle: "700",
                            bezierCurve: false,
                            datasetFill: true,
                            pointDot: true,
                            pointDotRadius: 5,
                            pointHitDetectionRadius: 6,
                            pointDotStrokeWidth: 0,
                            pointAreaColor: 'rgba(255,255,255,.2)',
                            barShowStroke: false,
                            responsive: true,
                            tooltipFillColor: "rgba(255,255,255,1)",
                            tooltipFontColor: "#000",
                            tooltipCornerRadius: 0,
                            tooltipYPadding: 20,
                            tooltipXPadding: 10,
                            tooltipTitleTemplate: template,
                            tooltipTemplate: "<%= value %>",
                            tooltipUnitTemplate: this.options.unit,
                            tooltipTitleFontStyle: "bold",
                            tooltipFontStyle: "normal",
                            tooltipTitleFontSize: 14,
                            tooltipFontSize: 14,
                            tooltipUnitFontSize: 14,
                            tooltipLineSpacing: 4,
                            showTooltips: this.options.showTooltips
                        };
                        this.graph = new Chart(ctx).eqLinear(this.options.data, graphOptions);
                    break;
                    case 'stacked':
                        graphOptions = {
                            scaleOverride: true,
                            scaleSteps: scaleSteps,
                            scaleStepWidth: stepsWidth,
                            scaleStartValue: 0,
                            scaleShowGridLines: true,
                            scaleGridLineColor: "rgb(112, 112, 112)",
                            scaleLineColor: "rgb(112, 112, 112)",
                            scaleFontFamily: "'Graphik Web', sans-serif",
                            scaleFontSize: 11,
                            scaleFontStyle: "700",
                            tooltipFillColor: "rgba(255,255,255,1)",
                            tooltipFontColor: "#000",
                            tooltipTitleFontColor: "#000",
                            tooltipCornerRadius: 1,
                            tooltipCaretSize: 8,
                            showTooltips: this.options.showTooltips,
                            barShowStroke: false,
                            responsive: true
                        };
                        this.graph = new Chart(ctx).eqStackedBar(this.options.data, graphOptions);
                    break;
                };
            },
            render: function () {
                this.$el.html(this.template(this.model));

                if (this.options.section) {
                    this.$el.find('.activity-eq-graphic').addClass(this.options.section);
                }

                this.collection.each(function (reference) {
                    var referenceSingleView = new ReferenceSingleView({
                        model: reference,
                        singleItem: this.collection.length === 1 ? true : false
                    });
                    this.$el.find('.activity-graphic-details').append(referenceSingleView.render().el);
                }, this);

                if (this.options.hasLogWeightButton) {
                    this.$el.find('.addWeightButton').removeClass('hidden');
                }

                return this;
            },
            close: function () {
                this.remove();
                delete this.$el;
                delete this.el;
            }
        });

        var ReferenceSingleView = Backbone.View.extend({
            initialize: function (options) {
                this.singleItem = options.singleItem || false;
            },
            model: TextReference,
            template: _.template($('#activityEqGraphicDetailTemplate').html()),
            render: function () {
                this.$el.html(this.template(this.model.toJSON()));

                if (this.singleItem) {
                    this.$el.addClass('single-data');
                }

                return this;
            }
        });

        var NoGraphDataView = Backbone.View.extend({
            events: {
                'click .addWeightButton': 'openWeightOverlay'
            },
            initialize: function (options) {
                this.options = options || {};
                this.options.emptyGraphMarkup = emptyGraphMarkup || '';
            },
            openWeightOverlay: function (e) {
                e.preventDefault();
                
                Backbone.Events.trigger('log-weight-overlay:open');
            },
            model: NoGraphModel,
            className: 'graphic-information-container no-data-overlay',
            template: _.template($('#activityNoDataTemplate').html()),
            render: function () {
                var data = _.extend({}, this.model.toJSON(), this.options);
                this.$el.html(this.template(data));

                if (this.options.hideCTAButtton) {
                    this.$el.find('.button.log').addClass('hidden');
                }

                return this;
            },
            close: function () {
                this.remove();
                delete this.$el;
                delete this.el;
            }
        });

        /**
        * Render module and return public interface
        */
        if (_.compact(_.flatten(componentOptions.chartData)).length > 0) {
            //Render Graph with Data
            referencesCollection = new ReferencesCollection (componentOptions.textReferences);

            _.each(componentOptions.chartConfig.datasets, function (dataset, index) {
                dataset.data = componentOptions.chartData[index];
            });

            EqGraphComponent = new EqGraphView ({
                collection: referencesCollection,
                data: componentOptions.chartConfig,
                type: componentOptions.type.toLowerCase(),
                section: componentOptions.section,
                year: componentOptions.year,
                month: componentOptions.month.toUpperCase(),
                unit: componentOptions.unit.toUpperCase(),
                xLabel: componentOptions.xLabel,
                yLabel: componentOptions.yLabel,
                showTooltips: componentOptions.showTooltip,
                hasLogWeightButton: componentOptions.hasLogWeightButton
            });

            $elementToAppendTo.prepend(EqGraphComponent.render().el);

            EqGraphComponent.drawGraph(componentOptions.graphType);
        } else {
            //Render no data overlay
            noGraphDataModel = new NoGraphModel ({
                section: componentOptions.section,
                date: (componentOptions.type === 'year') ? componentOptions.year : componentOptions.monthLargeName
            });
            EqGraphComponent = new NoGraphDataView ({model: noGraphDataModel, hideCTAButtton: componentOptions.hideCTAButtton});

            $elementToAppendTo.prepend(EqGraphComponent.render().el);
        }

        api = {
            destroy: function () {
                EqGraphComponent.close();
            },
            getElement: function () {
                return EqGraphComponent.$el;
            }
        };

        return api;
    };

    module.exports = renderEqGraph;
});