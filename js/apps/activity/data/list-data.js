define(function(require, exports, module){
	"use strict";
	
	var ListData = function(raw, type) {
		var raw_data = raw,
			items = [];
		for (var i=0; i < raw_data.length; i++) {
			var li = new ListItem(raw_data[i], type);
			items.push(li);
		}
		return items;
	};
	
	var ListItem = function(raw, type) {
		var raw_data = raw,
			SESSION_COLORS = [
				"#a4a9ac", 
				"#333f48", 
				"#91969a", 
				"#888e93", 
				"#7f858a", 
				"#777d83", 
				"#6b737a", 
				"#656d74", 
				"#5d666d", 
				"#565f67", 
				"#596269", 
				"#4f5961", 
				"#47525a", 
				"#455058", 
				"#404b54", 
				"#3d4851", 
				"#9aa0a3"
			],
			DEVICE_COLORS = [
				'#7d888e',
				'#323f48'
			];
		this.id = raw_data['id'];
		this.name = raw_data['name'] || '';
		var cat_id  = raw_data['category_id'] || '';
		this.category_id = cat_id.toString();
		this.location = raw_data['location'] || '';
		this.instructor = raw_data['instructor'] || '';
		this.date = raw_data['date'] || moment();
		this.startDate = raw_data['startDate'];
		this.endDate = raw_data['endDate'];
		this.startMoment = moment(this.startDate);
		this.totalDistance = raw_data['totalDistance'] || 0;
		this.totalEnergy = raw_data['totalEnergy'] || 0;
		this.distanceUnit = raw_data['distanceUnit'];
		this.device = raw_data['device'] || '';
		this.eventType = raw_data['eventType'] || '';
		var color_id = 0;
		if (type == "SESSION") {
			color_id = Math.floor(this.date.format('D') / 2);
			this.primary_color = SESSION_COLORS[color_id];
		}
		if (type == "ACTIVITY") {
			color_id = this.device == "MACHINE" ? 1 : 0;
			this.primary_color = DEVICE_COLORS[color_id];
		}
		
	};
	
	
	module.exports = ListData;

});