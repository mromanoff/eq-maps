define(function(require, exports, module){
	"use strict";
	
	var SessionData = function(cats, raw) {
		var raw_categories = cats,
			raw_data = raw,
			categories = [{
			    "id" : "CheckIn",
			    "name" : "Visit",
			    "category_id" : "CheckIn",
			    "teal_icon" : "/assets/images/activity/icons/visits_teal.png",
				"white_icon" : "/assets/images/activity/icons/visits_white.png",
			    "count" : 0,
				"class_count" : 0,
				"sessions" : []
			}],
			i = 0;

		for (i = 0; i < raw_categories.length; i++) {
			var cat_id = raw_categories[i].categoryName || '';
			cat_id = cat_id.toLowerCase().replace(/ /g, '_');
			var teal_image = raw_categories[i].iconImage2Url || '',
				white_image = raw_categories[i].iconImage3Url || '';
			if (teal_image == "") {
				teal_image = false;
			}
			if (white_image == "") {
				white_image = false;
			}
			
			var cat = {
				"id" : cat_id,
				"name" : raw_categories[i].categoryName || '',
				"category_id" : raw_categories[i].categoryId || '',
				"teal_icon" : teal_image,
				"white_icon" : white_image,
				"count" : 0,
				"class_count" : 0,
				"sessions" : []
			};
			if (!_.find(categories, { 'id' : cat_id } )) {
			    if (raw_categories[i].categoryName === 'Pool Programs' || raw_categories[i].categoryName === 'Cardio') {
					continue;
				}
				categories.push(cat);
			}
		}
		
		for (i = 0; i < raw_data.length; i++) {
			var s = new Session(raw_data[i]),
				s_cat = _.find(categories, function(c) {
					return c.category_id == s.category_id;
				});
			if (s_cat) {
				if (!_.find(s_cat.sessions, { 'name': s.name })) {
					s_cat.class_count++;
				}
				s_cat.sessions.push(s);
				s_cat.count++;
			} else {
				console.warn("No Category Id: ", s.category);
			}
		}
		
		categories.sort(function(a,b){
			return b.count - a.count;
		});
		
		return categories;
	};
	
	var Session = function (raw) {	    
		var raw_data = raw;
		var facilityData = EQ.Helpers.getFacilityById(raw_data.facilityId);

		this.id = raw_data['id'];
		this.name = raw_data['name'] || '';
		this.category = raw_data['category'] || '';
		this.category_id = raw_data['workoutCategoryId'] || '';
		if (this.category == "CheckIn") {
		    this.category_id = "CheckIn";
		    this.name = "Visit";
		}

		this.eventType = raw.eventType || '';
		this.location = (facilityData) ? facilityData.ClubName : '';
		this.instructor = raw_data['trainerName'] || '';
		var date = raw.startlocal || new Date(),
			time_zone = raw.facilityTimezone || '';
		this.date = moment(date).zone(time_zone);
		this.startDate = raw.startLocal;
		this.endDate = raw.endLocal;
		this.totalEnergy = raw.totalCalories;
		this.totalDistance = raw.totalDistance;
		this.distanceUnit = raw.distanceUnit;

	};
		
	module.exports = SessionData;

});