(function(App) {
    "use strict";
    var ActivityCyclingDetailRank = function($elementToAppendTo, statsData, leaderboardsData, userData, isBuild, unitOfMeasure, userGender) {
        var ActivityCyclingDetailRankView, RankingSingleView, rankModel, detailRankComponent;
        ActivityCyclingDetailRankView = Backbone.View.extend({
            className: "rank-container",
            template: _.template($("#cyclingDetailRankTemplate").html()),
            events: {
                "click .gender-filter a": "switchGender"
            },
            initialize: function() {
                var self = this;
                this.listenTo(Backbone.Events, "small-leaderboard:remove", function() {
                    self.close();
                });
            },
            render: function(stats, gender) {
                var rankingCollection, $rankingContainer, self = this, rank, jsonModel = this.model.toJSON();
                $.extend(jsonModel.me, {
                    displayName: "YOU",
                    image: APIEndpoint23 + "/me/picture"
                });
                this.childViews = [];
                this.$el.html(this.template(jsonModel.me));
                this.$el.find(".rank-value").text(isBuild === "True" ? "distance" : "energy");
                this.$el.find(".total").text(isBuild === "True" ? "total distance" : "total energy");
                rankingCollection = new Backbone.Collection(this.model.get("leaderboard"));
                console.log(stats, gender, jsonModel.me);
                if ((gender === "female" || gender === "male") && jsonModel.me) {
                    rank = jsonModel.me.genderRank;
                } else if (jsonModel.me) {
                    rank = jsonModel.me.classRank;
                }
                if (jsonModel.me && rank > jsonModel.leaderboard.length) {
                    rankingCollection.pop();
                }
                $rankingContainer = this.$el.find(".leaderboard-container");
                console.log(jsonModel.me && rank > jsonModel.leaderboard.length, rank, jsonModel.leaderboard.length);
                if (jsonModel.me && rank > jsonModel.leaderboard.length) {
                    var me = new Backbone.Model(jsonModel.me), meView = new RankingSingleView({
                        model: me
                    });
                    me.set("rank", rank);
                    $rankingContainer.append(meView.render(true).el);
                    self.childViews.push(meView);
                }
                rankingCollection.each(function(boardUser) {
                    var userRank;
                    if (gender === "male" || gender === "female") {
                        userRank = boardUser.get("genderRank");
                    } else {
                        userRank = boardUser.get("classRank");
                    }
                    boardUser.set("rank", userRank);
                    boardUser.set("image", APIEndpoint3 + "/pictures/" + boardUser.get("shareId"));
                    var rankingSingleView = new RankingSingleView({
                        model: boardUser
                    });
                    var highlightUser = false;
                    if (jsonModel.me && user) {
                        highlightUser = +boardUser.get("shareId") === +user.ShareId;
                        if (highlightUser) {
                            if (user.FacebookId) {
                                boardUser.set("image", "//graph.facebook.com/" + user.FacebookId + "/picture?type=square");
                            }
                            boardUser.set("displayName", "YOU");
                        }
                    }
                    $rankingContainer.append(rankingSingleView.render(highlightUser).el);
                    self.childViews.push(rankingSingleView);
                }, this);
                if (gender) {
                    var $fl = this.$el.find(".full-leaderboard");
                    $fl.attr("href", $fl.data("leaderboard") + (gender === "all" ? "" : "?gender=" + gender));
                    this.$el.find("[data-gender]").removeClass("selected");
                    this.$el.find('[data-gender="' + gender + '"]').addClass("selected");
                }
                return this;
            },
            refresh: function(stats, leaderboard, gender) {
                this.undelegateEvents();
                _.each(this.childViews, function(singleView) {
                    singleView.close();
                });
                this.model = new Backbone.Model(leaderboard);
                this.render(stats, gender);
                this.delegateEvents();
            },
            close: function() {
                _.each(this.childViews, function(singleView) {
                    singleView.close();
                });
                this.remove();
                delete this.$el;
                delete this.el;
            },
            switchGender: function(e) {
                e.preventDefault();
                var $currentOption = $(e.currentTarget);
                if (!$currentOption.hasClass("selected")) {
                    Backbone.Events.trigger("small-leaderboard:refresh", $currentOption.data("gender"));
                    $currentOption.addClass("selected").siblings().removeClass("selected");
                }
            }
        });
        RankingSingleView = Backbone.View.extend({
            template: _.template($("#cyclingDetailRankingSingleViewTemplate").html()),
            className: "leaderboard-list",
            tagName: "ul",
            render: function(highlight) {
                this.model.set("isBuild", isBuild === "True");
                var $unit = unitOfMeasure;
                if ($unit && $unit === "km") {
                    var dist = this.model.get("distance");
                    this.model.set("distance", EQ.Helpers.convertDistance(dist, "miles", "metric"));
                }
                this.$el.toggleClass("black-bg", !!highlight).html(this.template(this.model.toJSON()));
                return this;
            },
            close: function() {
                this.remove();
                delete this.$el;
                delete this.el;
            }
        });
        rankModel = new Backbone.Model(leaderboardsData);
        detailRankComponent = new ActivityCyclingDetailRankView({
            model: rankModel
        });
        if (leaderboardsData.userCount === 0) {
            detailRankComponent.remove();
        } else {
            if (userGender) {
                $elementToAppendTo.append(detailRankComponent.render(statsData, userGender).el);
            } else {
                $elementToAppendTo.append(detailRankComponent.render(statsData).el);
            }
        }
        return detailRankComponent;
    };
    App.Components["small-leaderboard"] = function($el, options) {
        var endpoint = {
            CLASS_STATS: function(classInstanceID) {
                return "/v3/classes/" + classInstanceID + "/me/statistics";
            },
            CLASS_RANKINGS: function(classInstanceID) {
                return "/v3/classes/" + classInstanceID + "/leaderboard";
            }
        };
        var userGender = userProfileJson.Gender && userProfileJson.Gender.toLowerCase();
        var xhrStats = EQ.Helpers.getService(endpoint.CLASS_STATS(options.classId)), xhrRankings, leaderboard, currentRankingXhr;
        if (userGender) {
            xhrRankings = EQ.Helpers.getService(endpoint.CLASS_RANKINGS(options.classId) + "/" + userGender, {
                numResults: 4
            });
        } else {
            xhrRankings = EQ.Helpers.getService(endpoint.CLASS_RANKINGS(options.classId), {
                numResults: 4
            });
        }
        EQ.Helpers.when(xhrStats, xhrRankings).done(function(response) {
            if (response[1].me !== null || response[1].userCount === 0) {
                if (userGender) {
                    leaderboard = new ActivityCyclingDetailRank($el, response[0], response[1], user, options.isBuild, options.UoM, userGender);
                } else {
                    leaderboard = new ActivityCyclingDetailRank($el, response[0], response[1], user, options.isBuild, options.UoM);
                }
                $el.data("small-leaderboard", leaderboard);
                Backbone.Events.trigger("small-leaderboard:ready");
            }
        });
        Backbone.Events.on("small-leaderboard:refresh", function(gender) {
            if (currentRankingXhr && currentRankingXhr.abort) {
                currentRankingXhr.abort();
            }
            leaderboard.$el.find(".leaderboard-container").html("");
            var loaderAndError = EQ.Helpers.loaderAndErrorHandler(leaderboard.$el.find(".leaderboard-container"), {
                errorTitle: "Error loading data from server. Please Retry."
            });
            loaderAndError.showLoader();
            var g = gender === "all" ? "" : "/" + gender;
            currentRankingXhr = EQ.Helpers.getService(endpoint.CLASS_RANKINGS(options.classId) + g, {
                numResults: 4
            });
            EQ.Helpers.when(xhrStats, currentRankingXhr).done(function(response) {
                loaderAndError.hideLoader();
                leaderboard.refresh(response[0], response[1], gender);
            }).fail(function() {
                loaderAndError.showError();
            });
        });
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
