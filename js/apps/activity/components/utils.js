define(function(require, exports, module){
	"use strict";
	
	var Utils = {
		animate : function ( obj ) {
			var fps        = 60,
				wait       = Math.round( 1000 / fps ),
				duration   = obj.duration || 1000,
				callback   = obj.callback || false,
				step       = obj.step || function () {},
				start_val  = obj.start || 0,
				end_val    = obj.end || 0,
				/*
					EASING FUNCTIONS:
					https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
				*/
				easing     = obj.easing || function ( x, t, b, c, d ) { return -c * ( t /= d ) * ( t - 2 ) + b; },
				start_time = +new Date(),
				interval   = setInterval( function () {
					var now  = +new Date(),
						time = now - start_time;
					step( easing( null, Math.min( time, duration ), start_val, end_val - start_val, duration ) );
					if ( time >= duration ) {
						clearInterval( interval );
						if ( callback ) {
							callback();
						}
					}
				}, wait );
		},
		get_point_from_angle: function ( x, y, angle, distance ) {
			return {
				x: Math.cos( angle ) * distance + x,
				y: Math.sin( angle ) * distance + y
			};
		},
		get_distance : function(x_one, y_one, x_two, y_two) {
			var x_sq = Math.pow((x_two - x_one), 2);
			var y_sq = Math.pow((y_two - y_one), 2);
			return Math.sqrt(x_sq+y_sq);
		},
		get_precision : function(val, precision) {
			var pow = Math.pow(10, precision),
				floor = Math.floor(val * pow) / pow,
				ret = floor.toString(),
				arr = ret.split('.'),
				len = precision;
			if (floor % 1 != 0) {
				if (!arr[1]) {
					ret += ".";
					len = precision;
				} else {
					len -= arr[1].length;
				}
				while (len > 0) {
					ret += "0";
					len--;
				}
			}
			return ret;
		}
	};
	
	module.exports = Utils;
});