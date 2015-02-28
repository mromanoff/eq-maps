define(function(require, exports, module){
    "use strict";
    var ActivityStatsComparision = function($elementToAppendTo, componentData, options) {
		require('owlcarousel');

		var BestStatModel,
			BestStatsCollection,
			StatViewHelpers,
			BestStatsView,
			BestStatSingleView,
			bestStatsCollection,
			bestStatsComponent,
			api,
			statsTitles;

		statsTitles = {
			TotalCalories: 'Total calories',
			TotalDistance: 'Distance',
			TotalEnergy: 'Total energy',
			MaxWatts: 'Max watts',
			AverageWatts: 'Avg watts',
		};

	    /**
	    * Models
	    */

		BestStatModel = Backbone.Model.extend({
			defaults: {
				"classInstanceId": 0,
				"className": "",
				"facilityName": "",
				"startDate": "",
				"endDate": "",
				"metric": "",
				"name": "",
				"value": "-",
				"workoutId": ""
        	}
    	});

		/**
		* Collections
		*/

		BestStatsCollection = Backbone.Collection.extend({
			model: BestStatModel
		});

		/**
	    * Views
	    */

		StatViewHelpers = {
	        getStatTitle: function () {
	        	return statsTitles[this.name];
	            
	        },
	        getMetricUnit: function () {
	        	var metricDetail,
	            	metricUnits = [
	            	{
			            metric: "Time",
			            shortUnit: "",
			            longUnit: ""
			        },
			        {
			            metric: "Energy",
			            shortUnit: "W",
			            longUnit: "Watts"
			        },
			        {
			            metric: "Distance",
			            shortUnit: "MI",
			            longUnit: "Miles"
			        },
			        {
			            metric: "Calories",
			            shortUnit: "CAL",
			            longUnit: ""
			        },
			        {
			            metric: "Speed",
			            shortUnit: "MPH",
			            longUnit: ""
			    }];

	        	if (!options.emptyActivity) {
			        metricDetail = (_.where(metricUnits, {metric: this.metric}))[0];
			        if (this.name === 'TotalEnergy') {
			        	metricDetail = {
				            metric: "Energy",
				            shortUnit: "kJ",
				            longUnit: "Kilo Joules"
			        	};
			        }
					return metricDetail && metricDetail.shortUnit;
	        	}
	        }
		}

		BestStatsView = Backbone.View.extend({
			className: 'personal-bests',
			template: _.template($('#statsComparisionTemplate').html()),
	        events: {
	            'click .icon-right-arrow': 'goToNext',
	            'click .icon-left-arrow': 'goToPrev'
	        },
			goToNext: function (e) {
            	e.preventDefault();
            	var $carousel = this.$el.find('.main-best-ride');
            	$carousel.data('owlCarousel').next();
	        },
	        goToPrev: function (e) {
	            e.preventDefault();
	            var $carousel = this.$el.find('.main-best-ride');
	            $carousel.data('owlCarousel').prev();
	        },
			showHideArrows: function () {
	            var $carousel = this.$el.find('.main-best-ride');

	            if ($carousel.data('owlCarousel').itemsAmount > $carousel.data('owlCarousel').visibleItems.length) {
	                this.$el.find('.navigation').removeClass('hidden');
	            } else {
	                this.$el.find('.navigation').addClass('hidden');
	            }
        	},
			render: function () {
				var $carousel,
					self = this;

				self.statsSingleViews = [];

				this.$el.html(this.template());
				$carousel = this.$el.find('.main-best-ride');

				// Add collection elements 
				this.collection.each(function(bestStatItem) {
					if (bestStatItem.get('value')  !== '-') {
						bestStatItem.set('value', EQ.Helpers.numbers.trimDecimals(bestStatItem.get('value'), bestStatItem.get('name') === 'TotalDistance' ? undefined : 0));
					}

					var statSingleView = new BestStatSingleView({ model: bestStatItem });
                	$carousel.append(statSingleView.render().el);
                	self.statsSingleViews.push(statSingleView);
				})

	            if (this.collection.length === 1) {
	                this.$el.find('.navigation').addClass('hidden');
	            }

				App.loadComponent('owl-slider', $carousel, {
	                singleItem: false,
	                items: 2,
	                itemsDesktop: [1200, 2],
	                itemsTablet: [1023, 2],
	                itemsMobile: [768, 1],
	                afterInit: function () {
	                    setTimeout(function () {
	                        self.showHideArrows();
	                    }, 2000);
	                },
	                afterUpdate: function () {
	                    self.showHideArrows();
	                }
	            });

            	return this;
			},
			close: function () {
				// First check all the child views and delete them
				_.each(this.statsSingleViews, function (singleView) {
					singleView.close();
				})

				this.remove();
			    delete this.$el;
			    delete this.el;
			}
		});

		BestStatSingleView = Backbone.View.extend({
			className: 'best-ride-container',
			template: _.template($('#bestStatSingleViewTemplate').html()),
			getRenderData: function () {
	            var data = this.model.toJSON();
	            return _.extend(data, StatViewHelpers);
			},
			render: function () {
				this.$el.html(this.template(this.getRenderData()));
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

	    if (options.emptyActivity || componentData.length === 0) {
	    	componentData = [
			    {
			      "metric": "calories",
			      "name": "TotalCalories",
			      "metricDate": ''
			    },
			    {
			      "metric": "distance",
			      "name": "TotalDistance",
			      "metricDate": ''
			    },
			    {
			      "metric": "energy",
			      "name": "TotalEnergy",
			      "metricDate": ''
			    },
			    {
			      "metric": "energy",
			      "name": "MaxWatts",
			      "metricDate": ''
			    },
			    {
			      "metric": "energy",
			      "name": "AverageWatts",
			      "metricDate": ''
			    }
			];
	    }

		bestStatsCollection = new BestStatsCollection(componentData);
		bestStatsComponent = new BestStatsView({collection: bestStatsCollection});
		$elementToAppendTo.prepend(bestStatsComponent.render().el);

		api = {
			'destroy' : function () {
				bestStatsComponent.close();
			},
			'getElement': function () {
				return bestStatsComponent.$el;
			}
		};

		return api;
	};


	module.exports = ActivityStatsComparision;
});