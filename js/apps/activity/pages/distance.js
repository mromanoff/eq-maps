define(function(require, exports, modules){
	"use strict";
	var DistancePage = function(d, p) {
		var date = d,
			period = p,
			ActivityData = require('data/activity-data'),
			ListData = require('data/list-data'),
			ActivityList = require('components/activity-list'),
			BarChart = require('components/bar-chart'),
			BestProgress = require('components/best-progress'),
			activity_list,
			bar_chart,
			best_progress,
			activity_data,
			list_data,
			$loader_wrapper,
			loader,
			destroyed = false;
			
		var init = function() {
			$('#activity-app-page-list').hide();
			$loader_wrapper = $('#activity-app-page-loading');
			loader = EQ.Helpers.loaderAndErrorHandler($loader_wrapper, { 'color' : 'white' });
			loader.showLoader();
			$loader_wrapper.show();
			utils.load_data();
		};
		
		var render = {
			page : function() {
				loader.hideLoader();
				$loader_wrapper.hide();
				bar_chart = new BarChart(activity_data, "DISTANCE", date);
				activity_list = new ActivityList(activity_data.metric);
				activity_list.update_data(list_data, period, "Distance Tracking Activity", "ALL");
				//best_progress = new BestProgress(data, "distance");
			}
		};
		
		var events = {
			resize : function() {
				if (best_progress) {
					best_progress.resize();
				}
				if (bar_chart) {
					bar_chart.resize();
				}
				if (activity_list) {
					activity_list.resize();
				}
			},
			destroy : function() {
				destroyed = true;
				if (best_progress) {
					best_progress.destroy();
				}
				if (bar_chart) {
					bar_chart.destroy();
				}
			}
		};
		
		var utils = {
			load_data : function() {
				var url = APIEndpoint + '/me/activities/' + date.format("YYYY/M");
				if (window.data_cache[url]) {
					console.info('load from cache: ', url);
					utils.create_data(window.data_cache[url]);
					return;
				}
				console.info('load from service: ', url);
				$.ajax({
					type: 'GET',
					url: url,
					contentType: 'application/json',
					xhrFields: { 'withCredentials': true },
					dataType: 'json',
					success: function (d) {
						window.data_cache[url] = d;
						if (!destroyed) {
							utils.create_data(d);
						}
					},
					error: function (d) {
						console.warn('error activities data' , d);
						utils.create_data({ "dailyActivities" : [] });
					}
				});
			},
			create_data : function(d) {
				activity_data = new ActivityData(d);
				list_data = new ListData(activity_data.activities, "ACTIVITY");
				render.page();
			}
		};
		
		init();
		var api = {
			"resize" : events.resize,
			"destroy" : events.destroy
		};
		return api;
	};
	
	modules.exports = DistancePage;
});