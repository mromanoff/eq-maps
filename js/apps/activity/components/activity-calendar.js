define(function(require, exports, module){
	"use strict";

	var ActivityCalendar = function( $elementToAppendTo, data, monthFirst, selectionCallback ) {

		var ActivityCalendarView,
			componentData,
			ActivityCalendarComponent,
			api;
		
		/**
	    * Views
	    */
		ActivityCalendarView = Backbone.View.extend({
			tagName: 'section',
			className: 'checkins-calendar',
			template: _.template($('#activityCalendar').html()),
			render: function () {
			    this.$el.html(this.template());
			    if (data.length > 0) {
					this.addListeners();
				} else {
					this.renderEmpty();
				}
				this.renderMonth(data.length > 0 ? false : true);
            	return this;
			},
			close: function () {
				this.remove();
			    delete this.$el;
			    delete this.el;
			},
			addListeners: function () {
			    if (selectionCallback) {
			        $(this.$el).on('click', '.activity-day', function () {
			            selectionCallback($(this).attr('data-day'));
			        });
			    }
			},
			renderMonth: function (renderEmpty) {

			    var daysWActivity = [];
			    for (var i = 0; i < data.length; i++) {
			        daysWActivity.push(data[i].startMoment.date());
			    }

			    var today = new Date();
			    var todayIndex = (today.getFullYear() == monthFirst.year() && today.getMonth() == monthFirst.month()) ? today.getDate() : -1;

			    var numWeeks = Math.ceil((offset + monthFirst.daysInMonth()) / 7);
			    $('tr:gt(' + numWeeks + ')', this.$el).remove();

			    var offset = monthFirst.day() - 1;
			    var $days = $('tr:not(.header) td', this.$el);

			    for (var i = 1; i <= monthFirst.daysInMonth() ; i++) {
			        $days.eq(offset + i).children()
                        .attr('data-day', i)
                        .toggleClass('activity-day', daysWActivity.indexOf(i) >= 0)
                        .toggleClass('current-day', todayIndex == i && !renderEmpty)
                        .children().html(i);
			    }

			    this.calculateDetails();
			},
			calculateDetails: function () {
				var totalCheckins = data.length,
					weekAvg = Math.floor(totalCheckins/4);

				this.updateDetails(totalCheckins, weekAvg);
			},
			updateDetails: function (total, weekAvg) {
				var $totalCheckins = this.$el.find('.activity-graphic-details .totalCheckins'),
					$avgWeekCheckins = this.$el.find('.activity-graphic-details .avgWeekCheckins');

				$totalCheckins.text(total);
				$avgWeekCheckins.text(weekAvg);
			},
			renderEmpty: function () {
				this.$el.find('.overlay').removeClass('hidden');
				this.$el.find('.overlay-inner').removeClass('hidden');
				this.$el.find('.activity-graphic-details').addClass('hidden');
				this.$el.find('.overlay-wrapper span.currentMonthName').text(monthFirst.format('MMMM'));
			}
		});

		/**
	    * Render module and return public interface
	    */
		ActivityCalendarComponent = new ActivityCalendarView();
		$elementToAppendTo.prepend(ActivityCalendarComponent.render().el);

		api = {
			'destroy' : function () {
				ActivityCalendarComponent && ActivityCalendarComponent.close();
				ActivityCalendarComponent = null;
			},
			'getElement': function () {
				return ActivityCalendarComponent.$el;
			}
		};

		return api;
	};

	module.exports = ActivityCalendar;
});