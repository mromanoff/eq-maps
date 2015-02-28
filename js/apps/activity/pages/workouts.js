define(function(require, exports, modules){
    "use strict";
    var WorkoutsPage = function(d, p, s) {
        var date = d,
            period = p,
            subpage_section = s || false,
            base_hash = window.location.hash,
            SessionData = require('data/session-data'),
            ListData = require('data/list-data'),
            ActivityAggregates = require('components/activity-aggregates'),
            ActivityList = require('components/activity-list'),
            ActivityDetail = require('components/activity-detail'),
            ActivityTopTitle = require('components/activity-top-title'),
            ActivityTopMessage = require('components/activity-top-message'),
            category_data = [],
            session_data,
            hasDataTrackedOnCycling = false,
            list_data,
            activity_aggregates,
            activity_detail,
            activity_list,
            category_session_data,
            category_list_data,
            selected_category,
            top_title,
            top_message,
            view = "ALL",
            $visual,
            $drilldown,
            $nav = $('#activity-app-nav'),
            $timeSelect = $('#activity-app-timeframe-select'),
            $connectBox = $('#activity-app-page-connect'),
            $appPage = $('#activity-app-page'),
            xhrCategories,
            xhrWorkouts,
            $topNavigation = $('.topNavigation'),
            $timeframe = $('.activity-app-timeframe-select'),
            destroyed = false;

        //Endpoints for the workouts page
        var endpoint = {
            CLASS_CATEGORIES: '/v2.6/workouts/categories',
            ME_WORKOUTS : '/v2.6/me/workouts/' + date.format("YYYY/M"),
            CLASS_STATS : function ( classInstanceID ) { return '/v3/classes/' + classInstanceID + '/me/statistics'; },
            CLASS_DATA : function ( classInstanceID ) { return '/v3/classes/' + classInstanceID + '/me/data'; },
            CLASS_RANKINGS : function ( classInstanceID ) { return '/v3/classes/' + classInstanceID + '/leaderboard'; },
            CLASS_BEST : function ( categoryID ) { return '/v3/me/best/classes/' + categoryID; }
        };
			
        var init = function() {
        	if (subpage_section) {
        		base_hash = base_hash.replace("/" + subpage_section, "");
        	}
        	$visual = $('#activity-app-page-visual');
        	$('#activity-app-page-list').hide();
        	$nav.show();
        	$visual.on('click', 'a.back-button-drilldown', events.exit_section);

			Backbone.Events.trigger('activityLoader:start');

        	utils.load_category_data();
        };

	    // Configure dataset to account for special cases
		var customizeSessionsData = function () {
		    var cycling = _.find(session_data, function (e) { return e.category_id == "6"; });
		    cycling.disableExitTransition = true;
		    cycling.customSelectionCallback = function () {
		        Backbone.Router.prototype.navigate('/WORKOUTS/'+date.format('YYYY/MM')+'/Cycling', {
		        	trigger: true
		        });
		    };
		    /*cycling.loadChartData = function (callback) {
		    	EQ.Helpers.getService(endpoint.SUMMARY_SESSIONS).done(callback);
		    }*/
		}

		var render = {
			page : function() {
				Backbone.Events.trigger('activityLoader:remove');

				$connectBox.hide();
				activity_aggregates = new ActivityAggregates(session_data, events.activity_category_selected);
				activity_list = new ActivityList('', function () {
					activity_detail.close_class();
				}, events.exit_section);

				activity_list.update_data(list_data, period, "All " + date.format("MMMM") + " Workouts", "ALL", {
					type: 'workout',
					item_callback: function (id) {
						location.href = '/activity/workouts/' + id;
					}
				});

				if (subpage_section) { 
					var t_cat = _.find(session_data, { 'id' : subpage_section.toLowerCase() });
					if (t_cat && t_cat.count > 0) {
						activity_aggregates.force_select(t_cat.id);
						events.activity_category_selected(t_cat.category_id);
					} else {
						window.location.hash = base_hash;
					}
				}
				
			},
			no_sessions : function() {
				var emptyListTemplate = $('#emptyListTemplate').html();
				Backbone.Events.trigger('activityLoader:remove');

				$connectBox.hide();
				$visual.append('<div class="no-sessions-activity">No data yet</div>');
				$visual.append(emptyListTemplate);
			},
			drilldown : function(title, hideCloseIcon, countToShow) {
				if ($drilldown) {
					$drilldown.remove();
				}
				var template = [
					'<div class="activity-session-drilldown">',
                        '<a class="back-button-drilldown" href="javascript:;"><span class="back-button icon-left-arrow back-to-activity" ></span></a>',
						'<span class="activity-session-drilldown-name">' + title + '</span>'
				];

				if (countToShow) {
					template.push('<span class="count">(' + countToShow + ')</span>');
				}

				if (!hideCloseIcon || hideCloseIcon === false) {
					template.push('<span class="activity-session-drilldown-icon"></span>');
				}
				template.push('</div>');

				$drilldown = $(template.join(''));
				$visual.prepend($drilldown);
			}
		};
		
		var events = {
			"activity_category_selected" : function(id) {
				category_list_data =  _.filter(list_data, { 'category_id' : id });
				category_session_data = _.findWhere(session_data, { 'category_id' : id });
				selected_category = id;
				view = "CATEGORY";
				utils.add_category_class_colors();

                // Change route (for back button support)
                if(category_session_data.name.toLowerCase() !== 'cycling'){
	                Backbone.Router.prototype.navigate(location.hash + '/' + category_session_data.name);
	            }

                // Hide navigation.
                $('#activity-app-nav').hide();

				var dataLoaded = function () {
				    // Check for custom selection callback
				    if (category_session_data.customSelectionCallback && hasDataTrackedOnCycling) {
				        category_session_data.customSelectionCallback(category_list_data);
				    } else {
				        render.drilldown(category_session_data.name, true);
				        activity_list.update_data(category_list_data, period, category_session_data.name + " Sessions", "SUB", {
							type: 'workout',
							item_callback: function (id) {
								location.href = '/activity/workouts/' + id;
							}
						}, true);
					}
				};

				activity_detail = new ActivityDetail(category_session_data, events.activity_segment_selected, {
					hideWheelInsideText: (category_session_data.loadChartData ? true : false)
				});

				if (category_session_data.loadChartData) {
				    category_session_data.loadChartData(function (summary) {
				        activity_detail.compile_data_from_summary(summary);
				        dataLoaded();
				    });
				} else {
				    activity_detail.compile_data_from_sessions(category_session_data.sessions);
				    dataLoaded();
				}
			},
			"activity_segment_selected" : function(name) {
				var sub_list_data,
					all_time_data;

                // Hide navigation.
                $('#activity-app-nav').hide();

				if (name) {
					view = "CLASS";
					sub_list_data =  _.filter(category_list_data, { 'name' : name });
					activity_list.show();
					
					render.drilldown(name, true);
					activity_list.update_data(sub_list_data, period, name + " Sessions", "SUB", {
						type: 'workout',
						item_callback: function (id) {
							location.href = '/activity/workouts/' + id;
						}
					}, true);
					
				} else {
					view = "CATEGORY";
					activity_list.update_data(category_list_data, period, category_session_data.name + " Sessions", "SUB", {
						type: 'workout',
						item_callback: function (id) {
	                        location.href = '/activity/workouts/' + id;
	                    }
					}, true);
					render.drilldown(category_session_data.name, true);
				}
			},
			"exit_section" : function() {
                // Show navigation if hidden.
                $('#activity-app-nav').show();

				if (view == "CATEGORY") {
					activity_detail.destroy();
					activity_aggregates.close_category();
					activity_list.show();
					activity_list.update_data(list_data, period, "All " + date.format("MMMM") + " workouts", "ALL", {
						type: 'workout',
						item_callback: function (id) {
                        	location.href = '/activity/workouts/' + id;
                    	}
					});
					$drilldown.remove();
					view = "ALL";
					window.location.hash = base_hash;
				} else if (view == "CLASS") {
					activity_detail.close_class();
					activity_list.update_data(category_list_data, period, category_session_data.name + " Sessions", "SUB", {
						type: 'workout',
						item_callback: function (id) {
                        	location.href = '/activity/workouts/' + id;
                    	}
					}, true);
					render.drilldown(category_session_data.name, true);
					view = "CATEGORY";
				}
			},
			"resize" : function() {
				if (activity_aggregates)  {
					activity_aggregates.resize();
				}
				if (activity_detail) {
					activity_detail.resize();
				}
				if (activity_list) {
					activity_list.resize();
				}
			},
			destroy : function() {
				EQ.Helpers.abortService(xhrCategories);
				EQ.Helpers.abortService(xhrWorkouts);

				destroyed = true;
				$visual.off('click', 'a.activity-session-drilldown', events.exit_section);
				if (activity_aggregates)  {
					activity_aggregates.destroy();
				}
				if (activity_detail) {
					activity_detail.destroy();
				}
				if (activity_list) {
					activity_list.destroy();
				}
			}
		};
		
		var utils = {
			load_category_data : function() {
				xhrCategories = EQ.Helpers.getService(endpoint.CLASS_CATEGORIES)
				.done( function (d) {
					category_data = d;
					utils.load_data();
				});
			},
			load_data : function() {
				xhrWorkouts = EQ.Helpers.getService(endpoint.ME_WORKOUTS, {cache: false})
				.done(function (d) {
					if (!destroyed) {
						utils.create_data(d.workouts);
					}
				}).fail(function (e) {
                    Backbone.Events.trigger('activityLoader:error');
                });
			},
			create_data : function(d) {
                var cycling_session_data;

				session_data = new SessionData(category_data, d);
				var grouped_sessions = _.pluck(session_data, "sessions"),
					sessions = [];
				for (var i=0; i < grouped_sessions.length; i++) {
					sessions = sessions.concat(grouped_sessions[i]);
				}
				sessions.sort(function(a, b) {
					return b.date - a.date;
				});
				list_data = new ListData(sessions, "SESSION");

                // get cycling category data to check if there is data tracked
                cycling_session_data = _.findWhere(session_data, { 'category_id' : "6" });
                _.each(cycling_session_data.sessions, function (cyclingSession) {
                    if (cyclingSession.totalDistance > 0) {
                        hasDataTrackedOnCycling = true;
                    }
                });

				customizeSessionsData();
				if (sessions.length > 0) {
					render.page();
				} else {
					render.no_sessions();
				}
			},
			add_category_class_colors : function() {
				var COLORS = [
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
					],
					color_counter = 0,
					color_division = Math.max(Math.floor(COLORS.length / category_session_data.class_count) , 1),
					class_colors = {},
					class_name,
					i = 0;
				if (category_session_data.count > 10) {
					var extras = category_session_data.count - 9,
						mod_values = [26, 236, 169];
					for (i = 1; i < extras; i++) {
						var mod = (1 - i / (extras * 1.5)),
							ret = "rgb(";
						ret += Math.ceil(mod_values[0] * mod) + ", ";
						ret += Math.ceil(mod_values[1] * mod) + ", ";
						ret += Math.ceil(mod_values[2] * mod) + ")";
						COLORS.push(ret);
					}
				}
				
				for (i = 0; i < category_session_data.count; i++) {
					class_name = category_session_data.sessions[i].name;
					if (!class_colors[class_name]) {
						class_colors[class_name] = COLORS[color_counter];
						color_counter+= color_division;
					}
					category_session_data.sessions[i].color = class_colors[class_name];
				}
				for (i = 0; i < category_list_data.length; i++) {
					class_name = category_list_data[i].name;
					category_list_data[i].secondary_color = class_colors[class_name];
				}
			}
		};
		
		init();

		var api = {
			"resize" : events.resize,
			"destroy" : events.destroy
		};
		return api;
	};
	
	modules.exports = WorkoutsPage;
});