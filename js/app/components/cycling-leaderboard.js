(function (global, App) {
    'use strict';

    /* global EQ, APIEndpoint3 */

    var CyclingLeaderboard = {},
        CyclingLeaderboardView,
        CyclingLeaderboardHeroView,
        RankingSingleView,
        classId,
        isFiltered = false,
        endpoint = {
            CLASS_RANKINGS: function (classInstanceID, gender) { return (typeof gender !== 'string') ? '/v3/classes/' + classInstanceID + '/leaderboard' : '/v3/classes/' + classInstanceID + '/leaderboard/' + gender; }
        };

    CyclingLeaderboard.init = function (id, gender) {
        var cyclingLeaderboardHero,
            leaderboardData = EQ.Helpers.getService(endpoint.CLASS_RANKINGS(id, gender)),
            self = this;

        classId = id;
        cyclingLeaderboardHero = new CyclingLeaderboardHeroView();
        self.showLoader();
        EQ.Helpers.when(leaderboardData).done(function (response) {
            self.hideLoader();
            if (typeof gender === 'string') {
                isFiltered = true;
                CyclingLeaderboard.changeFilter($('a[data-filter=' + gender + ']'));
            }
            self.displayData(response);
        });
    };

    CyclingLeaderboard.displayData = function (response) {
        var cyclingLeadersComponent,
            cyclingLeadersModel = new Backbone.Model(response);

        cyclingLeadersComponent = new CyclingLeaderboardView({ model: cyclingLeadersModel });
    };

    CyclingLeaderboard.buildLoader = function () {
        var loaderAndError;

        if (this.loaderAndError) {
            return this.loaderAndError;
        } else {
            loaderAndError = EQ.Helpers.loaderAndErrorHandler($('#leaderboard-loader'), {
                color: 'black'
            });
            this.loaderAndError = loaderAndError;
            return loaderAndError;
        }
    };

    CyclingLeaderboard.showLoader = function () {
        var loader = this.buildLoader();
        $('#leaderboard-loader').show();
        loader.showLoader();
    };

    CyclingLeaderboard.hideLoader = function () {
        $('#leaderboard-loader').hide();
        this.loaderAndError.hideLoader();
    };

    CyclingLeaderboard.changeFilter = function (el) {
        el.parent().parent().find('a.filter').removeClass('active');
        el.addClass('active');
    };

    CyclingLeaderboardHeroView = Backbone.View.extend({
        el: $('#leaderboard-hero'),
        template: _.template($('#cyclingLeaderboardHero').html()),
        initialize: function () {
            this.render();
        },
        events: {
            'click a.filter': 'filter'
        },
        filter: function (e) {
            var $this = $(e.target),
                leaderboardData,
                f;
            e.preventDefault();

            if (!$this.hasClass('active')) {
                f = $this.attr('data-filter');
                isFiltered = (f) ? true : false;
                leaderboardData = EQ.Helpers.getService(endpoint.CLASS_RANKINGS(classId, f));
                CyclingLeaderboard.showLoader();
                EQ.Helpers.when(leaderboardData).done(function (response) {
                    CyclingLeaderboard.hideLoader();
                    CyclingLeaderboard.displayData(response);
                });
                CyclingLeaderboard.changeFilter($this);
            }
        },
        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });

    CyclingLeaderboardView = Backbone.View.extend({
        el: $('#leaderboard-container'),
        template: _.template($('#cyclingLeaderboardTemplate').html()),
        initialize: function () {
            this.render();
        },
        render: function () {
            var rankingCollection = new Backbone.Collection(this.model.get([0]).leaderboard),
                userData = this.model.get([0]).me,
                rankingSingleView,
                $rankingContainer,
                className,
                userRank,
                row = 1;

            this.$el.html(this.template(this.model.toJSON().me));
            $rankingContainer = this.$el.find('tbody');
            
            if (userData !== null) {
                userRank = (isFiltered) ? userData.genderRank : userData.classRank;
            }

            rankingCollection.each(function (user) {
                var rank = (isFiltered) ? user.attributes.genderRank : user.attributes.classRank;
                user.attributes.image = APIEndpoint3 + '/pictures/' + user.attributes.shareId;
                user.attributes.distance = (user.attributes.distance) ? user.attributes.distance.toFixed(2) : 0;
                user.attributes.energy = (user.attributes.energy) ? Math.round(user.attributes.energy) : 0;
                user.attributes.rank = rank;
                className = (row % 2) ? 'odd-row' : 'even-row';
                if (userData !== null && rank === userRank) {
                    className = 'me';
                    user.attributes.displayName = 'You';
                }
                rankingSingleView = new RankingSingleView({ model: user, className: className });
                $rankingContainer.append(rankingSingleView.render().el);
                row++;
            }, this);

            return this;
        }
    });

    RankingSingleView = Backbone.View.extend({
        template: _.template($('#cyclingLeaderboardUserTemplate').html()),
        tagName: 'tr',
        initialize: function (options) {
            this.className = options.className;
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Components['cycling-leaderboard'] = function (id, n) {
        CyclingLeaderboard.init(id, n);
    };

}(window, window.App));