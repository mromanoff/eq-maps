define( function(require, exports, module) {
	"use strict";
	var BarChart = function(d, t, s) {
		var $dom = $('#activity-app-page-visual'),
			$bars,
			$tooltip,
			data = d.activities,
			totals = d.totals,
			metric = d.metric,
			start_date = s,
			type = t,
			bar_data = [],
			bars = [],
			has_tooltip,
			axis_divisions,
			max_value = 0,
			max_graph_value = 1,
			graph_height;
		var init = function() {
			utils.get_graph_config();
			utils.get_bar_data();
			utils.get_max_value();
			render.init();
			$bars.on('mouseenter', '.activity-bar-chart-bar-activities', events.mouse_over_bar);
			$bars.on('mouseleave', '.activity-bar-chart-bar-activities', events.mouse_out_bar);
		};
		
		var render = {
			init : function() {
				var label = '',
					metric_label = '',
					val = 0;
				if (type == "DISTANCE") {
					label = 'total<br/>distance:';
					metric_label = metric.toUpperCase();
					val = utils.get_precision(totals.distance, 2);
				}
				if (type == "CALORIES") {
					label = 'total<br/>calories:';
					metric_label = 'CAL';
					val = utils.get_precision(totals.calories, 2);
				}
				var template = [
					'<div class="activity-bar-chart-info">',
						'<div class="activity-bar-chart-total">',
							'<span class="activity-bar-chart-total-label">' + label + '</span>',
							'<span class="activity-bar-chart-total-value">' + val + '</span>',
							'<span class="activity-bar-chart-total-metric">' + metric_label + '</span>',
						'</div>',
						'<ul class="activity-bar-chart-key">',
							'<li class="activity-bar-chart-key-item">',
								'<span class="activity-bar-chart-key-item-color machine"></span> Machine',
							'</li>',
							'<li class="activity-bar-chart-key-item">',
								'<span class="activity-bar-chart-key-item-color app"></span> Connected App',
							'</li>',
						'</ul>',
					'</div>',
					'<div class="activity-bar-chart">',
						'<div class="activity-bar-chart-tooltip">',
							'<div class="activity-bar-chart-tooltip-values"></div>',
							'<div class="activity-bar-chart-tooltip-arrow"></div>',
							'<div class="activity-bar-chart-tooltip-dot"></div>',
						'</div>',
						'<ul class="activity-bar-chart-axis"></ul>',
						'<div class="activity-bar-chart-bars"></div>',
						/*'<div class="activity-bar-chart-best">',
							'<div class="activity-bar-chart-best-value">',
								'<span class="activity-bar-chart-best-label">daily best: </span>',
								'<span class="activity-bar-chart-best-amount"></span>',
							'</div>',
						'</div>',*/
					'</div>'
				];
				$dom.append(template.join(''));
				$bars = $dom.find('.activity-bar-chart-bars');
				$tooltip = $dom.find('.activity-bar-chart-tooltip');
				if (data.length > 0) {
					render.axis();
					render.bars();
					//render.best();
				} else {
					$dom.find('.activity-bar-chart').hide();
				}
				
			},
			axis : function() {
				var $axis = $dom.find('.activity-bar-chart-axis').empty(),
					division_val = (max_graph_value / axis_divisions);
				for (var i=0; i < axis_divisions + 1; i++) {
					var nice_val = (division_val*i);
					if (nice_val < 10) {
						nice_val = "0" + nice_val;
					}
					var template = '<li class="activity-bar-chart-axis-label"><span class="activity-bar-chart-axis-label-value">' + nice_val + '</span></li>';
					$axis.prepend(template);
				}
			},
			bars : function() {
				for (var i=0; i < bar_data.length; i++) {
					var b = new Bar(bar_data[i], $bars, i, type, max_graph_value, graph_height);
					bars.push(b);
				}
			},
			best : function() {
				var best_val = 19.5;
				var $best = $dom.find('.activity-bar-chart-best'),
					y_pos = ((max_graph_value - best_val) / max_graph_value) * graph_height;
				$best.css('top', y_pos);
				$best.find('.activity-bar-chart-best-amount').text(best_val + " KM");
			},
			tooltip_activities : function(d) {
				var tooltip_data = d,
					$values = $tooltip.find('.activity-bar-chart-tooltip-values');
				$values.empty();
				for (var i=0; i < tooltip_data.activities.length; i++) {
					var template = [
						'<div class="activity-bar-chart-tooltip-value">',
							'<span class="activity-bar-chart-tooltip-value-name">' + tooltip_data.activities[i].name + '</span>',
							'<span>' + utils.get_formatted_value(tooltip_data.activities[i]) + '</span>',
						'</div>',
					];
					$values.append(template.join(''));
				}
			}
		};
		
		var events = {
			mouse_over_bar : function() {
				var $parent = $(this).parent(),
					bar_id = $parent.data('bar_id');
				if (bar_data[bar_id].total > 0 && has_tooltip) {
					render.tooltip_activities(bar_data[bar_id]);
					var ypos = $(this).height() + 25,
						xpos = $parent.position().left + ($(this).width()/ 2) - 2;
					$tooltip.css({ 'bottom' : ypos, 'left' : xpos }).show();
				}
			},
			mouse_out_bar : function() {
				$tooltip.hide();
			},
			resize : function() {
				utils.get_graph_config();
				utils.get_max_value();
				$bars.empty();
				render.axis();
				render.bars();
				render.best();
			},
			destroy : function() {
				$bars.off('mouseenter', '.activity-bar-chart-bar-activities', events.mouse_over_bar);
				$bars.off('mouseleave', '.activity-bar-chart-bar-activities', events.mouse_out_bar);
			}
		};
		
		var utils = {
			get_graph_config : function() {
				if (window.innerWidth < 768) {
					axis_divisions = 4;
					graph_height = 160;
					has_tooltip = false;
				} else {
					axis_divisions = 5;
					graph_height = 225;
					has_tooltip = true;
				}
			},
			get_bar_data : function() {
				var end_of_month = start_date.clone().endOf('month').startOf('day'),
					curr_day = start_date.clone(),
					counter = 0;
				while(!curr_day.isAfter(end_of_month)) {
					var day_bar_data = {
						"date" : curr_day.clone(),
						"activities" : [],
						"total" : 0
					};
					for (var i=counter; i < data.length && (data[i].date.clone().startOf('day').isSame(curr_day)); i++) {
						day_bar_data.activities.push(data[i]);
						if (type == "DISTANCE") {
							day_bar_data.total += data[i].distance;
						}
						if (type == "CALORIES") {
							day_bar_data.total += data[i].calories;
						}
						counter++;
					}
					curr_day.add('d', 1);
					bar_data.push(day_bar_data);
				}
			},
			get_max_value : function() {
				max_value = _.max(bar_data, function(d) {
					return d.total;
				});
				max_value = max_value.total;
				var division = Math.ceil(max_value / axis_divisions);
				max_graph_value = ( division * axis_divisions);
			},
			get_formatted_value : function(d) {
				var ret = '';
				if (type == "DISTANCE") {
					ret = utils.get_precision(d.distance, 2) + " " + metric.toUpperCase();
				} else if (type == "CALORIES") {
					ret = utils.get_precision(d.calories, 2) + " CAL";
				}
				return ret;
			}
		};
		
		$.extend(utils, require('components/utils'));
		
		init();
		var api = {
			"resize" : events.resize,
			"destroy" : events.destroy
		};
		return api;
	};
	
	var Bar = function(d, $c, i, t, m, gh) {
		var data = d,
			$container = $c,
			id = i,
			type = t,
			graph_max_value = m,
			graph_height = gh,
			max = data['total'],
			bar_height = Math.max((max / graph_max_value) * graph_height, 20),
			is_today = false,
			is_monday = false,
			$bar,
			$activities;
			
		var init = function() {
			if (data.date.isSame(moment().startOf('day'))) {
				is_today = true;
			}
			if (data.date.day() == 0) {
				is_monday = true;
			}
			render.bar();
		};
		
		var render = {
			bar : function() {
				var template = '<div class="activity-bar-chart-bar" data-bar_id="' + id + '"></div>';
				$bar = $(template);
				$container.append($bar);
				render.label();
				render.activities();
			},
			label : function() {
				var label = data.date.format('DD'),
					class_name = "activity-bar-chart-bar-label";
				if (is_today)  {
					label += '<span class="activity-bar-chart-bar-label-today">today</span>';
					class_name += ' highlight-today';
				}
				if (is_monday) {
					class_name += ' highlight-monday';
				}
				var template = '<div class="' + class_name + '">' + label + '</div>';
				$bar.append(template);
			},
			activities : function() {
				var template = '<div class="activity-bar-chart-bar-activities"></div>';
				$bar.prepend(template);
				$activities = $bar.find('.activity-bar-chart-bar-activities');
				$activities.css({ 'height' : bar_height, 'margin-top' : graph_height - bar_height });
				for (var i=0; i < data.activities.length; i++) {
					render.activity(data.activities[i]);
				}
			},
			activity : function(act) {
				var act_value = 0;
				if (type == "DISTANCE") {
					act_value = act.distance;
				} else if (type == "CALORIES") {
					act_value = act.calories;
				}
				var	act_height = (act_value / max) * bar_height,
					act_class = (act.device === 'MACHINE') ? 'activity-bar-chart-bar-activity' : 'activity-bar-chart-bar-activity app',
					$act = $('<div>');
				$act.addClass(act_class);
				$act.height(act_height);
				$activities.append($act);
			}
		};
		init();
	};
	
	module.exports = BarChart;
});