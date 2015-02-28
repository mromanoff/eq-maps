define(function(require, exports, module){
	"use strict";
	var ActivityAppTour = function( $elementToAppendTo, closeEvent ) {

		var ActivityAppTourView,
			ActivityAppTourComponent,
			$overlay,
			api;
		

		ActivityAppTourView = Backbone.View.extend({
			id: 'activity-app-tour-section',
			tagName: 'section',
			template: _.template($('#activityAppTour').html()),
			events: {
				'click a': 'close_event'
			},
			render: function () {
				this.$el.html(this.template());
            	return this;
			},
			close: function () {
				this.remove();
			    delete this.$el;
			    delete this.el;
			},
			close_event: function (e) {
				e.preventDefault();
				closeEvent();
			},
			setOverlay : function ( $container ) {
				$overlay.height($container.outerHeight() + $('footer').height());

			}
		});

		/**
	    * Render module and return public interface
	    */
		ActivityAppTourComponent = new ActivityAppTourView();
		$elementToAppendTo.append(ActivityAppTourComponent.render().el);
		$overlay = ActivityAppTourComponent.$el.find('#activity-app-tour-overlay');
		
		api = {
			'destroy' : function () {
				ActivityAppTourComponent.close();
			},
			'getElement' : function () {
				return ActivityAppTourComponent.$el;
			},
			'setOverlay' : ActivityAppTourComponent.setOverlay
		};

		return api;
	};

	module.exports = ActivityAppTour;
});