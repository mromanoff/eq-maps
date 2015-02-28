define(function(require, exports, module) {
	"use strict";
	var ActivityList = function(m, ccb, cbexit) {
		var $dom,
			$list,
			$closeIcon,
			data,
			generalData,
			period,
			title,
			listOptions,
			remainingSingleListSessions,
            lastDayShown,
			paginationSingleList,
			metric = m || '',
            closeCallback = ccb || null,
			exitCallback = cbexit || null,
			color_id,
			measureSystem,
			initiated = false;

		var init = function() {
			$dom = $('#activity-app-page-list');
			render.init();
		};
		
		var render = {
			init : function() {
				events.show();
				var template = [
					'<div class="list-top-arrow"></div>',
					'<div class="list-title-container">',
                    '<h3 class="list-title"></h3>',
                    '<a href="#" class="icon-close-slim"></a>',
                    '</div>',
					'<div class="energy-summary hidden"></div>',
					'<h4 class="list-sub-title"></h4>',
					'<div class="list-container single-list clearfix">',
						'<div class="list-timeline"></div>',
						'<div class="list-items"></div>',
						'<a href="#" class="load-more-sessions hidden">Load more</a>',
					'</div>',
					'<div class="months-container"></div>',
				];
				$dom.append(template.join(''));
				$list = $dom.find('.list-items');
				$dom.show();

				render.bindEvents();
			},
			bindEvents : function () {
                $dom.find('.list-title-container .icon-close-slim').click( function (e) {
                    e.preventDefault();
                    exitCallback && exitCallback();
                });

				$dom.find('.close-list').click( function () {
					events.hide();
					closeCallback && closeCallback();
				});

				$dom.find('.load-more-sessions').click( function (e) {
					e.preventDefault();
					render.get_more_sessions();
				});
			},
			list_item : function(d, i, $listContainer) {
				var color = d.primary_color,
					referenceDate = '';

				if (d.startMoment) {
					referenceDate = d.startMoment.date();
				}

				if (color_id == "SUB") color = d.secondary_color;
				var template = [
					'<div class="list-item ' + listOptions.type + '" data-day="' + referenceDate + '">',
						'<div class="list-item-date">',
							'<div class="list-item-date-circle" style="background-color:' + color +'"></div>',
						'</div>',
						(d.id === 'undefined' || d.id==undefined) ? '' : '<a href="' + (d.eventType === 'Custom' || d.eventType === 'OCR' ? '/activity/workout/add-custom/' : '/activity/workouts/') + d.id + '">',
							'<div class="list-item-info" data-id="' + d.id + '">',
								'<div class="list-item-info-values' + ((d.totalEnergy > 0) ? ' with-calories' : '') + '">',
									render.list_item_values.init(d, (i%2===0)),
								'</div>',
							'</div>',
						(d.id === 'undefined' || d.id == undefined) ? '' : '</a>',
					'</div>'
				];
				var $list_item = $(template.join(''));
				$listContainer.append($list_item);

				// 9/2/2014 leandro.palacios I disabled this method because I think it is no longer neccesary according
				// to the latest visuals

				/*if (window.innerWidth >= 768 && !listOptions.month_navigation) {
					utils.format_list_item_values($list_item.find('.list-item-info-values'));
				}*/
				
				if (listOptions.item_callback && (d.eventType === 'GroupFitness' || d.eventType === 'PersonalTraining' || d.eventType === 'Custom' || d.eventType === 'OCR')) {
					$list_item.find('.list-item-info')
						.addClass('link-to-detail')
				}
			},
			list_item_values: {
				init : function(d, is_even) {
					var values;

					switch (listOptions.type) {
						case 'default':
							values = ["name", "instructor", "metrics", "location"];
						break;
						case 'checkin':
							values = ["date", "checkedTitle", "classTime", "location"];
						break;
						case 'weight':
							values = ["date", "weightValue", "classTime"];
						break;
						default:
							if(d.eventType === 'PersonalTraining' || d.eventType === 'GroupFitness'){
								values = ["date", "name", "instructor", "classTime", "location", "distance", "energy"];
							}else{
								values = ["date", "name", "instructor", "classDuration", "distanceInline", "energy"];
							}
						break;
					}

					if (is_even && window.innerWidth >= 768 && listOptions.type === 'default') {
						values.reverse();
					}
					var ret = '';
					for (var i=0; i < values.length; i++) {
						ret += render.list_item_values[values[i]](d);
					}
					return ret;
				},
				name : function(d) {
					if (d.name === "") {
						return '';
					}
					return '<span class="list-item-info-name">' + d.name + '</span>';
				},
				instructor : function(d) {
					if (!d.instructor) {
						return '';
					}

					return '<span class="list-item-info-instructor">' + d.instructor + '</span>';
				},
				metrics : function(d) {
					var metrics = [];
					if (d.distance > 0) {
						var unit = (!measureSystem || measureSystem === 'Imperial') ? 'MI' : 'KM';
						metrics.push(EQ.Helpers.convertDistance(d.distance, metric || 'MI', measureSystem) + " " + unit.toUpperCase());
					}
					if (d.calories > 0)  {
						metrics.push(d.calories + " CAL");
					}
					if (metrics.length === 0) {
						return '';
					}
					return '<span class="list-item-info-metrics">' + metrics.join(', ') + '</span>';
				},
				location : function(d) {
					if (d.location === "") {
						return '';
					}
					return '<span class="list-item-info-location">' + d.location + '</span>';
				},
				classTime: function (d) {
					if (d.startDate === "" || d.endDate === "") {
						return '';
					}
					return '<span class="list-item-info-classtime">' + EQ.Helpers.dateTime.getTimeRange(d.startDate, d.endDate) + '</span>';
				},
				distance: function (d) {
					if (!d.totalDistance) {
						return '';
					}
					var unit = (!measureSystem || measureSystem === 'Imperial') ? 'MI' : 'KM';
					return '<span class="list-item-info-metrics distance">' + EQ.Helpers.numbers.trimDecimals(EQ.Helpers.convertDistance(d.totalDistance, d.distanceUnit || 'MI', measureSystem)) + ' ' + unit + '</span>';
				},
				distanceInline: function (d) {
					if (!d.totalDistance) {
						return '';
					}
					var unit = (!measureSystem || measureSystem === 'Imperial') ? 'MI' : 'KM';
					return '<span class="list-item-info-metrics distance same-line">' + EQ.Helpers.numbers.trimDecimals(EQ.Helpers.convertDistance(d.totalDistance, d.distanceUnit || 'MI', measureSystem)) + ' ' + unit + '</span>';
				},
				date: function (d) {
					var momentDate,
						dateToShow;

					if (d.startDate) {
						momentDate = moment(d.startDate);
					} else {
						return '';
					}

					if (moment(momentDate.format('YYYY-MM-DD')).isSame(moment().format('YYYY-MM-DD'))) {
						dateToShow = 'Today';
					} else {
						dateToShow = momentDate.format('MMM') + ' ' + momentDate.format('D');
					}

					return '<span class="list-item-info-date">' + dateToShow + '</span>';
				},
				energy: function (d) {
					if (!d.totalEnergy) {
						return '';
					}
					return '<span class="list-item-info-energy"><strong>' + parseInt(d.totalEnergy) + '</strong>CAL</span>';
				},
				checkedTitle: function () {
					var titleCheckIn = 'Checked in';
					return '<span class="list-item-info-name">' + titleCheckIn + '</span>';
				},
				weightValue: function (d) {
					if (!d.weightValue) {
						return '';
					}
					return '<span class="list-item-info-name">' + EQ.Helpers.convertLBStoKGS(d.weightValue, d.weightUnit) + ' ' + d.weightUnit + '</span>';
				},
				classDuration: function (d) {
					if (d.startDate === "" || d.endDate === "") {
						return '';
					}

					var startDateMoment = moment(d.startDate),
						endDateMoment = moment(d.endDate),
						minutes = endDateMoment.diff(startDateMoment, 'minutes'),
						hours = 0,
						remainingMinutes = 0,
						timeString;

					if (minutes < 60) {
						timeString = minutes + ' MIN';
					} else {
						hours = parseInt(minutes / 60, 10);
						remainingMinutes = minutes % 60;
						timeString = remainingMinutes ? hours + ' HR ' + remainingMinutes + ' MIN' : hours + ' HR';
					}

					return '<span class="list-item-info-classtime">' + timeString + '</span>';
				}
			},
			set_titles : function() {
				var $energySummary = $dom.find('.energy-summary'),
					$subTitle = $dom.find('h4'),
					$listContainer = $dom.find('.list-container.single-list');

				$dom.find('h3').text(utils.get_list_title());

				if (listOptions.month_navigation) {
					$energySummary.removeClass('hidden');
					$energySummary.find('strong.energy').text(EQ.Helpers.numbers.trimDecimals(generalData.averageEnergy) + ' Watts');
					$energySummary.find('strong.distance').text(EQ.Helpers.numbers.trimDecimals(generalData.averageDistance) + ' ' + generalData.distanceUnit);

					$subTitle.addClass('hidden');
					$listContainer.addClass('hidden');
				} else {
					$energySummary.addClass('hidden');
					if (data.length > 0) {
						$subTitle.text(utils.get_period_title())
							.removeClass('hidden');
						$listContainer.removeClass('hidden');
					}
				}
			},
			add_month_navigation: function (monthData) {
				_.each(monthData, function (sessionGroupedByMonth) {
					new MonthSessions($dom.find('.months-container'), { 
						monthSessions: sessionGroupedByMonth.sessions,
						monthName: sessionGroupedByMonth.monthName,
						pagination: 5
					});
				});
			},
			remove_month_navigation: function () {
				$dom.find('.months-container').empty();
			},
			showHideAddMore: function () {
				var $getMoreSessions = $dom.find('.load-more-sessions');

				if (remainingSingleListSessions.length > 0) {
					$getMoreSessions.removeClass('hidden');
				} else {
					$getMoreSessions.addClass('hidden');
				}
			},
			get_more_sessions: function () {
				var sessionsToLoad = _.clone(remainingSingleListSessions),
					limit = Math.min(sessionsToLoad.length, paginationSingleList);

				for (var i=0; i < limit; i++) {
				    render.list_item(sessionsToLoad[i], i, $list);
				    if (sessionsToLoad[i].startMoment) {
				    	lastDayShown = sessionsToLoad[i].startMoment.date();
				    }
				    
				}
				remainingSingleListSessions.splice(0, limit);

				this.showHideAddMore();
			}
		};

		// Month object

		var MonthSessions = function ($container, options) {
			this.init($container, options);
		};

		MonthSessions.prototype = {
			init: function ($container, options) {
				var monthNameParts,
					year,
					month,
					momentDate,
					monthTemplate,
					numberOfSessions,
					monthSessions = options.monthSessions,
					monthName = options.monthName,
					yearToShow = '',
					$monthToInsert,
					currentDate = moment(),
					currentMonth = parseInt(currentDate.format('M'), 10),
					currentYear = parseInt(currentDate.format('YYYY'), 10);

				// add sessions to the instance
				this.monthSessions = monthSessions;
				this.remainingSessions = _.clone(this.monthSessions);
				this.pagination = options.pagination;

				monthNameParts = monthName.split('-');
				month = monthNameParts[0];
				year = monthNameParts[1];
				momentDate = moment(month + '-1-' + year, 'MM-DD-YYYY');

				// Check if it is neccesary to show the year
				if (currentYear !== parseInt(year, 10)) {
					yearToShow = ' ' + year;
				}

				monthTemplate = '<div class="month-container">' +
					'<div class="month navigation"><span>' + momentDate.format('MMMM') + yearToShow + '</span></div>' +
					'<div class="list-container">' +
						'<div class="list-timeline"></div>' +
						'<div class="month_list list-items"></div>' +
					'</div>' +
					'<div class="get-more hidden">Load more</div>' +
				'</div>';

				this.$monthToInsert = $(monthTemplate);
				$container.append(this.$monthToInsert);

				// Check if this is the current month
				if (currentMonth === parseInt(month, 10) && currentYear === parseInt(year, 10)) {
					this.$monthToInsert.addClass('expanded');
				}

				this.showHideAddMore();
				this.bindMonthContainerEvents();
				this.getMoreMonths();
			},
			bindMonthContainerEvents: function () {
				var self = this;
				// Click event to expand and collapse month
				this.$monthToInsert.find('.month.navigation').click( function () {
					var $monthContainer = $(this).parent('.month-container'),
						$allMonths = $monthContainer.siblings();

					if (!$monthContainer.hasClass('expanded')) {
						$allMonths.removeClass('expanded');

						setTimeout(function () {
							$monthContainer.addClass('expanded');
						}, 1000);
					}
				});

				// Click event to load more 
				this.$monthToInsert.find('.get-more').click( function () {
					self.getMoreMonths();
				});
			},
			showHideAddMore: function () {
				var $getMore = this.$monthToInsert.find('.get-more');
				if (this.remainingSessions.length > 0) {
					$getMore.removeClass('hidden');
				} else {
					$getMore.addClass('hidden');
				}
			},
			getMoreMonths: function () {
				var sessionsToLoad = _.clone(this.remainingSessions),
					limit = (sessionsToLoad.length > this.pagination) ? this.pagination : sessionsToLoad.length;

				for (var i=0; i < limit; i++) {
					render.list_item(sessionsToLoad[i], i, this.$monthToInsert.find('.month_list'));
					this.remainingSessions.splice(0, 1);
				}

				this.showHideAddMore();
			}
		}

		var events = {
		    goToDay: function (d) {
		        while (lastDayShown > parseInt(d)) {
		            render.get_more_sessions();
		        }
		        var targetScroll = $('[data-day=' + d + ']', $dom).eq(0).offset().top;
		        $("html, body").animate({ scrollTop: targetScroll - $('nav.main').height() });
		    },
			update_data : function(d, p, t, c, lo, showClose) {

				var xhrClassCategoryInfo = EQ.Helpers.getService('/v2.6/me/profile/unitofmeasure');

				EQ.Helpers.when(xhrClassCategoryInfo).done( function ( response ) {
					measureSystem = response[0].unitOfMeasure;

					var defaultOptions = {
						type: 'default',
						month_navigation: false,
						item_callback: null,
					close_button: false
					}
					listOptions = lo ? _.extend(defaultOptions, lo) : defaultOptions;

					// For month navigation, the data param is going to have also other general info
					if (listOptions.month_navigation) {
						data = d.sessionsData;
						generalData = d.generalData
					} else {
						data = d;
					}
					period = p;
					title = t;
					color_id = c;
					$closeIcon = $dom.find('.close-list');

	                showClose = showClose || false;

	                if (showClose === true) {
	                    $dom.find('.list-title-container .icon-close-slim').show();
	                } else {
	                    $dom.find('.list-title-container .icon-close-slim').hide();
	                }

					// First clear old data
					render.remove_month_navigation();
					$list.empty();

				listOptions.close_button ? $closeIcon.removeClass('hidden') : $closeIcon.addClass('hidden');

				if (listOptions.month_navigation) {
					$dom.addClass('with-month-navigation');
					$closeIcon.removeClass('hidden');
					utils.parse_month_data();
				} else {
					$dom.removeClass('with-month-navigation');
					$closeIcon.addClass('hidden');

						// First order data items by date
	                    data.sort(function(a, b){
	                        var startDateFirst = moment(a.startDate),
	                            startDateSecond = moment(b.startDate);

	                        if (!(startDateFirst.isBefore(startDateSecond))) {
	                            return -1;
	                        }

	                        if (startDateFirst.isBefore(startDateSecond)) {
	                            return 1;
	                        }

	                        return 0;
	                    });

						remainingSingleListSessions = _.clone(data);
						paginationSingleList = 5;

						render.get_more_sessions();
					}

					render.set_titles();
				});
			},
			resize : function() {
				/*if (!listOptions.month_navigation) {
					$list.empty();
					utils.parse_data();
				}*/
			},
			hide: function () {
				$dom.hide();
			},
			show: function () {
				$dom.show();
			},
			close: function () {
				$dom.empty();
				events.hide();
			}
		};
		
		var utils = {
			parse_data : function() {
				for (var i=0; i < data.length; i++) {
					render.list_item(data[i], i, $list);
				}
			},
			parse_month_data: function () {
				var monthData = [],
					startDateMoment,
					monthName,
					startMonth,
					startYear;

				// Group sessions by month

				_.each(data, function (session) {
					var sessionGroupedByMonth = null;

					// Check session localdate and extract current month and year
					startDateMoment = moment(session.startDate);
					startMonth = startDateMoment.format('MM')
					startYear = startDateMoment.format('YYYY')
					monthName = startMonth + '-' + startYear;

					// adapt data to match template
					session.name = session.className;
					session.location = session.location || session.facilityName;

					// add category color
					session.primary_color = generalData.color;
					session.secondary_color = generalData.color;

					// Check if the month exist , if exists add the sessions to that month
					sessionGroupedByMonth = _.find(monthData, { 'monthName' : monthName });

					if (!sessionGroupedByMonth) {
						// Create new registry for that month to start adding sessions
						sessionGroupedByMonth = {
							monthName: monthName,
							month: parseInt(startMonth, 10),
							year: parseInt(startYear, 10),
							sessions: []
						}
						monthData.push(sessionGroupedByMonth)
					}

					sessionGroupedByMonth.sessions.push(session);
				});

				// order months from recent to older
				monthData.sort(function(a, b){
					if (a.year > b.year || (a.year === b.year && a.month > b.month)) {
						return -1;
					}

					if (a.year < b.year || (a.year === b.year && a.month < b.month)) {
						return 1;
					}

					return 0;
				});

				// order sessions inside each month
				_.each(monthData, function (groupedMonth) {
					groupedMonth.sessions.sort(function(a, b){
						var startDateFirst = moment(a.startDate),
							startDateSecond = moment(b.startDate);

						if (!(startDateFirst.isBefore(startDateSecond))) {
							return -1;
						}

						if (startDateFirst.isBefore(startDateSecond)) {
							return 1;
						}

						return 0;
					});
				});

				render.add_month_navigation(monthData);
			},
			get_list_title : function() {
				return title;
			},
			get_period_title : function() {
				var periodMoment = moment(data[0].startDate);
				if (period === "MONTH" || period === "month") {
					return periodMoment.format('MMM');
				}
				return periodMoment.format('YYYY');
			},
			format_list_item_values : function($par) {
				var $els = $par.find('span'),
					$name = $par.find('.list-item-info-name'),
					$li = $par.parent().parent(),
					max_width = (($li.width() * .85) - 40) / 2;
				if ($name.height() > 20 || $name.width() > max_width) {
					$par.prepend($name);
					$name.after('<br/>');
				}
				$els.each(function() {
					if($(this).height() > 20 && !$(this).hasClass('list-item-info-name')) {
						$(this).before('<br/>');
					}
				})
			}
		};
		
		init();
		var api = {
			'init' : init,
			'update_data' : events.update_data,
			'resize' : events.resize,
			'destroy': events.close,
			'hide' : events.hide,
			'show': events.show,
			'goToDay': events.goToDay
		};
		return api;
	};
	
	module.exports = ActivityList;
});
