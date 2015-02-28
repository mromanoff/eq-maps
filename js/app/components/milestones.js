(function (App) {
    'use strict';

    /* global EQ, debug, moment, userProfileJson */

    App.Components.milestones = function ($el) {

        /**
        * Models
        */

        var Milestone = Backbone.Model.extend();

        /**
        * Collections
        */

        var MilestoneCollection = Backbone.Collection.extend({
            model: Milestone
        });

        /**
        * Views
        */

        var MilestonesView = Backbone.View.extend({
            className: 'milestones-items-container',
            initialize: function (options) {
                this.options = options || {};
            },
            setHeaderBarColor: function () {
                for (var i = this.collection.models.length - 1; i >= 0; i--) {
                    if (this.collection.models[i].get('isAchieved') === true) {
                        var color = this.collection.models[i].get('color');

                        $('.milestones-header').css({'background-color': color});

                        return;
                    }
                }
            },
            render: function () {
                var totalMiles = this.options.totalMiles,
                    isTrackSet = false;

                this.setHeaderBarColor();

                this.collection.each(function (milestone) {
                    var hasTrack = false,
                        milestonesSingleView;

                    if (totalMiles < milestone.get('value') && isTrackSet === false) {
                        hasTrack = true;
                        isTrackSet = true;
                    }

                    milestonesSingleView = new MilestonesSingleView({
                        model: milestone,
                        hasTrack: hasTrack,
                        totalMiles: totalMiles,
                        collection: this.collection
                    });

                    this.$el.append(milestonesSingleView.render().el);

                    if (milestone === this.collection.first() && milestone.get('value') === 0.01) {
                        this.$el.find('.milestone-info h2').text('0');
                    }
                }, this);
                return this;
            }
        });

        var MilestoneTrackView = Backbone.View.extend({
            className: 'miles-track-container',
            template: _.template($('#milestoneTrack').html()),
            initialize: function (options) {
                this.options = options || {};
            },
            positionMilesTrack: function ($el) {
                var collectionModels = this.options.collection.models;

                for (var i = 0; i < collectionModels.length; i++) {
                    if (collectionModels[i].get('isAchieved') === true && collectionModels[i + 1] !== undefined && collectionModels[i + 1].get('isAchieved') === false) {
                        var milestoneStart = this.options.totalMiles - collectionModels[i].get('value'),
                            milestoneFinish = collectionModels[i + 1].get('value') - collectionModels[i].get('value'),
                            trackAxis = $(window).width() < 768 ? 'top' : 'left';

                        $el.css(trackAxis, (milestoneStart * 100) / milestoneFinish + '%');
                    }
                }
            },
            render: function () {
                this.$el.html(this.template());
                this.$el.find('.miles-traveled').attr('data-miles', EQ.Helpers.numbers.trimWithFlooring(this.options.totalMiles) + ' MI');
                this.positionMilesTrack(this.$el.find('.miles-track'));

                return this;
            }
        });

        var MilestonesSingleView = Backbone.View.extend({
            template: _.template($('#milestonesList').html()),
            events: {
                'click': 'viewMilestone'
            },
            initialize: function (options) {
                this.options = options || {};
            },
            getRenderData: function () {
                var data = this.model.toJSON();
                return _.extend(data, MilestoneViewHelpers);
            },
            render: function () {
                this.setElement(this.template(this.getRenderData()));

                if (this.options.hasTrack) {
                    var milestonetrackView = new MilestoneTrackView({
                        totalMiles: this.options.totalMiles,
                        collection: this.options.collection
                    });

                    this.$el.append(milestonetrackView.render().el);
                }

                MilestoneViewHelpers.setLockedMilestone(this.$el, this.model);
                MilestoneViewHelpers.checkMilestoneSize();

                return this;
            },
            viewMilestone : function () {
                var milestoneOverlaySettings,
                    name = this.model.get('name');

                name = name.indexOf('<BR>') !== -1 ? name.substr(0, name.indexOf('<BR>')) + '<br />' + name.substr(name.indexOf('<BR>') + 4, name.length) : name;

                if (this.model.get('isAchieved') !== true) {
                    return false;
                } else {
                    var achievedDate = moment(this.model.get('achievedDetail').dateAchieved),
                        milesValue = (this.model.get('value') === 0.01 ? 0 : this.model.get('value'));

                    milestoneOverlaySettings = {
                        name: name,
                        largeImageUrl: this.model.get('largeImageUrl'),
                        description: this.model.get('description'),
                        value: EQ.Helpers.numbers.trimDecimals(milesValue),
                        achievedDetail: this.model.get('achievedDetail'),
                        achievedDate: achievedDate.format('YYYY-MM-DD'),
                        id: this.model.get('achievedDetail').id,
                        shareImageUrl: this.model.get('shareImageUrl'),
                        twittershareCopy: this.model.get('twittershareCopy'),
                        facebookBlurbCopy: this.model.get('facebookBlurbCopy'),
                        facebookPostCopy: this.model.get('facebookPostCopy'),
                        typeId: this.model.get('typeId')
                    };

                    Backbone.Events.trigger('milestone-overlay:open', { settings: milestoneOverlaySettings });
                }
            }
        });

        var MilestoneOverlayView = Backbone.View.extend({
            className: 'milestones-overlay',
            events: {
                'click .close-modal': 'closeModal'
            },
            initialize: function (options) {
                var template;

                this.options = options || {};
                template = $('#unlockedMilestone').html();
                this.template = _.template(template);
            },
            closeModal: function (e) {
                e.preventDefault();
                this.$el.hide().remove();
            },
            socialShare: function (options) {
                debug('opt', options);

                App.loadComponent('share', $('.social-icons'), {
                    'type': 'share-milestone',
                    'fbMode': 'share-milestone',
                    'linkurl': '/users/' + userProfileJson.ShareId + '/milestones/' + options.settings.settings.achievedDetail.id,
                    'picture': options.settings.settings.shareImageUrl,
                    'title': options.settings.settings.name,
                    'name': options.settings.settings.value + ' MILES',
                    'twCopy': _.unescape(options.settings.settings.twittershareCopy).replace('&rsquo;', '\''),
                    'fbCopy': options.settings.settings.facebookPostCopy,
                    'fbBlurbCopy': options.settings.settings.facebookBlurbCopy
                });

            },
            render: function () {
                this.$el.html(this.template(this.options.settings.settings)).show().appendTo($('.page'));
                this.socialShare(this.options);

                return this;
            }
        });

        /**
        * View Helpers
        */

        var MilestoneViewHelpers = {
            setLockedMilestone: function (milestone, data) {
                if (data.get('isAchieved') !== true) {
                    milestone.find('img.hidden').removeClass('hidden');
                    milestone.find('.milestone-icon > img:first-child').addClass('hidden');
                    milestone.addClass('locked');
                }
            },
            checkMilestoneSize: function () {
                return this.showMilestoneImageLarge === true ? '' : 'small';
            }
        };

        var MileStonesHeroView = Backbone.View.extend({
            events: {
                'click .icon-left-arrow': 'goBack'
            },
            render: function () {
                return this;
            },
            initialize: function (options) {
                this.options = options || {};
            },
            goBack: function (e) {
                e.preventDefault();
                Backbone.history.history.back();

            }
        });

        var mileStonesHeroView = new MileStonesHeroView({ el: $('.cycling-milestones-hero') });
        mileStonesHeroView.render();
        EQ.Helpers.getService('/v3/me/activity/cycling/milestones').done(function (data) {
            debug('milestones', data);

            // Set milestones header data
            $('.milestones-header li[data-type="milestones-achieved"]').append('<h2>' + data.totalAchievements + '</h2>');
            $('.milestones-header li[data-type="total-miles"]').append('<h2>' + EQ.Helpers.numbers.getOneDecimal(EQ.Helpers.numbers.trimWithFlooring(data.totalMiles)) + '</h2>');

            var milestonesCollection = new MilestoneCollection(data.milestones),
                milestoneListView = new MilestonesView({ totalMiles: data.totalMiles, collection: milestonesCollection });

            $el.find('.milestones-list').append(milestoneListView.render().el);

            // Show milestone overlay
            Backbone.Events.on('milestone-overlay:open', function (settings) {
                var milestoneOverlayView = new MilestoneOverlayView({ settings: settings, totalMiles: data.totalMiles, collection: milestonesCollection });

                milestoneOverlayView.render();
            });
        });
    };

} (window.App));
