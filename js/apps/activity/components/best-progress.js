define( function(require, exports, module) {
	"use strict";
	var BestProgress = function(d, t) {
		var $dom = $('#activity-app-page-visual'),
			$value,
			$canvas,
			ctx,
			data = d,
			type = t,
			best = 20.53,
			total = 28.42,
			dom_width,
			dom_height,
			center_x,
			center_y,
			inner_radius,
			outer_radius,
			start_line_radius;
		
		var init = function() {
			utils.get_config();
			
			render.init();
			
			utils.animate_circles();
		};
		
		var render = {
			init : function() {
				var template = [
					'<p class="activity-current-best">',
						'<span class="activity-current-best-label">best: </span>',
						'<span class="activity-current-best-value">' + best + ' mi</span>',
					'</p>',
					'<div class="activity-current-progress">',
						'<p class="activity-current-progress-new">new best!</p>',
						'<p class="activity-current-progress-total">total</p>',
						'<div class="activity-current-progress-value">',
							'<span class="activity-current-progress-amount">' + total + '</span>',
							'<span class="activity-current-progress-unit">mi</span>',
						'</div>',
					'</div>',
					'<canvas id="activity-best-progress" width="' + dom_width + '" height="' + dom_height + '"></div>'
				];
				$dom.append(template.join(''));
				$value = $dom.find('.activity-current-progress-amount');
				$canvas = $dom.find('#activity-best-progress');
				ctx = $canvas.get(0).getContext( '2d' );
			},
			clear_circles : function() {
				ctx.clearRect( 0, 0, dom_width, dom_height );
			},
			inner_circle : function(pct_max) {
				var radius = inner_radius * pct_max,
					line_radius = start_line_radius * pct_max;
				
				ctx.shadowOffsetX = 1;
				ctx.shadowOffsetY = 1;
				ctx.shadowBlur = 1;
				ctx.shadowColor = 'rgba(0, 0, 0, .3)';
				
				ctx.beginPath();
				ctx.moveTo(center_x, center_y);
				ctx.arc(center_x, center_y, radius, 0, Math.PI*2);
				ctx.lineTo(center_x, center_y);
				ctx.closePath();
				ctx.fillStyle = '#ffffff';
				ctx.fill();
				
				ctx.shadowBlur = 0;
				ctx.shadowColor = 'rgba(0,0,0,0)';
				
				ctx.beginPath();
				ctx.moveTo(center_x, center_y);
				ctx.lineTo(center_x, center_y - line_radius);
				ctx.closePath();
				ctx.strokeStyle="#ffffff";
				ctx.stroke();
				
				
			},
			outer_circle : function(pct_max) {
				var best_pct = Math.min( (total / best), 1),
					best_rad = Math.min(best_pct, 1) * 2 * Math.PI,
					max_radian = best_rad * pct_max;
				max_radian -= Math.PI / 2;
				
				ctx.beginPath();
				ctx.moveTo(center_x, center_y);
				ctx.arc(center_x, center_y, outer_radius, -Math.PI / 2, max_radian);
				ctx.lineTo(center_x, center_y);
				ctx.closePath();
				ctx.fillStyle = 'rgba(255,255,255,.6)';
				ctx.fill();
			},
			best_circle : function(pct_max) {
				var best_diff = total - best,
					best_diff_pct = best_diff / best,
					best_diff_rad = Math.min(best_diff_pct, 1) * 2 * Math.PI,
					max_radian = best_diff_rad * pct_max;
				max_radian -= Math.PI / 2;
				
				ctx.beginPath();
				ctx.moveTo(center_x, center_y);
				ctx.arc(center_x, center_y, outer_radius, -Math.PI / 2, max_radian);
				ctx.lineTo(center_x, center_y);
				ctx.closePath();
				ctx.fillStyle = '#ff2d07';
				ctx.fill();
				
			},
			total : function(pct) {
				var display_val = total * pct;
				$value.text(utils.get_precision(display_val, 2));
			},
			best_achieved : function() {
				$dom.find('.activity-current-progress-new').show();
				$dom.find('.activity-current-progress-total').hide();
			}
		};
		
		var events = {
			resize : function() {
				utils.get_config();
				$canvas.attr({ 'width' : dom_width, 'height' : dom_height });
				render.clear_circles();
				if (total != 0) render.outer_circle(1);
				if (total >= best) render.best_circle(1);
				render.inner_circle(1);
				render.total(1);
			}
		}
		
		var utils = {
			get_config : function() {
				dom_width = $(window).width();
				if (window.innerWidth < 768) {
					dom_height = 285;
					inner_radius = 125;
					outer_radius = inner_radius + 10;
				} else {
					dom_height = 400;
					inner_radius = 175;
					outer_radius = inner_radius + 15;
				}
				center_x = dom_width / 2;
				center_y = dom_height / 2;
				start_line_radius = outer_radius + 10;
			},
			animate_circles : function() {
				var duration = 800,
					end = 1,
					best_shown = false;
				if (total != 0) {
					duration += 800;
					end = 2;
				}
				if (total >= best) {
					duration += 1000;
					end = 3;
				}
				utils.animate({
					'duration' : duration,
					'step' : function (val) {
						render.clear_circles();
						if (val > 2) {
							render.outer_circle( 1 );
							render.best_circle( Math.min(val % 2, 1) );
							if (!best_shown) {
								best_shown = true;
								render.best_achieved();
							}
						} else {
							if (val > 1) {
								render.outer_circle( Math.min(val % 1, 1) );
							}
						}
						render.inner_circle( Math.min(val, 1) );
						if (val >= 1) {
							render.total( (val - 1) / (end - 1));
						}
					},
					'callback' : function() {
						render.clear_circles();
						if (end >= 2) render.outer_circle(1);
						if (end === 3) render.best_circle(1);
						render.inner_circle(1);
						render.total(1);
					},
					'easing' : function (x, t, b, c, d) {
						return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
					},
					'start' : 0,
					'end' : end
				});
			}
		};
		
		$.extend(utils, require('components/utils'));
		
		init();
		var api = {
			"resize" : events.resize
		}
		return api;
	};
	
	module.exports = BestProgress;
});