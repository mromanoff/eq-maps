define(function (require, exports, module) {
    'use strict';
    var ActivityCyclingLeaders = function ($elementToAppendNextTo) {
        var CyclingLeadersIntroView,
            CyclingLeadersView,
            RankingSingleView,
            componentData,
            cyclingLeadersIntroComponent,
            api;

        /**
        * Views
        */

        CyclingLeadersIntroView = Backbone.View.extend({
            className: 'half-module',
            template: _.template($('#cyclingLeadersIntro').html()),
            events: {
                'click a.view-group': 'connect'
            },
            connect: function (e) {
                e.preventDefault();
                var $introScreen = this.$el.find('.intro'),
                    cyclingLeadersModel;

                this.cyclingLeadersComponent = null;

                // ajax service to connect and bring leaderboard
                // by now it only fires the leader board

                // NOTE: This is MOCK DATA and actually needs to come from an api endpoint.
                // AJAX CALL TO /v3/me/activity/cycling/leaderboard?maxResults=100

                componentData = {
                    me: {
                        rank: 12,
                        total: 324,
                        distance: {
                            value: 22.3,
                            unitOfMeasure: 'MI'
                        }
                    },
                    leaderboards:
                    [
                        {
                            name: 'distance',
                            entries:
                            [
                                {
                                    image: 'avatar.jpg',
                                    firstName: 'Samantha',
                                    lastName: 'B.',
                                    total: {
                                        value: 27.8,
                                        unitOfMeasure: 'MI'
                                    },
                                    rank: 1
                                },
                                {
                                    image: 'avatar.jpg',
                                    firstName: 'Karen',
                                    lastName: 'B.',
                                    total: {
                                        value: 27.1,
                                        unitOfMeasure: 'MI'
                                    },
                                    rank: 2
                                },
                                {
                                    image: 'avatar.jpg',
                                    firstName: 'Diana',
                                    lastName: 'B.',
                                    total: {
                                        value: 27.1,
                                        unitOfMeasure: 'MI'
                                    },
                                    rank: 3
                                }
                            ]
                        }
                    ]
                };

                cyclingLeadersModel = new Backbone.Model(componentData);
                this.cyclingLeadersComponent = new CyclingLeadersView({model: cyclingLeadersModel});

                // hide intro screen
                $introScreen.hide();
                // Append LeaderBoard
                $introScreen.after(this.cyclingLeadersComponent.render().el);
            },
            render: function () {
                this.$el.html(this.template());
                return this;
            },
            close: function () {
                // First remove child view if it was initialized
                if (this.cyclingLeadersComponent) {
                    this.cyclingLeadersComponent.close();
                }

                this.remove();
                delete this.$el;
                delete this.el;
            }
        });

        CyclingLeadersView = Backbone.View.extend({
            template: _.template($('#cyclingLeadersTemplate').html()),
            className: 'leaderboard-small-module',
            render: function () {
                var rankingCollection,
                    $rankingContainer,
                    self = this;

                this.childViews = [];
                this.$el.html(this.template(this.model.toJSON().me));

                rankingCollection = new Backbone.Collection(this.model.get('leaderboards')[0].entries);
                $rankingContainer = this.$el.find('.leaderboard-container');

                rankingCollection.each(function (boardUser) {
                    var rankingSingleView = new RankingSingleView({ model: boardUser });
                    $rankingContainer.append(rankingSingleView.render().el);
                    self.childViews.push(rankingSingleView);
                }, this);

                return this;
            },
            close: function () {
                // First check all the child views and delete them
                _.each(this.childViews, function (singleView) {
                    singleView.close();
                });

                this.remove();
                delete this.$el;
                delete this.el;
            }
        });

        RankingSingleView = Backbone.View.extend({
            template: _.template($('#rankingSingleViewTemplate').html()),
            className: 'leaderboard-list',
            tagName: 'ul',
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

        /**
        * Render module and return public interface
        */

        cyclingLeadersIntroComponent = new CyclingLeadersIntroView();
        $elementToAppendNextTo.after(cyclingLeadersIntroComponent.render().el);

        api = {
            'destroy' : function () {
                cyclingLeadersIntroComponent.close();
            },
            'getElement': function () {
                return cyclingLeadersIntroComponent.$el;
            }
        };

        return api;
    };


    module.exports = ActivityCyclingLeaders;
});