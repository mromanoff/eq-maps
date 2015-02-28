define(function(require, exports, module){
    "use strict";
    var ActivityTopMessage = function($elementToAppendTo, exitCallback) {
		var TopTitleView,
			titleModel,
			topTitleComponent,
			api;

		/**
	    * Views
	    */

		TopTitleView = Backbone.View.extend({
			className: 'upper-cycling-module-title',
			template: _.template($('#topTitleTemplate').html()),
			initialize : function (options) {
            	this.options = options || {};
        	},
			events: {
	            'click a.back-to-activity': 'exit'
	        },
			exit: function (e) {
				e.preventDefault();
				this.options.exitCallback();
			},
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

		topTitleComponent = new TopTitleView({'exitCallback': function () {
			exitCallback();
		}});
		$elementToAppendTo.prepend(topTitleComponent.render().el);

		api = {
			'destroy' : function () {
				topTitleComponent.close();
			},
			'getElement': function () {
				return topTitleComponent.$el;
			}
		};

		return api;
	};


	module.exports = ActivityTopMessage;
});