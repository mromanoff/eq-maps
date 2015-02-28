define(function(require, exports, module){
    "use strict";
    var ActivityCyclingExtra = function($elementToAppendTo, componentData) {
		var ActivityCyclingExtraView,
			ActivityCyclingExtraModel,
			ActivityCyclingExtraComponent,
			api;

		/**
	    * Views
	    */

		ActivityCyclingExtraView = Backbone.View.extend({
			className: 'activity-cycling-extra',
			template: _.template($('#activityCyclingExtraTemplate').html()),
			hide: function () {
				this.$el.addClass('hidden');
			},
			show: function () {
				this.$el.removeClass('hidden');
			},
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

		ActivityCyclingExtraModel = new Backbone.Model(componentData);
		ActivityCyclingExtraComponent = new ActivityCyclingExtraView({model: ActivityCyclingExtraModel});
		
		$elementToAppendTo.prepend(ActivityCyclingExtraComponent.render().el);

		api = {
			'destroy' : function () {
				ActivityCyclingExtraComponent.close();
			},
			'getElement': function () {
				return ActivityCyclingExtraComponent.$el;
			},
			'hide': function () {
				ActivityCyclingExtraComponent.hide();
			},
			'show': function () {
				ActivityCyclingExtraComponent.show();
			}
		};

		return api;
	};


	module.exports = ActivityCyclingExtra;
});