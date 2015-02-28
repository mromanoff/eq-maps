define(function(require, exports, module){
	"use strict";
	var ActivityAppNav = function( $elementToAppendTo ) {

		var ActivityAppNavView,
			ActivityAppNavComponent,
			$links,
			api;



		ActivityAppNavView = Backbone.View.extend({
			className: 'topNavigation',
			template: _.template($('#activityAppNav').html()),
			render: function () {
				this.$el.html(this.template());
            	return this;
			},
			close: function () {
				this.remove();
			    delete this.$el;
			    delete this.el;
			},
			setSelected : function ( page_type ) {
				$links
					.removeClass('selected')
					.filter('[data-page="' + page_type + '"]').addClass('selected');				
			},
			setDate: function (date, type) {
			    date = typeof (date) === 'string'
                    ? date
                    : date.format('YYYY') + (type == 'month' ? '/' + date.format('M') : '');

			    $links.attr('href', function () {
				    return '#' + $(this).data('page') + '/' + date;
				});
			}
		});

		/**
	    * Render module and return public interface
	    */
		ActivityAppNavComponent = new ActivityAppNavView();
		$elementToAppendTo.append(ActivityAppNavComponent.render().el);
		$links = ActivityAppNavComponent.$el.find('a');
		api = {
			'getElement': function () {
				return ActivityAppNavComponent.$el;
			},
			'destroy' : ActivityAppNavComponent.close,
			'setSelected' : ActivityAppNavComponent.setSelected,
			'setDate' : ActivityAppNavComponent.setDate
		};

		return api;
	};

	module.exports = ActivityAppNav;
});