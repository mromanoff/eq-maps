define(function(require, exports, module){
    "use strict";
    var ActivityCyclingDetailStats = function($elementToAppendTo, componentData) {
		var ActivityCyclingDetailStatsView,
			Chart = require('components/chart'), // Load extented chartjs
			statsModel,
			detailStatsComponent,
			api;

		/**
	    * Views
	    */

		ActivityCyclingDetailStatsView = Backbone.View.extend({
			className: 'class-stats-container',
			template: _.template($('#cyclingDetailStatsTemplate').html()),
			events: {
				'click .small-menu a': 'changeGraphMode',
			},
			render: function () {

				this.$el.html(this.template(this.model.toJSON()));

				//Runs the graph
				_(function(view) {
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

				var ctx = this.$el.find('#statsGraph').get(0).getContext('2d');
				var chart = new Chart(ctx);
				
				this.statsGraph = {
					ctx : ctx,
					chart : chart,
					graph : '',
					datasets : {
						energy: [
							{
					            label: "This Ride",
					            fillColor: "rgba(220,220,220,0.2)",
					            strokeColor: "rgba(220,220,220,1)",
					            pointColor: "rgba(220,220,220,1)",
					            pointStrokeColor: "#fff",
					            pointHighlightFill: "#fff",
					            pointHighlightStroke: "rgba(220,220,220,1)",
					            data: [0, 6, 8, 12, 15, 17, 20, 24, 28, 29, 33]
					        },
					        {
					            label: "Best Ride",
					            fillColor: "rgba(151,187,205,0.2)",
					            strokeColor: "rgba(151,187,205,1)",
					            pointColor: "rgba(151,187,205,1)",
					            pointStrokeColor: "#fff",
					            pointHighlightFill: "#fff",
					            pointHighlightStroke: "rgba(151,187,205,1)",
					            data: [0, 2, 4, 8, 10, 19, 23, 26, 29, 29, 31]
					        }
					    ],
						distance: [
							{
					            label: "This Ride",
					            fillColor: "rgba(220,220,220,0.2)",
					            strokeColor: "rgba(220,220,220,1)",
					            pointColor: "rgba(220,220,220,1)",
					            pointStrokeColor: "#fff",
					            pointHighlightFill: "#fff",
					            pointHighlightStroke: "rgba(220,220,220,1)",
					            data: [6, 7, 8, 9, 12, 14, 21, 23, 27, 30, 37]
					        },
					        {
					            label: "Best Ride",
					            fillColor: "rgba(151,187,205,0.2)",
					            strokeColor: "rgba(151,187,205,1)",
					            pointColor: "rgba(151,187,205,1)",
					            pointStrokeColor: "#fff",
					            pointHighlightFill: "#fff",
					            pointHighlightStroke: "rgba(151,187,205,1)",
					            data: [2, 3, 6, 10, 11, 26, 27, 28, 29, 35, 37]
					        }
					    ],
						calories: [
							{
					            label: "This Ride",
					            fillColor: "rgba(220,220,220,0.2)",
					            strokeColor: "rgba(220,220,220,1)",
					            pointColor: "rgba(220,220,220,1)",
					            pointStrokeColor: "#fff",
					            pointHighlightFill: "#fff",
					            pointHighlightStroke: "rgba(220,220,220,1)",
					            data: [4, 5, 9, 11, 12, 16, 17, 18, 21, 23, 59]
					        },
					        {
					            label: "Best Ride",
					            fillColor: "rgba(151,187,205,0.2)",
					            strokeColor: "rgba(151,187,205,1)",
					            pointColor: "rgba(151,187,205,1)",
					            pointStrokeColor: "#fff",
					            pointHighlightFill: "#fff",
					            pointHighlightStroke: "rgba(151,187,205,1)",
					            data: [3, 6, 7, 8, 11, 18, 25, 26, 29, 32, 38]
					        }
					    ]
					}
				}
			},
			renderGraph: function ( datasets ) {

				var data = {
				    labels: ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45'],
				    datasets: this.statsGraph.datasets.energy
				};

				var options = {

					scaleLabel: "<%=value%>      ", //Do not remove these spaces

				    scaleGridLineColor : "#7c878e",
				    
				    scaleLineColor : "#7c878e",

				    pointDot : false,

				    pointHitDetectionRadius : 20,

				    datasetFill : false,
                                    datasetStrokeWidth : 6,
				    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",

				    responsive: true
				};

				this.statsGraph.graph = this.statsGraph.chart.eqLine(data, options);

			},
			changeGraphMode: function (e) {
				
				e.preventDefault();

				var $currentOption = $(e.currentTarget),
					$optionsGroupType = $currentOption.parent().parent();

				if (!$currentOption.hasClass('selected')) {

					var ndata;

					// Set on the current, remove selected class for all the elements
					$currentOption
						.addClass('selected')
						.parent().siblings().find('a').removeClass('selected');

					/* Here we should be calling the proper service */
					switch($currentOption.data('type')){
						case 'energy':
							ndata = {
							    labels: ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45'],
							    datasets: this.statsGraph.datasets.energy
							};
							break;
						case 'distance':
							ndata = {
							    labels: ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45'],
							    datasets: this.statsGraph.datasets.distance
							};
							break;
						case 'calories':
							ndata = {
							    labels: ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45'],
							    datasets: this.statsGraph.datasets.calories
							};
							break;
					}

					this.statsGraph.graph = this.statsGraph.chart.eqLine(ndata, this.statsGraph.graph.options);
				}
			}
		});

		/**
	    * Render module and return public interface
	    */

		statsModel = new Backbone.Model(componentData);
		detailStatsComponent = new ActivityCyclingDetailStatsView({model: statsModel});
		
		$elementToAppendTo.append(detailStatsComponent.render().el);

		api = {
			'destroy' : function () {
				detailStatsComponent.close();
			},
			'getElement': function () {
				return detailStatsComponent.$el;
			}
		};

		return api;
	};


	module.exports = ActivityCyclingDetailStats;
});
