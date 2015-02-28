define(function(require, exports, module){
    "use strict";
    var ActivityCyclingDetail = function($elementToAppendTo) {
		var ActivityCyclingDetailView,
			detailComponent,
			api;

		/**
	    * Views
	    */

		ActivityCyclingDetailView = Backbone.View.extend({
			className: 'cycling-detail',
			template: _.template($('#cyclingDetailTemplate').html()),
			render: function () {
				this.$el.html(this.template());
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

		detailComponent = new ActivityCyclingDetailView({});
		
		$elementToAppendTo.prepend(detailComponent.render().el);

		api = {
			'destroy' : function () {
				detailComponent.close();
			},
			'getElement': function () {
				return detailComponent.$el;
			}
		};

		return api;
	};

	module.exports = ActivityCyclingDetail;
});