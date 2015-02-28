(function(global, App) {
    "use strict";
    var Backbone = global.Backbone, _ = global._;
    var FBfriend = Backbone.Model.extend({
        defaults: {
            firstName: "",
            lastName: "",
            homeFacilityName: "",
            facility: {
                id: null,
                clubId: null,
                name: "",
                shortName: "",
                mobileName: null,
                urlName: null,
                webName: null,
                timeZoneId: null
            }
        }
    });
    var FBfriendWithClasses = Backbone.Model.extend();
    var FriendsCollection = Backbone.Collection.extend({
        model: FBfriend
    });
    var FriendsWithClassesCollection = Backbone.Collection.extend({
        model: FBfriendWithClasses
    });
    var ClassSingleViewHelpers = {
        getDateString: function(dateString) {
            return EQ.Helpers.dateTime.convertDateToString(dateString);
        },
        getInstructors: function(instructors) {
            var instructorsString;
            if (instructors.length) {
                _.each(instructors, function(instructor) {
                    instructorsString = instructor.instructor.firstName + " " + instructor.instructor.lastName;
                });
            }
            return instructorsString;
        },
        getEventDuration: function(eventDetail) {
            return EQ.Helpers.dateTime.getTimeRange(eventDetail.startDate, eventDetail.endDate);
        },
        formatDisplayTime: function(displayTimeString) {
            return EQ.Helpers.dateTime.formatDisplayTime(displayTimeString);
        }
    };
    var NoFriendsView = Backbone.View.extend({
        el: "section.no-friends",
        render: function() {
            this.$el.removeClass("is-hidden");
        }
    });
    var FriendsOnEQView = Backbone.View.extend({
        el: "section.friends-whithout-classes",
        events: {
            "click .icon-right-arrow": "goToNext",
            "click .icon-left-arrow": "goToPrev"
        },
        goToNext: function(e) {
            e.preventDefault();
            var $carousel = this.$el.find(".fb-friends-list .friends-carousel");
            $carousel.data("owlCarousel").next();
        },
        goToPrev: function(e) {
            e.preventDefault();
            var $carousel = this.$el.find(".fb-friends-list .friends-carousel");
            $carousel.data("owlCarousel").prev();
        },
        showHideArrows: function() {
            var $carousel = this.$el.find(".fb-friends-list .friends-carousel");
            if ($carousel.data("owlCarousel").itemsAmount > $carousel.data("owlCarousel").visibleItems.length) {
                this.$el.find(".navigation").removeClass("hidden");
            } else {
                this.$el.find(".navigation").addClass("hidden");
            }
        },
        updateFriendsCount: function() {
            var $friendsNumber = this.$el.find("span.friendsNumber"), $friendsTag = this.$el.find("span.friendsTag"), $friendsIsAre = this.$el.find("span.friendsIsAre");
            $friendsNumber.text(this.collection.length);
            if (this.collection.length > 1) {
                $friendsTag.text("friends");
                $friendsIsAre.text("are");
            } else {
                $friendsTag.text("friend");
                $friendsIsAre.text("is");
            }
        },
        render: function() {
            var self = this, $carousel = this.$el.find(".fb-friends-list .friends-carousel");
            this.updateFriendsCount();
            this.collection.each(function(fbFriend) {
                var friendsOnEQSimpleView = new FriendsOnEQSimpleView({
                    model: fbFriend
                });
                $carousel.append(friendsOnEQSimpleView.render().el);
            }, this);
            if (this.collection.length === 1) {
                this.$el.find(".icon-right-arrow").addClass("hidden");
            }
            this.$el.removeClass("is-hidden");
            App.loadComponent("owl-slider", $carousel, {
                singleItem: false,
                items: 3,
                itemsDesktop: [ 1200, 3 ],
                itemsTablet: [ 1023, 2 ],
                itemsMobile: [ 768, 1 ],
                afterInit: function() {
                    setTimeout(function() {
                        self.showHideArrows();
                    }, 2e3);
                },
                afterUpdate: function() {
                    self.showHideArrows();
                }
            });
            return this;
        }
    });
    var FriendsOnEQSimpleView = Backbone.View.extend({
        tagName: "ul",
        template: _.template($("#fbFriendTemplate").html()),
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });
    var FriendsWithClassesView = Backbone.View.extend({
        el: "section.many-friends-classes",
        events: {
            "click .choose-friends": "chooseFriends",
            "click .icon-right-arrow": "goToNext",
            "click .icon-left-arrow": "goToPrev"
        },
        goToNext: function(e) {
            e.preventDefault();
            var $carousel = this.$el.find(".fb-modules-container");
            $carousel.data("owlCarousel").next();
        },
        goToPrev: function(e) {
            e.preventDefault();
            var $carousel = this.$el.find(".fb-modules-container");
            $carousel.data("owlCarousel").prev();
        },
        chooseFriends: function(e) {
            e.preventDefault();
            debug("[CHOOSE FRIENDS TRIGGERED]");
        },
        showHideArrows: function() {
            var $carousel = this.$el.find(".fb-modules-container");
            if ($carousel.data("owlCarousel").itemsAmount > $carousel.data("owlCarousel").visibleItems.length) {
                this.$el.find(".navigation").removeClass("hidden");
            } else {
                this.$el.find(".navigation").addClass("hidden");
            }
        },
        render: function() {
            var $carousel = this.$el.find(".fb-modules-container"), self = this;
            this.collection.each(function(fbFriendWithClasses) {
                var friendsWithClassesSimpleView = new FriendsWithClassesSimpleView({
                    model: fbFriendWithClasses
                });
                $carousel.append(friendsWithClassesSimpleView.render().el);
            }, this);
            if (this.collection.length === 1) {
                this.$el.find(".icon-right-arrow").addClass("hidden");
            }
            App.loadComponent("owl-slider", $carousel, {
                singleItem: false,
                items: 3,
                itemsDesktop: [ 1200, 3 ],
                itemsTablet: [ 1023, 2 ],
                itemsMobile: [ 768, 1 ],
                autoHeight: false,
                afterInit: function() {
                    setTimeout(function() {
                        self.showHideArrows();
                    }, 2e3);
                },
                afterUpdate: function() {
                    self.showHideArrows();
                }
            });
            this.$el.removeClass("is-hidden");
            return this;
        }
    });
    var OneFriendWithClassesView = Backbone.View.extend({
        el: "section.one-friend-class",
        events: {
            "click .choose-friends": "chooseFriends"
        },
        chooseFriends: function() {
            debug("[CHOOSE FRIENDS TRIGGERED]");
        },
        render: function() {
            this.collection.each(function(fbFriendWithClasses) {
                var friendsWithClassesSimpleView = new FriendsWithClassesSimpleView({
                    model: fbFriendWithClasses
                });
                this.$el.find(".left-container").append(friendsWithClassesSimpleView.render().el);
            }, this);
            this.$el.removeClass("is-hidden");
            return this;
        }
    });
    var FriendsWithClassesSimpleView = Backbone.View.extend({
        tagName: "div",
        className: "fb-class-container",
        template: _.template($("#fbFriendWithClassesTemplate").html()),
        events: {
            "click a.add-class": "addClass"
        },
        getRenderData: function() {
            var data = {};
            data = this.model.toJSON();
            return _.extend(data, ClassSingleViewHelpers);
        },
        buildLoader: function() {
            var loaderAndError;
            if (this.loaderAndError) {
                return this.loaderAndError;
            } else {
                loaderAndError = EQ.Helpers.loaderAndErrorHandler(this.$el, {
                    type: "overlay",
                    color: "black"
                });
                this.loaderAndError = loaderAndError;
                return loaderAndError;
            }
        },
        addClass: function(e) {
            e.preventDefault();
            var classInfo = this.model.get("classInfo"), ENDPOINT, that = this, $link = that.$el.find("a.add-class"), $message = that.$el.find(".message");
            debug("AddClass", classInfo);
            ENDPOINT = APIEndpoint26 + "/me/calendar/" + classInfo.classInstanceId + "?isRecurring=false";
            var loaderAndError = that.buildLoader();
            loaderAndError.showLoader();
            var currentDateTime = classInfo.facilityCurrentDateTime;
            $.ajax({
                type: "POST",
                url: ENDPOINT,
                contentType: "application/json",
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function(data) {
                    debug("[ADDCLASS OK]", data);
                    window.tagData.classAction = window.tagData.classAction || {};
                    window.tagData.classAction = {
                        module: "social"
                    };
                    var timeOffset = moment(data.result.startDate).diff(currentDateTime, "hours"), timeOffsetMinutes = moment(data.result.startDate).diff(currentDateTime, "minutes");
                    if (timeOffset || timeOffsetMinutes) {
                        if (timeOffset > 0) {
                            timeOffset = Math.floor(timeOffset);
                        } else {
                            timeOffset = Math.ceil(timeOffset);
                        }
                        if (timeOffset === 0) {
                            if (timeOffsetMinutes > 0) {
                                timeOffset = 1;
                            } else {
                                timeOffset = -1;
                            }
                        }
                    }
                    window.tagData.classInstance = window.tagData.classInstance || {};
                    window.tagData.classInstance = {
                        classId: data ? data.result.classId !== "" && data.result.classId !== null ? data.result.classId.toString() : "" : "",
                        facilityId: data ? data.result.facility !== "" && data.result.facility !== null ? EQ.Helpers.getFacilityIdFromClubId(data.result.facility) : "" : "",
                        classInstanceId: data ? data.result.classInstanceId !== "" && data.result.classInstanceId !== null ? data.result.classInstanceId.toString() : "" : "",
                        categoryId: data ? data.result.workoutCategoryId !== "" && data.result.workoutCategoryId !== null ? data.result.workoutCategoryId.toString() : "" : "",
                        timeOffset: timeOffset ? timeOffset.toString() : ""
                    };
                    window.track("classCalendarAdd", window.tagData.classAction);
                    loaderAndError.hideLoader();
                    that.$el.find("a.add-class").remove();
                },
                error: function(d) {
                    debug("server error", d);
                    loaderAndError.hideLoader();
                    $link.remove();
                    $message.find(".copy").html("<p><strong></strong></p>").find("strong").text(d.responseJSON.error.message || d.responseJSON.message);
                    $message.addClass("bike").removeClass("closed");
                    setTimeout(function() {
                        $message.addClass("closed");
                    }, 5e3);
                }
            });
        },
        render: function() {
            this.$el.html(this.template(this.getRenderData()));
            return this;
        }
    });
    var FacebookClasses = {};
    FacebookClasses.init = function($el) {
        debug("[Facebook Classes] ", FacebookClasses);
        var $connectSection = $el.find("section.fb-friends-container"), $connectButton = $connectSection.find(".button");
        if (window.userProfileJson.FacebookId !== null) {
            var endDate = moment().add("weeks", 1), userInfo = {
                maxNumberOfRecords: 10,
                startDate: moment().format(),
                endDate: endDate.format()
            };
            this.getSocialActivitiesByUserInfo({
                userInfo: userInfo
            }, $connectSection, $connectButton);
        } else {
            $connectButton.on("click", function(e) {
                e.preventDefault();
                FacebookClasses.connect($connectSection, $connectButton);
            });
            window.tagData.socialStat = window.tagData.socialStat || {};
            window.tagData.socialStat = {
                eqxFriends: "zero",
                eqxFriendsWithClasses: "zero",
                asset: "not-connected"
            };
            window.track("socialModuleRender", window.tagData.socialStat);
        }
    };
    FacebookClasses.getToken = function(cb) {
        FB.login(function(response) {
            if (response.status === "connected") {
                cb(response.authResponse.accessToken);
            }
        }, {
            scope: "email,user_likes,user_friends"
        });
    };
    FacebookClasses.connect = function($connectSection, $connectButton) {
        if (window.userProfileJson.FacebookId !== null) {
            var endDate = moment().add("weeks", 1), userInfo = {
                maxNumberOfRecords: 10,
                startDate: moment().format(),
                endDate: endDate.format()
            };
            this.getSocialActivitiesByUserInfo({
                userInfo: userInfo
            }, $connectSection, $connectButton);
        } else {
            var self = this;
            this.getToken(function(token) {
                debug("FBT:", token);
                var endDate = moment().add("weeks", 1), userInfo = {
                    facebookAccessToken: token,
                    maxNumberOfRecords: 10,
                    startDate: moment().format(),
                    endDate: endDate.format()
                };
                self.getSocialActivitiesByUserInfo({
                    userInfo: userInfo
                }, $connectSection, $connectButton);
            });
        }
    };
    FacebookClasses.prepareDataForUsersWitClasses = function(rawClassesData) {
        var friendsWithClasses = [];
        _.each(rawClassesData, function(rawClass) {
            if (rawClass.friends && rawClass.friends.length > 0) {
                var friend = rawClass.friends[0];
                friend.others = rawClass.friends.length - 1;
                delete rawClass.friends;
                friend.classInfo = rawClass;
                friendsWithClasses.push(friend);
            }
        });
        return friendsWithClasses;
    };
    FacebookClasses.getSocialActivitiesByUserInfo = function(dataUserInfo, $connectSection, $connectButton) {
        var loaderAndError = EQ.Helpers.loaderAndErrorHandler($connectButton, {
            type: "button",
            errorTitle: "Error",
            color: "black"
        });
        loaderAndError.showLoader();
        $.ajax(APIEndpoint + "/me/calendar/social-activities", {
            data: JSON.stringify(dataUserInfo.userInfo),
            contentType: "application/json",
            type: "POST",
            xhrFields: {
                withCredentials: true
            }
        }).done(function(data) {
            debug("SOCIAL ACTIVITIES", data);
            $connectSection.addClass("hidden");
            window.tagData.socialStat = window.tagData.socialStat || {};
            window.tagData.socialStat = {
                eqxFriends: data ? data.fbFriendsOnEQ !== "" && data.fbFriendsOnEQ.hasFriends === true ? data.fbFriendsOnEQ.totalFBFriends.toString() : "zero" : "zero",
                eqxFriendsWithClasses: data ? (data.fbFriendsOnEQ.classesWithFriends !== "" && data.fbFriendsOnEQ.classesWithFriends !== null ? _.chain(data.fbFriendsOnEQ.classesWithFriends).map(function(item) {
                    return item.friends[0].userId;
                }).uniq().value().length : "zero") === 0 ? "zero" : _.chain(data.fbFriendsOnEQ.classesWithFriends).map(function(item) {
                    return item.friends[0].userId;
                }).uniq().value().length.toString() : "zero"
            };
            if (data && data.fbFriendsOnEQ.hasFriends !== false) {
                if (data.fbFriendsOnEQ.classesWithFriends.length !== 0) {
                    window.tagData.socialStat.asset = "connected-hasclasses";
                } else {
                    window.tagData.socialStat.asset = "connected-noclasses";
                }
            } else {
                window.tagData.socialStat.asset = "connected-nofriends";
            }
            window.track("socialModuleRender", window.tagData.socialStat);
            loaderAndError.hideLoader();
            if (window.userProfileJson.FacebookId === null) {
                try {
                    EQ.Helpers.refreshUserCacheData();
                } catch (e) {
                    console.log(e);
                }
            }
            if (data.fbFriendsOnEQ.hasFriends === false) {
                var noFriendsView = new NoFriendsView();
                noFriendsView.render();
            } else if (data.fbFriendsOnEQ.classesWithFriends.length > 0) {
                var usersWithClassesData, friendsWithClassesCollection, friendsWithClassesView;
                usersWithClassesData = FacebookClasses.prepareDataForUsersWitClasses(data.fbFriendsOnEQ.classesWithFriends);
                friendsWithClassesCollection = new FriendsWithClassesCollection(usersWithClassesData);
                if (usersWithClassesData.length > 1) {
                    friendsWithClassesView = new FriendsWithClassesView({
                        collection: friendsWithClassesCollection
                    });
                } else {
                    friendsWithClassesView = new OneFriendWithClassesView({
                        collection: friendsWithClassesCollection
                    });
                }
                friendsWithClassesView.render();
            } else {
                var friendsCollection = new FriendsCollection(data.fbFriendsOnEQ.fbFriends), friendsOnEQView = new FriendsOnEQView({
                    collection: friendsCollection
                });
                friendsOnEQView.render();
            }
        }).fail(function(data) {
            var failedResponse = data.responseJSON;
            var errorMessage = failedResponse.error ? failedResponse.error.message : failedResponse.message;
            if (failedResponse.error && failedResponse.error.messageId === 50019) {
                FB.api("/me", function(profileResponse) {
                    global.location.href = "/login/connect?firstName=" + profileResponse.first_name + "&lastName=" + profileResponse.last_name;
                });
            } else {
                $(".fb-error").text(errorMessage);
            }
            debug("Server Error");
            loaderAndError.showError();
        });
    };
    App.Components["social-activity"] = function($el) {
        FacebookClasses.init($el);
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
