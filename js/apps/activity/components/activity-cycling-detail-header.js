define(function(require, exports, module){
    "use strict";
    var ActivityCyclingDetailHeader = function($elementToAppendTo, componentData, cb) {
		var ActivityCyclingDetailHeaderView,
			headerModel,
			detailHeaderComponent,
			api;

		/**
	    * Views
	    */

		ActivityCyclingDetailHeaderView = Backbone.View.extend({
			className: 'detail-header',
			template: _.template($('#cyclingDetailHeaderTemplate').html()),
			events: {
				'click .icon-left-arrow': 'goBack',
			},
			render: function () {
				this.$el.html(this.template(this.model.toJSON()));
            	return this;
			},
			close: function () {
				this.remove();
			    delete this.$el;
			    delete this.el;
			},
			goBack: function (e) {
				e.preventDefault();
				cb();
			}
		});

		/**
	    * Render module and return public interface
	    */

		headerModel = new Backbone.Model(componentData);
		detailHeaderComponent = new ActivityCyclingDetailHeaderView({model: headerModel});
		
		$elementToAppendTo.prepend(detailHeaderComponent.render().el);

		api = {
			'destroy' : function () {
				detailHeaderComponent.close();
			},
			'getElement': function () {
				return detailHeaderComponent.$el;
			}
		};

		return api;
	};


	module.exports = ActivityCyclingDetailHeader;
});