define(function(require, exports, module){
    "use strict";
    var ActivityTopMessage = function($elementToAppendTo) {
		var url = APIEndpoint.replace('v1', 'v3') + '/me/activity/cycling/notification',
			TopMessageView,
			messageModel,
			topMessageComponent,
			api,
			data;

		/**
	    * Views
	    */

		TopMessageView = Backbone.View.extend({
			template: _.template($('#topMessageTemplate').html()),
			className: 'upper-cycling-module-message',
			initialize : function (options) {
            	this.options = options || {};
        	},
			events: {
	            'click a.close': 'closeMessage'
	        },
			closeMessage: function (e) {
				e.preventDefault();
				this.$el.find('.color-button-box').addClass('hidden');
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
		
/*		$.ajax({
			type: 'GET',
			url: url,
			contentType: 'application/json',
			xhrFields: { 'withCredentials': true },
			dataType: 'json',
			success: function (data) {*/
				data = {
					headline: "DON'T STOP PUMPING",
					message: "It's been a while since you challenged yourself. Book a class and get back on that horse.",
					direction: "down"
				};
				messageModel = new Backbone.Model(data);
				topMessageComponent = new TopMessageView({model: messageModel});
				$elementToAppendTo.prepend(topMessageComponent.render().el);
/*			},
			error: function (d) {
				Backbone.Events.trigger('activityLoader:error');
			}
		});*/

		api = {
			'destroy' : function () {
				topMessageComponent.close();
			},
			'getElement': function () {
				return topMessageComponent.$el;
			}
		};

		return api;
	};


	module.exports = ActivityTopMessage;
});