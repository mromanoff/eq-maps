define(function(require, exports, module){
	"use strict";
	var ActivityAppPage = function( $elementToAppendTo ) {

		var ActivityAppPageView,
			ActivityAppPageComponent,
			api,
			defer = new $.Deferred();
		
		/**
	    * Views
	    */
		ActivityAppPageView = Backbone.View.extend({
			id: 'activity-app-page',
			template: _.template($('#activityAppPage').html()),
			render: function () {
				this.$el.html(this.template());
				this.bindLoaderEvents();
            	return this;
			},
			bindLoaderEvents: function () {
				var $loader_wrapper = this.$el.find('#activity-app-page-loading'),
					loader;

				Backbone.Events.on('activityLoader:start', function () {
					$loader_wrapper.empty();
					loader = EQ.Helpers.loaderAndErrorHandler($loader_wrapper, { 'color' : 'white' });
					loader.showLoader();
					$loader_wrapper.show();
				});
				Backbone.Events.on('activityLoader:remove', function () {
					loader.hideLoader();
					$loader_wrapper.hide();
					defer.resolve();
				});
				Backbone.Events.on('activityLoader:error', function () {
					$loader_wrapper.show();
					loader.showError();
				});
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
		ActivityAppPageComponent = new ActivityAppPageView();
		$elementToAppendTo.append(ActivityAppPageComponent.render().el);

		api = {
			'destroy' : function () {
				ActivityAppPageComponent.close();
			},
			'getElement': function () {
				return ActivityAppPageComponent.$el;
			},
			'getVisual': function () {
				return ActivityAppPageComponent.$el.find('#activity-app-page-visual');
			},
			'getList': function () {
				return ActivityAppPageComponent.$el.find('#activity-app-page-list');
			},
			'getDeferred': function () {
				return defer;
			}
		};

		return api;
	};

	module.exports = ActivityAppPage;
});