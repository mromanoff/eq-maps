define(function(require, exports, module){
	"use strict";
	var ActivityAggregates  = function(d, cb) {
		var $dom = $('#activity-app-page-visual'),
			$svg,
			$selected,
			data = [],
			data_max,
			data_min,
			circles = [],
			WIDTH,
			HEIGHT,
			MAX_RADIUS,
			MIN_RADIUS,
			SPACE,
			LEFT_MARGIN = 0,
			on_select_category = cb;

		// First remove empty categories from the original data
		data = _.filter(d, function (item) {
			return item.count > 0;
		})

		data_max = _.max(data, function(d){ return d.count; }).count;
		data_min = _.min(data, function(d){ return d.count; }).count;

		var init = function(){
			utils.get_config();
			render.init();
			render.circles();
			$dom.on('click', '#activity-svg g', events.select_circle);
			$dom.on('mouseenter', '#activity-svg g:not(.selected)', events.mouseenter_circle);
			$dom.on('mouseleave', '#activity-svg g:not(.selected)', events.mouseleave_circle);
		};

		var render = {
			init : function() {
				var template = [
					'<div id="activity-svg-container">',
						'<svg id="activity-svg" width="' + WIDTH + '" height="' + HEIGHT + '">',
					'</div>'
				];
				$dom.append($(template.join('')));
				$svg = $dom.find('#activity-svg-container');
				$svg.scrollLeft(LEFT_MARGIN);
			},
			circles : function() {
				utils.get_circles();
				var offset = utils.get_circles_offset();
				for (var i=0; i < data.length; i++) {
					var category = data[i];
					category.circle.x += offset;
					render.circle(category);
				}
			},
			circle : function(d) {
				var circle = d.circle,
					img_config = utils.get_icon_config(d);
				var svg = document.getElementById("activity-svg");
				var svg_group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
				svg_group.setAttribute("id", d.id);
				svg_group.setAttribute("transform", "translate(" + (circle.x)  + "," + circle.y + ")");
				var svg_circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
				svg_circle.setAttribute("r", circle.radius);
				var svg_image = document.createElementNS("http://www.w3.org/2000/svg", 'image');
				svg_image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img_config.path);
				svg_image.setAttribute("width", img_config.dimension + "px");
				svg_image.setAttribute("height", img_config.dimension + "px");
				svg_image.setAttribute("x", -(img_config.dimension/2) + "px");
				svg_image.setAttribute("y", -(img_config.dimension/1.5) + "px");
				var svg_title = document.createElementNS("http://www.w3.org/2000/svg", 'text');
				svg_title.textContent = d.name + " (" + d.count + ")";
				svg_title.setAttribute("style", "text-anchor: middle;");
				svg_title.setAttribute("dy", (circle.radius / 1.75) + 5 + "px");
				svg_group.appendChild(svg_circle);
				svg_group.appendChild(svg_image);
				svg.appendChild(svg_group);
				if (d.count > 0) {
					svg_group.appendChild(svg_title);
					if (svg_title.getComputedTextLength() > (circle.radius)) {
						svg_title.textContent = "(" + d.count + ")";
					}
				} else {
					svg_image.setAttribute("style", "opacity: 0.4;");
				}
				if (d.count === 0) {
					svg_circle.setAttribute("class", "circle-empty");
					svg_image.setAttribute("y", -(img_config.dimension / 2) + "px");
				}
			}
		};

		var events = {
			mouseenter_circle : function() {
				var id = $(this).attr('id'),
					$circle = $(this).find('circle'),
					d = _.findWhere(data, { 'id' : id });
				if (d.count > 0) {
					utils.animate({
						'duration' : 200,
						'step' : function (val) {
							$circle.attr('r', val);
						},
						'start' : d.circle.radius,
						'end' : d.circle.radius + 10
					});
				}
			},
			mouseleave_circle : function() {
				var id = $(this).attr('id'),
					$circle = $(this).find('circle'),
					d = _.findWhere(data, { 'id' : id });
				if (d.count > 0) {
					utils.animate({
						'duration' : 200,
						'step' : function (val) {
							$circle.attr('r', val);
						},
						'start' : d.circle.radius + 10,
						'end' : d.circle.radius
					});
				}
			},
			select_circle : function() {
				$selected = $(this);
				var id = $selected.attr('id'),
					d = _.findWhere(data, { 'id' : id });
				if (d.count > 0 ) {
					var $circle = $selected.find('circle');
					$selected.attr('class', "selected").find('text, image').fadeOut();
					$selected.siblings().fadeOut();
					$svg.css({ 'overflow-x' : 'hidden' }).animate({ 'scrollLeft' : LEFT_MARGIN });
					var delta_radius = ((HEIGHT - 40 ) / 2) - d.circle.radius,
						delta_x = (WIDTH / 2) - d.circle.x,
						delta_y = (HEIGHT / 2) - d.circle.y;

					var transitionEndCallback = function () {
					    $circle.hide();
					    on_select_category(d.category_id);
					};

					if (d.disableExitTransition) {
					    transitionEndCallback();
					} else {
					    setTimeout(function () {
					        utils.animate({
					            'duration': 500,
					            'step': function (val) {
					                var radius = d.circle.radius + (val * delta_radius),
                                        x_pos = d.circle.x + (val * delta_x),
                                        y_pos = d.circle.y + (val * delta_y);
					                $circle.attr('r', radius);
					                $selected.attr('transform', 'translate(' + x_pos + "," + y_pos + ')');
					            },
					            'start': 0,
					            'end': 1,
					            'callback': transitionEndCallback
					        });
					    }, 300);
					}
				}
			},
			resize : function() {
				utils.get_config();
				circles=[];
				$svg.remove();
				render.init();
				render.circles();
				if ($selected) {
					$svg.find('svg g').hide();
				}
			},
			close_category : function() {
				if ($selected) {
					var id = $selected.attr('id'),
						$circle = $selected.find('circle'),
						d = _.findWhere(data, { 'id' : id });
					var delta_radius = ((HEIGHT - 40 ) / 2) - d.circle.radius,
						delta_x = (WIDTH / 2) - d.circle.x,
						delta_y = (HEIGHT / 2) - d.circle.y;

					$circle.show();
					$svg.removeAttr('style');

					var transitionEndCallback = function () {
					    $selected.attr('class', "selected").find('text, image').fadeIn();
					    $svg.find('svg g').show();
					    $selected = false;
					};

					if (d.disableExitTransition) {
					    transitionEndCallback();
					} else {
					    utils.animate({
					        'duration': 500,
					        'step': function (val) {
					            var radius = d.circle.radius + (val * delta_radius),
                                    x_pos = d.circle.x + (val * delta_x),
                                    y_pos = d.circle.y + (val * delta_y);
					            $circle.attr('r', radius);
					            $selected.attr('transform', 'translate(' + x_pos + "," + y_pos + ')');
					        },
					        'start': 1,
					        'end': 0,
					        'callback': transitionEndCallback
					    });
					}

				} else {
					$svg.find('svg g').show();
				}
				
			},
			force_select : function(id) {
				$selected = $svg.find('svg g[id="' + id + '"]');
				$svg.find('svg g').hide();
			},
			destroy : function() {
				$dom.off('click', '#activity-svg g', events.select_circle);
				$dom.off('mouseenter', '#activity-svg g:not(.selected)', events.mouseenter_circle);
				$dom.off('mouseleave', '#activity-svg g:not(.selected)', events.mouseleave_circle);
			}
		};
		
		var utils = {
			get_config : function() {
				if (window.innerWidth < 768) {
					WIDTH = $(window).width() * 1.5;
					LEFT_MARGIN = (WIDTH - $(window).width()) / 2;
					HEIGHT = 270;
					MAX_RADIUS = 129;
					MIN_RADIUS = 31;
					SPACE = 15;
				} else {
					WIDTH = $(window).width() - 17; // Compensating for scrollbar that appears after render
					LEFT_MARGIN = 0;
					HEIGHT = 400;
					MAX_RADIUS = 194;
					MIN_RADIUS = 41;
					SPACE = 20;
				}
			},
			get_circle_radius : function(val) {
				var value1 = (val - data_min === 0) ? 1 : val - data_min,
					value2 = (data_max - data_min === 0) ? 1 : data_max - data_min;

				return ((value1 / value2) * (MAX_RADIUS - MIN_RADIUS)) + MIN_RADIUS;
			},
			get_circles : function() {
				var radius = 0,
					orig_angle = 180,
					angle = orig_angle,
					center_x = (WIDTH / 2) - 100,
					center_y = (HEIGHT / 2),
					placed = 0;
				for (var i=0; i < data.length; i++) {
					var category = data[i];
					var circle_radius = utils.get_circle_radius(category.count),
						circle_x = 0,
						circle_y = 0;
					radius = 0;
					angle = orig_angle;
					do {
						circle_x = center_x + (Math.sin(angle * Math.PI / 180 ) * radius);
						circle_y = center_y + (Math.cos(angle * Math.PI / 180 ) * radius);
						angle+=10;
						if (angle > (360 + orig_angle)) {
							angle = orig_angle;
							radius+=10;
						}
					} while(!utils.check_circle_placement_fits(circle_x, circle_y, circle_radius) && radius < WIDTH);
					
					if (utils.check_circle_placement_fits(circle_x, circle_y, circle_radius)) {
						center_x = (WIDTH / 2);
						var c = { 'x' : circle_x, 'y' : circle_y, 'radius' : circle_radius };
						circles.push(c);
						category['circle'] = c;
					}
					
				}
				
				if (circles.length !== data.length) {
					MAX_RADIUS -= (MAX_RADIUS * 0.05);
					circles= [];
					utils.get_circles();
				}
				
			},
			check_circle_placement_fits : function(x, y, r) {
				var fits = true;
				if (x - r - 10 < 0 || x + r + 10 > WIDTH) {
					fits = false;
				}
				if (y - r - 10 < 0 || y + r + 10 > HEIGHT) {
					fits = false;
				}
				for (var i=0; i < circles.length; i++) {
					var min_dist = r + circles[i].radius + SPACE;
					var act_dist = utils.get_distance(x, y, circles[i].x, circles[i].y);
					if (min_dist > act_dist) {
						fits = false;
					}
				}
				return fits;
			},
			get_circles_offset : function() {
				var max_x = WIDTH / 2,
					min_x = WIDTH / 2;
				for (var i=0; i < circles.length; i++) {
					if (circles[i].x - circles[i].radius < min_x) {
						min_x = circles[i].x - circles[i].radius;
					}
					if (circles[i].x + circles[i].radius > max_x) {
						max_x = circles[i].x + circles[i].radius;
					}
				}
				var draw_width = max_x - min_x;
				
				return ((WIDTH - draw_width) / 2) - min_x;
			},
			get_icon_config : function(d) {
				var empty_path = "/assets/images/activity/icons/empty_white.png",
					path = empty_path,
					dimension = Math.min(d.circle.radius * 1.15, 200);
				if (d.count > 0) {
					path = d.teal_icon;
					empty_path = "/assets/images/activity/icons/empty_teal.png";
				} else {
					path = d.white_icon;
				}
				if (!path) path = empty_path;
				
				return {
					"path": path,
					"dimension": dimension
				};
			}
		};
		$.extend(utils, require('components/utils'));
		init();
		var api = {
			"resize" : events.resize,
			"destroy" : events.destroy,
			"force_select" : events.force_select,
			"close_category" : events.close_category
		};
		return api;
	};
	
	module.exports = ActivityAggregates;
	
});