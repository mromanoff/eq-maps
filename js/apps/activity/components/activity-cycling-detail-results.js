define(function(require, exports, module){
    "use strict";
    var ActivityCyclingDetailResults = function($elementToAppendTo, componentData) {
		var ActivityCyclingDetailResultsView,
			resultsModel,
			detailResultsComponent,
			api;

		/**
	    * Views
	    */

		ActivityCyclingDetailResultsView = Backbone.View.extend({
			className: 'class-results-container',
			template: _.template($('#cyclingDetailResultsTemplate').html()),
			render: function () {
				this.$el.html(this.template(this.model.toJSON()));
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

		resultsModel = new Backbone.Model(componentData);
		detailResultsComponent = new ActivityCyclingDetailResultsView({model: resultsModel});
		
		$elementToAppendTo.append(detailResultsComponent.render().el);

		api = {
			'destroy' : function () {
				detailResultsComponent.close();
			},
			'getElement': function () {
				return detailResultsComponent.$el;
			}
		};

		return api;
	};


	module.exports = ActivityCyclingDetailResults;
});