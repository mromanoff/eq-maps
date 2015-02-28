define(function(require, exports, module) {
	"use strict";
	
    var ActivityData = function (raw) {
		var raw_data = raw,
			raw_activities = raw.dailyActivities;
		this.activities = [];
		this.totals = {
			'distance' : 0,
			'calories' : 0
		};
		this.metric = (raw.distanceUnit == "kilometer") ? "km" : "mi";
		for (var i=0; i < raw_activities.length; i++) {
			var a = new ActivityDataActivity(raw_activities[i]);
			this.totals.distance += a.distance;
			this.totals.calories += a.calories;
			this.activities.push(a);
		}
    };

	var ActivityDataActivity = function(raw) {
		var workout_category = raw.workoutCategory || {};
		//this.name = workout_category.name || '';
		this.name = raw.deviceType || '';
		var date = raw.startDateLocal || new Date();
		this.date = moment(date);
		this.calories = raw.totalCalories || 0;
		this.distance = raw.totalDistance || 0;
		var device_type = raw.workoutSource || "";
		this.device = "MACHINE";
		if (device_type == "External Device") {
			this.device = "APP";
		}
	};
    
	module.exports = ActivityData;
});