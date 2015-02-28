define(function(require, exports, module){
	"use strict";
	var ActivityDetail = function(d, cb, eo) {
		var $dom = $('#activity-app-page-visual'),
			$canvas,
			$labels,
			$info,
			ctx,
			data = d,
            graph_source = [],
			graph_data = [],
			classes = [],
			start_radian = -(Math.PI / 2),
			highlight_id = false,
			selected_id = false,
			animating_segment = false,
			HEIGHT,
			WIDTH,
			RADIUS,
			on_select_segment = cb,
			extra_options = eo || {};
		
		var SEGMENT_COLORS = [
                "rgb(26, 236, 169)",
                "rgb(23, 228, 173)",
                "rgb(20, 219, 177)",
                "rgb(17, 211, 181)",
                "rgb(14, 203, 185)",
                "rgb(12, 194, 188)",
                "rgb(9, 186, 192)",
                "rgb(6, 178, 196)",
                "rgb(3, 169, 200)",
                "rgb(0, 161, 204)"
		];

		var init = function () {
			utils.get_config();
			render.init();
			
			utils.animate({
				'duration' : 1000,
				'step' : function (val) {
					start_radian = 0 + (Math.PI * val / 2);
					var max = start_radian + (Math.PI * 2 * val);
					utils.get_graph_data(max);
					render.graph();
				},
				'callback' : function() {
					render.labels();
					$canvas.on('mousemove', events.hover_canvas);
					$canvas.on('click', events.canvas_click);
				},
				'start' : 0,
				'end' : 1
			});
		};
		
		var render = {
			init : function() {
				var template = [
					'<canvas id="activity-canvas" width="' + WIDTH + '" height="' + HEIGHT + '"></canvas>',
					'<div id="activity-canvas-labels"></div>',
					'<div class="activity-canvas-info-wrapper">',
						'<div class="activity-canvas-info">' + data.name + " (" + data.count + ")" + '</div>',
					'</div>'
				];
				$dom.append(template.join(''));
				$canvas = $dom.find('#activity-canvas');
				$labels = $dom.find('#activity-canvas-labels');
				$info = $dom.find('.activity-canvas-info-wrapper');
				$info.find('.activity-canvas-info').css({'background-image' : 'url(' + utils.get_icon_url() + ')'});

				if (extra_options.hideWheelInsideText && extra_options.hideWheelInsideText === true) {
					$info.addClass('no-text');
					$info.find('.activity-canvas-info').text('');
				}

				ctx = $canvas.get(0).getContext( '2d' );
			},
			graph : function() {
				var center_x = WIDTH / 2,
					center_y = HEIGHT / 2;
				
				ctx.clearRect( 0, 0, WIDTH, HEIGHT );

				ctx.beginPath();
				ctx.moveTo(center_x, center_y);
				ctx.arc(center_x, center_y, RADIUS, 0, Math.PI*2);
				ctx.lineTo(center_x, center_y);
				ctx.closePath();
				ctx.fillStyle = '#333f48';
				ctx.fill();
				
				for (var i = graph_data.length - 1; i >= 0; i--) {
					ctx.scale(1,1);
					ctx.beginPath();
					ctx.moveTo(center_x, center_y);
					ctx.arc(center_x, center_y, graph_data[i].radius, graph_data[i].start_radian, graph_data[i].end_radian);
					ctx.lineTo(center_x, center_y);
					ctx.closePath();
					ctx.fillStyle = graph_data[i].color;
					ctx.fill();
				}
				 
				ctx.beginPath();
				ctx.moveTo(center_x, center_y);
				ctx.arc(center_x, center_y, (RADIUS/2), 0, Math.PI*2);
				ctx.lineTo(center_x, center_y);
				ctx.closePath();
				ctx.fillStyle = '#000000';
				ctx.fill();
			},
			labels : function() {
				$labels.empty();
				for (var i=0; i < graph_data.length; i++) {
					var $label = $('<p>' + graph_data[i].label + '</p>'),
						xpos = graph_data[i].label_point.x - 10,
						ypos = graph_data[i].label_point.y,
						class_name = "label";
					if (ypos < HEIGHT / 2)  {
						ypos -= 20;
					}
					if (graph_data[i].percent <= .05) {
						class_name += " small";
					}
					$label.css({ "top" : ypos, "left" : xpos });
					$label.addClass(class_name);
					$labels.append($label);
				}
			}
		};
		
		var events = {
		    compile_data_from_summary: function (summary) {
		        var totalSessions = _.reduce(summary.sessions, function (memo, s) { return memo + s.numberOfSessions; }, 0);
		        for (var i = 0; i < summary.sessions.length; i++) {
		            var entry = summary.sessions[i];
		            var percent = entry.numberOfSessions / totalSessions;
		                graph_source.push({
		                    id: entry.sessionCategory,
		                    percent: percent,
		                    count: entry.numberOfSessions,
		                    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length]
		                });
		            }
		    },
		    compile_data_from_sessions: function (sessions) {

		        classes = _.groupBy(sessions, function (s) { return s.name; });
		        _.sortBy(classes, function (c) { return c.length; });

		        for (var c in classes) {
		            if (classes.hasOwnProperty(c)) {
		                var percent = classes[c].length / data.count;
		                graph_source.push({
		                    id: c,
		                    percent: percent,
		                    count: classes[c].length,
		                    color: classes[c][0].color
		                });
		            }
		        }
		    },

		    hover_canvas: function (e) {
				e.preventDefault();
				var segment = utils.get_graph_segment_highlight(e);
				if (segment && !animating_segment) {
					if (segment.id !== highlight_id) {
						$canvas.addClass('selectable');
						highlight_id = segment.id;
						utils.animate({
							'duration' : 200,
							'step' : function (val) {
								utils.get_graph_data(false, val);
								render.graph();
							},
							'start' : 1,
							'end' : 10
						});
					}
				} else {
					$canvas.removeClass('selectable');
					highlight_id = false;
					utils.get_graph_data(false);
					render.graph();
				}
			},
			canvas_click : function(e) {
				e.preventDefault();
                
                var segment = utils.get_graph_segment_highlight(e),
					extraData = {};

                if (segment && segment.id !== selected_id) {

                    var radian_diff = (Math.PI - (segment.end_radian - segment.start_radian)) / 2,
                        new_start =  (start_radian - segment.start_radian + radian_diff),
                        start_diff =  new_start - start_radian;

                    // This helps the chart decide wich direction to rotate based on how close
                    // a segment is to the "selected" area.
                    if (start_diff <= -Math.PI) {
                        start_diff += (Math.PI * 2);
                    } else if (start_diff >= Math.PI) {
                        start_diff -= (Math.PI * 2);
                    }

                    selected_id = segment.id;
                    animating_segment = true;
					extraData.color = segment.color;
                    
                    utils.animate({
                        'duration' : 400,
                        'step' : function (val) {
                            start_radian = new_start - start_diff*val;
							utils.get_graph_data(false, 10);
							render.graph();
							render.labels();
						},
						'callback' : function() {
							animating_segment = false;
							on_select_segment(selected_id, extraData);
						},
						'start' : 1,
						'end' : 0
					});
					
				} else {
					selected_id = false;
					highlight_id = false;
					utils.get_graph_data();
					render.graph();
					render.labels();
					on_select_segment(false);
				}
			},
			resize : function() {
				utils.get_config();
				$canvas.attr("width", WIDTH);
				$canvas.attr("height", HEIGHT);
				utils.get_graph_data();
				render.graph();
				render.labels();
			},
			close_class : function() {
				selected_id = false;
				highlight_id = false;
				utils.get_graph_data();
				render.graph();
				render.labels();
				on_select_segment(false);
			},
			destroy : function() {
				$canvas.off('mousemove', events.hover_canvas);
				$canvas.off('click', events.canvas_click);
				$canvas.remove();
				$labels.remove();
				$info.remove();
			}
		};
		
		var utils = {
			get_config : function() {
				WIDTH = $(window).width();
				if (window.innerWidth < 768) {
					HEIGHT = 270;
					RADIUS = 115;
				} else {
					HEIGHT = 400;
					RADIUS = 180;
				}
			},
			get_graph_data : function(max, highlight_radius) {
				graph_data = [];
				var prev_radian = start_radian,
					max_radian = max || false,
					color_counter = 0;
			    for(var i = 0; i < graph_source.length; i++) {
			        var entry = graph_source[i];

			        var radian = Math.PI * 2 * entry.percent;
					var label_point = utils.get_point_from_angle(WIDTH/2, HEIGHT/2, prev_radian + (radian/2), RADIUS * 2 / 3 );
					radian += prev_radian;
					if (max_radian && radian > max_radian) {
						radian = max_radian;
					}
					var this_radius = RADIUS;
					if (selected_id === entry.id) {
						this_radius += 15;
					} else if (highlight_id === entry.id) {
						this_radius += highlight_radius;
					}
					var p = {
					    "percent": entry.percent,
						"label_point" :  label_point,
						'label' : entry.count,
						"start_radian" : prev_radian,
						"end_radian" : radian,
						'radius': this_radius,
						'id': entry.id,
						'color' : entry.color
					};
					graph_data.push(p);
					prev_radian = radian;
					color_counter++;
				}
			},
			get_graph_segment_highlight : function(e) {
				var top = $canvas.offset().top,
					left = $canvas.offset().left,
					xpos = e.pageX - left,
					ypos = e.pageY - top,
					img_data = ctx.getImageData(xpos,ypos,1,1).data,
					rgb = "rgb(" + img_data[0] + ", " + img_data[1] + ", " + img_data[2] + ")",
					segment = _.findWhere(graph_data, { 'color' : rgb });
				return segment;
			},
			get_icon_url : function() {
				if (data.white_icon) {
					return data.white_icon
				} else {
					return '/assets/images/activity/icons/white/empty.png';
				}
			}
		};
		$.extend(utils, require('components/utils'));
		
		init();
		var api = {
			"resize" : events.resize,
			"close_class" : events.close_class,
			"destroy": events.destroy,
			"compile_data_from_sessions": events.compile_data_from_sessions,
			"compile_data_from_summary": events.compile_data_from_summary
	};
		return api;
	};
	
	module.exports = ActivityDetail;
});