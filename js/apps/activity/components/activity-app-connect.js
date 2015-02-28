define(function(require, exports, module){
	"use strict";
	var ActivityAppConnect = function( $elementToAppendTo, liEvent ) {

		var ActivityAppConnectView,
			ActivityAppConnectComponent,
			api;
		

		ActivityAppConnectView = Backbone.View.extend({
			id: 'activity-app-page-connect',
			className: 'clearfix',
			template: _.template($('#activityAppPageConnect').html()),
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
		ActivityAppConnectComponent = new ActivityAppConnectView();
		$elementToAppendTo.append(ActivityAppConnectComponent.render().el);

		api = {
			'destroy' : function () {
				ActivityAppConnectComponent.close();
			},
			'getElement': function () {
				return ActivityAppConnectComponent.$el;
			}
		};

		return api;
	};

	module.exports = ActivityAppConnect;
});