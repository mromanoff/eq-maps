define(function(require, exports, module){
    "use strict";
    var ActivityCyclingDetailRank = function($elementToAppendTo, leaderboardsData, statsData, userData) {
		var ActivityCyclingDetailRankView,
			RankingSingleView,
			rankModel,
			detailRankComponent,
			api;

		/**
	    * Views
	    */

		ActivityCyclingDetailRankView = Backbone.View.extend({
			className: 'rank-container',
			template: _.template($('#cyclingDetailRankTemplate').html()),
			events: {
				'click .gender-filter a': 'switchGender',
			},
			render: function () {
				var rankingCollection,
					$rankingContainer,
					self = this,
					jsonModel = this.model.toJSON();

				//Massaging the 'me' data
				$.extend( jsonModel.me, { 
					displayName: 'YOU', 
					distance : statsData.metrics[1].value,
					image: userData.ProfilePictureUrl 
				});

				this.childViews = [];
				this.$el.html(this.template(jsonModel.me));

				rankingCollection = new Backbone.Collection(this.model.get('leaderboard'));
				$rankingContainer = this.$el.find('.leaderboard-container');

				//If the user falls outside the rank, add him at the top
				if(jsonModel.me.rank > jsonModel.leaderboard.length) {
					
					var meCol = new Backbone.Collection(this.model.get('me'));
					meCol.each(function (me){
						var meView = new RankingSingleView({ model: me });
	                	$rankingContainer.append(meView.render(true).el);
	                	self.childViews.push(meView);
					});
				}

				rankingCollection.each(function (boardUser, idx) {
					
					//Adding the missing rank attribute
					$.extend(boardUser.attributes, { rank : idx+1 });

                	var rankingSingleView = new RankingSingleView({ model: boardUser });

                	$rankingContainer.append(rankingSingleView.render( (boardUser.attributes.rank === jsonModel.me.rank)? true : false ).el);

                	self.childViews.push(rankingSingleView);
            	}, this);

            	return this;
			},
			close: function () {
				// First check all the child views and delete them
				_.each(this.childViews, function (singleView) {
					singleView.close();
				})

				this.remove();
			    delete this.$el;
			    delete this.el;
			},
			switchGender: function (e) {
				e.preventDefault();

				var $currentOption = $(e.currentTarget),
					$genders = $currentOption.parent();

				if (!$currentOption.hasClass('selected')) {

					//Here we should call the new model with the corresponding gender
					//this.render( {} );

					// Set on the current, remove selected class for all the elements
					$currentOption
						.addClass('selected')
						.siblings().removeClass('selected');

				}
			}
		});

		RankingSingleView = Backbone.View.extend({
			template: _.template($('#cyclingDetailRankingSingleViewTemplate').html()),
			className: 'leaderboard-list',
			tagName: 'ul',
			render: function ( highlight ) {
				this.$el.toggleClass('black-bg', !!highlight).html(this.template(this.model.toJSON()));
            	return this;
			},
			close: function () {
				this.remove();
			    delete this.$el;
			    delete this.el;
			}
		});

		/**
	    * Render module and return public interface
	    */
		rankModel = new Backbone.Model(leaderboardsData);
		detailRankComponent = new ActivityCyclingDetailRankView({model: rankModel});
		
		$elementToAppendTo.append(detailRankComponent.render().el);

		api = {
			'destroy' : function () {
				detailRankComponent.close();
			},
			'getElement': function () {
				return detailRankComponent.$el;
			}
		};

		return api;
	};


	module.exports = ActivityCyclingDetailRank;
});