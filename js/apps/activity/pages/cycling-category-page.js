define(function(require, exports, modules){
    "use strict";
    var CyclingCategoryPage = function(d, p){
    	var date = d,
            period = p,
            ActivityGenericPage = require('components/activity-generic-page'),
            ActivityCyclingExtra = require('components/activity-cycling-extra'),
            ActivityList = require('components/activity-list'),
            ActivityTopTitle = require('components/activity-top-title'),
            ActivityEnergyBarStats = require('components/activity-energy-bar-stats'),
            ActivityStatsComparision = require('components/activity-stats-comparision'),
            ActivityUserMilestones = require('components/activity-user-milestones'),
            $appPage = $('#activity-app-page'),
            $visual = $('#activity-app-page-visual'),
            $nav = $('#activity-app-nav'),
            $timeSelect = $('#activity-app-timeframe-select'),
            $connectBox = $('#activity-app-page-connect'),
            $topNavigation = $('.topNavigation'),
            $timeframe = $('.activity-app-timeframe-select'),
    		CyclingCategoryPageView,
    		cyclingCategoryPageComponent,
    		cycling_extra,
    		energy_stats,
    		stats_comparision,
    		activity_list,
    		user_milestones,
    		activity_cycling_extra_components,
    		top_title;

    	var endpoint = {
            ME_ACTIVITY_CYCLING : '/v3/me/activity/cycling',
            ME_ACTIVITY_CYCLING_SESSIONS : '/v3/me/activity/cycling/sessions',
            SUMMARY_SESSIONS : '/v3/me/activity/cycling/sessions/summary'
        };

    	CyclingCategoryPageView = ActivityGenericPage.extend({
    		render: function(){
    			// First Hide general navigation headers
				$topNavigation.hide();
				$timeframe.hide();
				$timeSelect.hide();
				$connectBox.hide();
				//$visual.hide();
				//activity_list.hide();

				/********* Cycling Extra Info skeleton *********/
				cycling_extra = new ActivityCyclingExtra($appPage);
                cycling_extra.hide();

				var xhrActivityCycling = EQ.Helpers.getService(endpoint.ME_ACTIVITY_CYCLING);

                Backbone.Events.trigger('activityLoader:start');

				xhrActivityCycling.done(function (response) {

                    cycling_extra.show();
                    Backbone.Events.trigger('activityLoader:remove');
					// Check if user has data
					var emptyActivity = response.hasActivity && response.hasActivity === true ? false : true,
						bestClassMetricsData = response.bestClassMetrics || [],
                        totalDistanceLastMonth = response.totalDistanceLastMonth,
                        totalDistanceThisMonth = response.totalDistanceThisMonth;

					if (!emptyActivity) {
                        var xhrActivityCyclingSessions = EQ.Helpers.getService(endpoint.ME_ACTIVITY_CYCLING_SESSIONS + moment().format('/YYYY')),
                            all_time_data,
                            sub_list_data;

                        xhrActivityCyclingSessions.done(function (response) {
                            var totalDistancePoints = 0,
                                totalDistance = 0,
                                averageDistance = 0,
                                totalEnergyPoints = 0,
                                totalEnergy = 0,
                                averageEnergy = 0;

                            sub_list_data = response.sessions || [];

                            // Parse sessions info
                             _.each(sub_list_data, function(cyclingSession) {
                                var facilityData = EQ.Helpers.getFacilityById(cyclingSession.facilityId);

                                if(cyclingSession.totalDistance > 0) {
                                    totalDistancePoints++;
                                    totalDistance += cyclingSession.totalDistance;
                                }

                                if(cyclingSession.totalEnergy > 0) {
                                    totalEnergyPoints++;
                                    totalEnergy += cyclingSession.totalEnergy;
                                }

                                // Activity list uses startDate and endDate, so we need to assign local dates to these vars
                                cyclingSession.startDate = cyclingSession.startLocal;
                                cyclingSession.endDate = cyclingSession.endLocal;
                                cyclingSession.location = (facilityData) ? facilityData.ClubName : '';
                                cyclingSession.instructor = cyclingSession.trainerName;
                                cyclingSession.totalEnergy = parseInt(cyclingSession.totalCalories, 10);
                                cyclingSession.className = cyclingSession.name;
                            });

                            // calc avgs
                            averageDistance = totalDistancePoints > 0 ? totalDistance / totalDistancePoints : 0;
                            averageEnergy = totalEnergyPoints > 0 ? totalEnergy / totalEnergyPoints : 0;

                            all_time_data =  {
                                sessionsData: sub_list_data,
                                generalData: {
                                    averageDistance: averageDistance,
                                    averageEnergy: parseInt(averageEnergy, 10),
                                    distanceUnit: 'MI'
                                }
                            }

                            activity_list = new ActivityList();

                            activity_list.show();
                            activity_list.update_data(all_time_data, period, "All Cycling Sessions", "SUB", {
                                type: 'workout',
                                month_navigation: true,
                                item_callback: function (id) {
                                    location.href = '/activity/workouts/' + id;
                                }
                            });
                        });
					}

					top_title = new ActivityTopTitle(cycling_extra.getElement().find('.cycling-extra-top-message .upper-cycling-module'), function(){
						Backbone.Router.prototype.navigate('/WORKOUTS/'+date.format('YYYY/MM'), {
				        	trigger: true
				        });
					});
					//top_message = new ActivityTopMessage(cycling_extra.getElement().find('.cycling-extra-top-message .upper-cycling-module'));
					energy_stats = new ActivityEnergyBarStats(cycling_extra.getElement().find('.cycling-extra-energy-bar-stats'), {
						selectedDate: date,
                        emptyActivity: emptyActivity,
                        totalDistanceLastMonth: parseInt(totalDistanceLastMonth, 10),
                        totalDistanceThisMonth: parseInt(totalDistanceThisMonth, 10)
					});
					stats_comparision = new ActivityStatsComparision(cycling_extra.getElement().find('.cycling-extra-stats-comparision'), bestClassMetricsData, {
                        emptyActivity: emptyActivity
					});
					user_milestones = new ActivityUserMilestones(cycling_extra.getElement().find('.cycling-extra-user-milestones'), {
						emptyActivity: emptyActivity
					});

					activity_cycling_extra_components = true;
				}).fail(function (e) {
                    Backbone.Events.trigger('activityLoader:error');
                });
    		},

    		destroyAllComponents: function(){
    			$nav.show();
				$timeSelect.show();
				$connectBox.show();
				$topNavigation.show();
				$timeframe.show();

				//$visual.on('click', 'a.activity-session-drilldown', events.exit_section);
				
				cycling_extra.destroy();
				//top_message.destroy();
				//energy_stats.destroy();
				//stats_comparision.destroy();
				//user_milestones.destroy();

				activity_cycling_extra_components = false;
    		}
    	});

    	cyclingCategoryPageComponent = new CyclingCategoryPageView({
            el: $appPage
        });
        cyclingCategoryPageComponent.render();

    	var api = {
            'destroy': function () {
                cyclingCategoryPageComponent.close();
            },
            'changePeriodType': function (type) {
                cyclingCategoryPageComponent.changePeriodPage(type);
            },
            'updateDate': function (date) {
                cyclingCategoryPageComponent.updateDate(date);
            }
        };

        return api;
    };

    modules.exports = CyclingCategoryPage;
});