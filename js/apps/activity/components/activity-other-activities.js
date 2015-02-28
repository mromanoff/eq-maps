define(function(require, exports, module){
    "use strict";
    var ActivityOtherActivities = function($elementToAppendNextTo) {

		var UserOtherActivitiesView,
			componentData,
			userOtherActivitiesComponent,
			api;

		/**
	    * Views
	    */

		UserOtherActivitiesView = Backbone.View.extend({
			className: 'main-content activities-module col-3 black',
			template: _.template($('#otherActivitiesTemplate').html()),
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

		userOtherActivitiesComponent = new UserOtherActivitiesView();
		$elementToAppendNextTo.after(userOtherActivitiesComponent.render().el);

		api = {
			'destroy' : function () {
				userOtherActivitiesComponent.close();
			},
			'getElement': function () {
				return userOtherActivitiesComponent.$el;
			}
		};

		return api;
	};


	module.exports = ActivityOtherActivities;
});