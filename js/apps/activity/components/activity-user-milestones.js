define(function(require, exports, module){
    "use strict";
    var ActivityUserMilestones = function($elementToAppendTo, options) {
    	// require('owlcarousel');

		var UserMilestoneModel,
			UserMilestonesCollection,
			UserMilestonesView,
			UserMilestonesSingleView,
			userMilestonesComponent,
			TimelineView,
			TimelineSingleView,
			api;

	    /**
	    * Models
	    */

    	UserMilestoneModel = Backbone.Model.extend({
    		defaults: {
	            icon: '',
	            caption: '',
	            category: '',
	            message: ''
        	}
    	});

	    /**
	    * Collections
	    */

	   	UserMilestonesCollection = Backbone.Collection.extend({
	    	model: UserMilestoneModel 
	    });

		/**
	    * Views
	    */

		UserMilestonesView = Backbone.View.extend({
			className: 'common-cta-module',
			template: _.template($('#userMilestonesTemplate').html()),
			initialize: function (options) {
				this.options = options || {};
			},
			render: function () {
				var self = this,
					totalUserMiles = this.options.totalMiles;

				// Define array to storage all the child views
				self.milestonesSingleViews = [];

				this.$el.html(this.template());

				if (this.options.emptyActivity === true || this.isMilestoneEmpty()) {
					this.showEmptyState();
				} else {

					var numTotalMilestones = this.collection.length - 1;

					for (var i = numTotalMilestones; i >= 0; i--) {
	                    if (this.collection.models[i].get('isAchieved') === true) {
	                    	var milesValue = this.collection.models[i].get('value');

	                    	var name = this.collection.models[i].get('name'),
	                    		achievedMilestoneMiles = (this.collection.models[i].get('value') === 0.01 ? 0 : this.collection.models[i].get('value')),
	                    		nextMilestoneMiles = 0,
                                milesToNextMilestone = 0;

	                    	name = name.indexOf('<BR>') !== -1 ? name.substr(0, name.indexOf('<BR>')) + '<br />' + name.substr(name.indexOf('<BR>') + 4, name.length) : name;
                            
                            if (i < numTotalMilestones) {
                                nextMilestoneMiles = this.collection.models[i+1].get('value');
                            } else {
                                nextMilestoneMiles = achievedMilestoneMiles;
                            }

	                    	this.collection.models[i].set('value', achievedMilestoneMiles);

	                        var milestonesSingleView = new UserMilestonesSingleView({
		                        model: this.collection.models[i],
		                        totalMiles: parseInt(totalUserMiles, 10),
		                        name: name
		                    });

                            milesToNextMilestone = EQ.Helpers.numbers.roundToTwoDecimals(nextMilestoneMiles - EQ.Helpers.numbers.trimWithFlooring(totalUserMiles));

		                    this.$el.find('.main-content').append(milestonesSingleView.render().el);
		                    this.setRemainingMiles(milesToNextMilestone);
		                    
		                    break;
	                    }
	                }
				}
				return this;
			},
			isMilestoneEmpty: function () {
				for (var i = this.collection.length - 1; i >= 0; i--) {
                    if (this.collection.models[i].get('isAchieved') === true) {
                        return false;
                    }
                }
                return true;
			},
			setRemainingMiles: function (remainingMiles) {
				var remainingText = EQ.Helpers.numbers.trimDecimals(remainingMiles);

				this.$el.find('.next-distance').text(remainingText + ' MI');
			},
			showEmptyState: function () {
				this.$el.find('.empty-milestone-container').removeClass('hidden');
				this.$el.find('.button-container, .timeline-container, > p').addClass('hidden');
			},
			close: function () {
				// First check all the child views and delete them
				_.each(this.milestonesSingleViews, function (singleView) {
					singleView.close();
				})

				this.remove();
			    delete this.$el;
			    delete this.el;
			}
		});

		UserMilestonesSingleView = Backbone.View.extend({
			className: 'milestone-item',
			tagName: 'ul',
			template: _.template($('#userMilestonesSingleViewTemplate').html()),
			render: function () {
				this.$el.html(this.template(this.model.toJSON()));
            	
            	return this;
			},
			close: function () {
				this.remove();
			    delete this.$el;
			    delete this.el;
			}
		});

		TimelineView = Backbone.View.extend({
			className: 'timeline-items',
			tagName: 'ul',
			initialize: function (options) {
                this.options = options || {};
            },
			setTimelineWidth: function () {
				var $achieved = this.$el.find('li.achieved').last(),
					finalWidth;

				if ($achieved.length) {
					finalWidth = parseInt($achieved.position().left) + parseInt($achieved.css('padding-left'));
					$('.timeline').css({'width': finalWidth + 'px' });
				}
			},
			render: function () {
				this.collection.each(function (timelineItem) {
                    var timelineSingleView = new TimelineSingleView({
                        model: timelineItem,
                        collection: this.collection
                    });
                    
                    this.$el.append(timelineSingleView.render().el);
                }, this);

                return this;
			}
		});

		TimelineSingleView = Backbone.View.extend({
			template: _.template($('#timelineItemSingleTemplate').html()),
			getRenderData: function () {
                var data = this.model.toJSON();
                return _.extend(data, MilestoneTimelineHelpers);
            },
            render: function () {
                this.setElement(this.template(this.getRenderData()));

                return this;
            }
		});

		var MilestoneTimelineHelpers = {
            setMilestoneSize: function () {
            	return this.showMilestoneImageLarge === true ? 'big-item' : '';
            },
            setAchieved: function () {
                return this.isAchieved === true ? ' achieved' : '';
            },
            setMilestoneBG: function () {
            	return this.isAchieved === true ? 'background-color:' + this.color : '';
            }
        };

		/**
	    * Render module and return public interface
	    */

	    EQ.Helpers.getService('/v3/me/activity/cycling/milestones').done(function (data) {
            debug('milestones', data);

            var userMilestonesCollection = new UserMilestonesCollection(data.milestones),
                userMilestonesComponent = new UserMilestonesView({totalMiles: data.totalMiles, collection: userMilestonesCollection, emptyActivity: options.emptyActivity}),
                timelineComponent = new TimelineView({totalMiles: data.totalMiles, collection: userMilestonesCollection});
			
			$elementToAppendTo.prepend(userMilestonesComponent.render().el);
			$('.timeline-wrapper').append(timelineComponent.render().el);
            timelineComponent.setTimelineWidth();
        });

		api = {
			'destroy' : function () {
				userMilestonesComponent.close();
			},
			'getElement': function () {
				return userMilestonesComponent.$el;
			}
		};

		return api;
	};


	module.exports = ActivityUserMilestones;
});