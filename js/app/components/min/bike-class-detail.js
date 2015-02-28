(function(global, App) {
    "use strict";
    var Backbone = global.Backbone, _ = global._;
    var Bike = Backbone.Model.extend(), Door = Backbone.Model.extend(), Instructor = Backbone.Model.extend(), ClassInfoModel = Backbone.Model.extend({
        defaults: {
            clubId: "",
            clubName: "",
            id: "",
            name: "",
            instructorName: "",
            date: "",
            time: "",
            reservation: ""
        }
    }), ConfirmationModel = Backbone.Model.extend();
    var BikesCollection = Backbone.Collection.extend({
        model: Bike
    });
    var DoorsCollection = Backbone.Collection.extend({
        model: Door
    });
    var InstructorsCollection = Backbone.Collection.extend({
        model: Instructor
    });
    var ClassDetail = Backbone.Model.extend();
    var BikesMapView = Backbone.View.extend({
        initialize: function(options) {
            this.options = options || {};
        },
        adjustMapHeight: function() {
            var mapWidth = this.$el.width(), mapHeight = Math.floor(mapWidth * this.options.mapHeight / this.options.mapWidth + 130);
            this.$el.height(mapHeight);
        },
        drawMap: function(loader) {
            var isSelectingFavorite = false, mapWidth = this.options.mapWidth, mapHeight = this.options.mapHeight;
            if (this.options.isSelectingFavorite && this.options.isSelectingFavorite === true) {
                isSelectingFavorite = true;
            }
            this.adjustMapHeight();
            this.collection.each(function(item) {
                var mapSingleView;
                switch (this.options.type) {
                  case "doors":
                    mapSingleView = new DoorMapSingleView({
                        model: item,
                        mapWidth: mapWidth,
                        mapHeight: mapHeight
                    });
                    break;

                  case "instructors":
                    mapSingleView = new InstructorMapSingleView({
                        model: item,
                        mapWidth: mapWidth,
                        mapHeight: mapHeight
                    });
                    break;

                  case "bikes":
                    mapSingleView = new BikeMapSingleView({
                        model: item,
                        mapWidth: mapWidth,
                        mapHeight: mapHeight,
                        isSelectingFavorite: isSelectingFavorite,
                        facilityId: this.options.facilityId,
                        loader: loader
                    });
                    break;
                }
                this.$el.append(mapSingleView.render().el);
            }, this);
        },
        render: function() {
            var that = this, loaderAndError = null;
            if (this.options.hasLoader === true) {
                loaderAndError = EQ.Helpers.loaderAndErrorHandler(this.$el, {
                    type: "popup"
                });
            }
            this.drawMap(loaderAndError);
            $(window).on("resize", _.debounce(function() {
                $(".bikes-graphic").empty();
                setTimeout(function() {
                    that.drawMap(loaderAndError);
                }, 100);
            }, 1e3));
            return this;
        }
    });
    var BikeMapSingleView = Backbone.View.extend({
        initialize: function(options) {
            this.options = options || {};
        },
        className: "bike",
        render: function() {
            var bike = this.model, bikeLeft = Math.floor(bike.get("studioGridX") * 100 / this.options.mapWidth), bikeTop = Math.floor(bike.get("studioGridY") * 100 / this.options.mapHeight), that = this;
            this.$el.html(bike.get("localId"));
            var isDisable = bike.get("isDisabled");
            this.$el.css({
                top: bikeTop + "%",
                left: bikeLeft + "%"
            });
            if (!this.options.isSelectingFavorite) {
                if (BikeClassDetail.favBike === that.model.get("localId")) {
                    this.$el.addClass("favorite-bike icon-star");
                }
                if (!isDisable) {
                    if (that.model.get("reservedByUserSecId") && BikeClassDetail.reservation.result && that.model.get("reserved")) {
                        if (that.model.get("localId") === BikeClassDetail.reservation.result.localId) {
                            this.$el.addClass("selected");
                        } else {
                            this.$el.addClass("unavailable");
                        }
                    } else if (that.model.get("reservedByUserSecId")) {
                        this.$el.addClass("unavailable");
                    } else if (!that.model.get("reserved") && !BikeClassDetail.reservation.result) {
                        this.$el.on("click", function(e) {
                            e.preventDefault();
                            App.Events.trigger("selectBike", {
                                bikeId: that.model.get("localId"),
                                reservableEquipId: that.model.get("reservableEquipId"),
                                loader: that.options.loader
                            });
                        });
                    } else if (!that.model.get("reserved") && BikeClassDetail.reservation.result && that.model.get("localId") !== BikeClassDetail.reservation.result.localId) {
                        this.$el.on("click", function(e) {
                            e.preventDefault();
                            App.Events.trigger("switchBike", {
                                bikeId: that.model.get("localId"),
                                reservableEquipId: that.model.get("reservableEquipId"),
                                loader: that.options.loader
                            });
                        });
                    }
                } else {
                    this.$el.addClass("unavailable");
                }
            } else {
                this.$el.on("click", function(e) {
                    e.preventDefault();
                    App.Events.trigger("selectFavoriteBike", {
                        bikeId: that.model.get("localId"),
                        reservableEquipId: that.model.get("reservableEquipId"),
                        facilityId: that.options.facilityId
                    });
                });
            }
            return this;
        }
    });
    var DoorMapSingleView = Backbone.View.extend({
        initialize: function(options) {
            this.options = options || {};
        },
        className: "door icon-door",
        render: function() {
            var door = this.model, doorLeft = Math.floor(door.get("studioGridX") * 100 / this.options.mapWidth), doorTop = Math.floor(door.get("studioGridY") * 100 / this.options.mapHeight), that = this;
            that.$el.css({
                top: doorTop + "%",
                left: doorLeft + "%"
            });
            return that;
        }
    });
    var InstructorMapSingleView = Backbone.View.extend({
        initialize: function(options) {
            this.options = options || {};
        },
        className: "instructor-bike",
        template: _.template($("#InstructorSingleTemplate").html()),
        render: function() {
            var instructor = this.model, instructorLeft = Math.floor(instructor.get("studioGridX") * 100 / this.options.mapWidth), instructorTop = Math.floor(instructor.get("studioGridY") * 100 / this.options.mapHeight), that = this;
            that.$el.html(that.template());
            that.$el.css({
                top: instructorTop + "%",
                left: instructorLeft + "%"
            });
            return that;
        }
    });
    var BikesListView = Backbone.View.extend({
        initialize: function(options) {
            this.options = options || {};
        },
        render: function() {
            var isSelectingFavorite = false;
            if (this.options.isSelectingFavorite && this.options.isSelectingFavorite === true) {
                isSelectingFavorite = true;
            }
            this.collection.each(function(bike) {
                var bikeListSingleView = new BikeListSingleView({
                    model: bike,
                    reservation: this.options.reservation,
                    isSelectingFavorite: this.options.isSelectingFavorite,
                    facilityId: this.options.facilityId
                });
                this.$el.append(bikeListSingleView.render().el);
            }, this);
            return this;
        }
    });
    var BikeListSingleView = Backbone.View.extend({
        initialize: function(options) {
            this.options = options || {};
        },
        tagName: "li",
        template: _.template($("#bikeListSingleTemplate").html()),
        buildLoader: function() {
            var loaderAndError;
            if (this.loaderAndError) {
                return this.loaderAndError;
            } else {
                loaderAndError = EQ.Helpers.loaderAndErrorHandler(this.$el.find("a"), {
                    type: "button",
                    color: "black"
                });
                this.loaderAndError = loaderAndError;
                return loaderAndError;
            }
        },
        render: function() {
            var that = this;
            this.$el.html(this.template(this.model.toJSON()));
            if (!this.options.isSelectingFavorite) {
                if (that.model.get("reservedByUserSecId") && BikeClassDetail.reservation.result && that.model.get("reserved")) {
                    if (that.model.get("localId") === BikeClassDetail.reservation.result.localId) {
                        $(".bike-list-view").prepend('<li class="selected-bike"><a href="#">My Bike <span>(#' + that.model.get("localId") + ")</span></a></li>");
                        this.$el.on("click", function(e) {
                            e.preventDefault();
                        });
                    } else {
                        this.$el.addClass("unavailable");
                        this.$el.on("click", function(e) {
                            e.preventDefault();
                        });
                    }
                } else if (that.model.get("reservedByUserSecId")) {
                    this.$el.addClass("unavailable");
                    this.$el.on("click", function(e) {
                        e.preventDefault();
                    });
                } else if (!that.model.get("reserved") && !BikeClassDetail.reservation.result) {
                    this.$el.on("click", function(e) {
                        e.preventDefault();
                        var loaderAndError = that.buildLoader();
                        loaderAndError.showLoader();
                        App.Events.trigger("selectBike", {
                            bikeId: that.model.get("localId"),
                            reservableEquipId: that.model.get("reservableEquipId"),
                            loader: loaderAndError
                        });
                    });
                } else if (!that.model.get("reserved") && BikeClassDetail.reservation.result && that.model.get("localId") !== BikeClassDetail.reservation.result.localId) {
                    this.$el.on("click", function(e) {
                        e.preventDefault();
                        var loaderAndError = that.buildLoader();
                        loaderAndError.showLoader();
                        App.Events.trigger("switchBike", {
                            bikeId: that.model.get("localId"),
                            reservableEquipId: that.model.get("reservableEquipId"),
                            loader: loaderAndError
                        });
                    });
                }
            } else {
                this.$el.on("click", function(e) {
                    e.preventDefault();
                    var loaderAndError = that.buildLoader();
                    loaderAndError.showLoader();
                    App.Events.trigger("selectFavoriteBike", {
                        bikeId: that.model.get("localId"),
                        reservableEquipId: that.model.get("reservableEquipId"),
                        facilityId: that.options.facilityId,
                        loader: loaderAndError
                    });
                });
            }
            return this;
        }
    });
    var MessageGeneralInfo = Backbone.View.extend({
        events: {
            "click .expand": "toggleInfo"
        },
        toggleInfo: function() {
            this.$el.find(".expand").toggleClass("active");
        }
    });
    var BikeClassInfoView = Backbone.View.extend({
        el: ".details .description",
        template: _.template($("#bikeClassInfoTemplate").html()),
        events: {
            "click a.cancel-bike": "cancelBike"
        },
        cancelBike: function(e) {
            e.preventDefault();
            var that = this;
            window.tagData = window.tagData || {};
            ModalClass.modalWindowView.openModal("cancelBikeModalSingleViewTemplate").find(".cancel-confirm").on("click", function(e) {
                e.preventDefault();
                $(this).off("click");
                BikeClassDetail.cancelBike(that.model.get("selectedBikeId"), that.model.get("reservation").result.reservationId);
            });
            window.tagData.bikeAction = {
                action: "delete-start",
                bikeSelectionMethod: ""
            };
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.find("#bike-more-info-button").attr("href", "/groupfitness/" + BikeClassDetail.classInstance);
            return this;
        }
    });
    var BikeClassConfirmationView = Backbone.View.extend({
        el: ".page .book",
        template: _.template($("#bikeConfirmationScreen").html()),
        events: {
            "click a.cancel-bike": "cancelBike",
            "click a.export": "exportToCalendar"
        },
        cancelBike: function(e) {
            e.preventDefault();
            ModalClass.modalWindowView.openModal("cancelBikeModalSingleViewTemplate").find(".cancel-confirm").on("click", function(e) {
                e.preventDefault();
                $(this).off("click");
                BikeClassDetail.cancelBike();
            });
            window.tagData = window.tagData || {};
            window.tagData.bikeAction = {
                action: "delete-start",
                bikeSelectionMethod: ""
            };
        },
        exportToCalendar: function() {
            $("a.export").attr("href", APIEndpoint + "/ME/CALENDAR/EVENTS/" + BikeClassDetail.classInstance + "/EXPORT/ICS?exportType=classInstance");
            window.tagData.exportToCal = window.tagData.exportToCal || {};
            window.tagData.exportToCal = {
                action: "export-complete",
                type: "class"
            };
            window.track("exportToCal", window.tagData.exportToCal);
        },
        render: function() {
            var ENDPOINT = APIEndpoint26 + "/me/preferences/bike/";
            $("body, html").animate({
                scrollTop: 0
            });
            this.$el.html(this.template(this.model.toJSON()));
            console.log(this.model.toJSON());
            $.ajax({
                type: "GET",
                url: ENDPOINT,
                contentType: "application/json",
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function(data) {
                    debug("[BIKE PREFERENCES OK]", data);
                    if (data.isDefault === true) {
                        var popupWindow = EQ.Helpers.PopupMessageHandler($(".bike-settings-container"), {
                            closeButton: true,
                            description: "The best ride starts with the best settings. Set up your bike preferences here.",
                            buttonColor: "white",
                            buttonText: "Set up my bike"
                        });
                        $(".bike-settings-container").show();
                        popupWindow.showPopup();
                    }
                },
                error: function(d) {
                    debug("server error", d.responseJSON);
                }
            });
            App.loadComponent("share", this.$el.find(".share"), {
                type: "booked-class",
                clubname: this.model.get("classInfo").clubName,
                classname: this.model.get("classInfo").name,
                classdate: this.model.get("classInfo").classStartDate,
                linkurl: "/groupfitness/" + BikeClassDetail.classInstance,
                classinstructor: this.model.get("classInfo").instructorName,
                classstudio: this.model.get("classInfo").classstudio
            });
            return this;
        }
    });
    var ModalWindowView = Backbone.View.extend({
        el: ".modals",
        initialize: function(options) {
            this.strikes = options.strikes || 0;
            this.tpl = options.template || null;
            this.remDays = options.remDays || 0;
        },
        openModal: function(id, bikeId) {
            var modal = this.$el.find(".modal-wrapper." + id);
            if (bikeId) {
                modal.find(".subTemplate .bikeNumber").text(bikeId);
            }
            if (id === "thirdStrikeModalSingleViewTemplate") {
                modal.find(".remFirst").text(modal.find(".remFirst").text().replace("%remainingDays%", this.remDays));
                modal.find(".remSecond").text(modal.find(".remSecond").text().replace("%remainingDays%", this.remDays));
            }
            this.$el.removeClass("hidden").show();
            modal.removeClass("hidden").show();
            return modal;
        },
        render: function() {
            var that = this;
            $.each(that.tpl, function(index, value) {
                var modalWindowSingleView = new ModalWindowSingleView({
                    template: value,
                    strikes: this.strikes
                });
                that.$el.append(modalWindowSingleView.render().el);
            });
            return that;
        }
    });
    var ModalWindowSingleView = Backbone.View.extend({
        className: "modal-wrapper",
        template: null,
        events: {
            "click .close-modal": "closeModal"
        },
        initialize: function(options) {
            var template;
            template = $("#" + options.template).html();
            this.strikes = options.strikes;
            this.tpl = options.template;
            this.template = _.template(template);
        },
        closeModal: function(e) {
            e.preventDefault();
            this.$el.addClass("hidden");
            this.$el.parent().addClass("hidden");
            if (this.$el.closest(".thirdStrikeModalSingleViewTemplate").length > 0) {
                location.href = "/bookabike";
            }
        },
        render: function() {
            this.$el.html(this.template());
            this.$el.addClass(this.tpl);
            return this;
        }
    });
    var ClassFullMessageView = MessageGeneralInfo.extend({
        el: ".page .full:not(.past)",
        template: _.template($("#classFullMessage").html()),
        render: function() {
            this.$el.html(this.template());
            this.$el.removeClass("hidden");
            return this;
        }
    });
    var ClassInPastMessageView = Backbone.View.extend({
        el: ".page .past",
        template: _.template($(".past.full").html()),
        render: function() {
            this.$el.html(this.template());
            this.$el.removeClass("hidden");
            return this;
        }
    });
    var ClassClosedMessageView = MessageGeneralInfo.extend({
        el: ".page .countdown",
        template: _.template($("#countdownBikeClass").html()),
        initialize: function(options) {
            this.options = options || {};
        },
        updateCountdown: function(waitTime, $countdownTimeBox) {
            var remainingSeconds = waitTime, hours, minutes, $countdownTime = $countdownTimeBox.find(".countdown-time"), $countdownDigit = $countdownTimeBox.find(".countdown-digit");
            if (remainingSeconds === 0 || remainingSeconds < 0) {
                clearInterval(EQ.countdownBookABikeInterval);
                location.reload();
            } else if (remainingSeconds < 60) {
                remainingSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;
                $countdownTime.addClass("hidden");
                $countdownDigit.text(remainingSeconds).removeClass("hidden");
            } else {
                hours = Math.floor(remainingSeconds / 3600);
                hours = hours < 10 ? "0" + hours : hours;
                remainingSeconds = remainingSeconds % 3600;
                minutes = Math.floor(remainingSeconds / 60);
                minutes = minutes < 10 ? "0" + minutes : minutes;
                remainingSeconds = remainingSeconds % 60;
                remainingSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;
                $countdownDigit.addClass("hidden");
                $countdownTime.text(hours + ":" + minutes + ":" + remainingSeconds);
            }
        },
        render: function() {
            var waitTime = BikeClassDetail.classInfo.waitTime, that = this;
            this.$el.html(this.template());
            if (waitTime > 0) {
                EQ.countdownBookABikeInterval = setInterval(function() {
                    waitTime = waitTime - 1;
                    that.updateCountdown(waitTime, that.$el.find(".timebox"));
                }, 1e3);
            }
            this.$el.removeClass("hidden");
            return this;
        }
    });
    var DataClass = {};
    var ModalClass = {};
    var BikeClassDetail = {};
    DataClass.init = function($el, options) {
        var loaderAndError;
        options.isSelectingFavorite = options.isSelectingFavorite || false;
        options.facilityId = options.facilityId || "";
        loaderAndError = EQ.Helpers.loaderAndErrorHandler($el, {
            color: "white"
        });
        loaderAndError.showLoader();
        $.ajax({
            type: "GET",
            url: options.endPoint,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function(data) {
                debug("[BIKECLASSES SERVICE OK]", data);
                var checkForFavoriteBikeEndpoint, mapData = data;
                if (options.isSelectingFavorite) {
                    mapData.layout = mapData;
                    $(".club-name").html(mapData.clubName);
                    document.title += " " + mapData.clubName;
                } else {
                    ClassDetail = mapData;
                    if (mapData.reservation.result === null || mapData.reservation.result === "") {
                        window.tagData.bikeAction = {
                            action: "add-start",
                            bikeSelectionMethod: ""
                        };
                    } else if (mapData.reservation.result !== null) {
                        window.tagData.bikeAction = {
                            action: "edit-start",
                            bikeSelectionMethod: ""
                        };
                    }
                    var timeOffset = moment(ClassDetail.layout.classStartDate).diff(ClassDetail.classInstanceDetail.facilityCurrentDateTime, "hours"), timeOffsetMinutes = moment(ClassDetail.layout.classStartDate).diff(ClassDetail.classInstanceDetail.facilityCurrentDateTime, "minutes");
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
                    window.tagData = window.tagData || {};
                    window.tagData.classInstance = {
                        classID: ClassDetail.classInstanceDetail.classId.toString(),
                        facilityID: ClassDetail.classInstanceDetail.facility.facilityId,
                        classInstanceID: ClassDetail.layout.cycleClassStatus.classInstanceId.toString(),
                        categoryID: "6",
                        timeOffset: timeOffset.toString()
                    };
                }
                if (data.classInstanceDetail && data.classInstanceDetail.facility && data.classInstanceDetail.facility.facilityId) {
                    checkForFavoriteBikeEndpoint = APIEndpoint + "/me/favorites/bikes/" + data.classInstanceDetail.facility.facilityId;
                    $.ajax({
                        type: "GET",
                        url: checkForFavoriteBikeEndpoint,
                        contentType: "application/json",
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        success: function(data) {
                            if (data.result) {
                                var bikes = new Backbone.Collection(mapData.layout.bikes), isFavReserved;
                                BikeClassDetail.favBike = parseInt(data.result.bikeNumber, 10);
                                isFavReserved = bikes.where({
                                    localId: parseInt(data.result.bikeNumber, 10)
                                })[0].get("reserved");
                                if (!mapData.reservation.result || mapData.reservation.result && mapData.reservation.result.localId !== BikeClassDetail.favBike) {
                                    BikeClassDetail.renderBookFavoriteButton($el, {
                                        bikeId: data.result.bikeNumber,
                                        bikes: bikes,
                                        isDisabled: isFavReserved
                                    });
                                }
                            }
                            loaderAndError.hideLoader();
                            BikeClassDetail.render(mapData, options.isSelectingFavorite, options.facilityId);
                        },
                        error: function(d) {
                            debug("server error", d.responseJSON);
                            loaderAndError.hideLoader();
                            BikeClassDetail.render(mapData, options.isSelectingFavorite, options.facilityId);
                        }
                    });
                } else {
                    loaderAndError.hideLoader();
                    BikeClassDetail.render(mapData, options.isSelectingFavorite, options.facilityId);
                }
            },
            error: function(d) {
                debug("server error", d.responseJSON);
                loaderAndError.showError();
            }
        });
    };
    BikeClassDetail.renderBookFavoriteButton = function($el, options) {
        var $favBikeButton = $el.find(".book-fav-bike.desktop"), $favBikeButtonMobile = $el.find(".book-fav-bike.mobile"), bikesCollection, selectedBike, reservableEquipId;
        $favBikeButton.removeClass("hidden");
        $favBikeButton.find("span.number").text("(" + options.bikeId + ")");
        $favBikeButtonMobile.removeClass("hidden");
        $favBikeButtonMobile.find("span.number").text("(" + options.bikeId + ")");
        bikesCollection = options.bikes;
        selectedBike = bikesCollection.where({
            localId: parseInt(options.bikeId, 10)
        });
        reservableEquipId = selectedBike[0].get("reservableEquipId");
        if (!options.isDisabled) {
            var favLoader = EQ.Helpers.loaderAndErrorHandler($favBikeButton.find(".button"), {
                color: "black",
                type: "button"
            });
            var favLoaderMobile = EQ.Helpers.loaderAndErrorHandler($favBikeButtonMobile.find("a"), {
                color: "black",
                type: "button"
            });
            $favBikeButton.on("click", function(e) {
                e.preventDefault();
                BikeClassDetail.reserveFavouriteBike(bikesCollection, options, favLoader);
            });
            $favBikeButtonMobile.on("click", function(e) {
                e.preventDefault();
                BikeClassDetail.reserveFavouriteBike(bikesCollection, options, favLoaderMobile);
            });
        } else {
            $favBikeButton.addClass("disabled");
            $favBikeButtonMobile.addClass("disabled");
        }
    };
    BikeClassDetail.reserveFavouriteBike = function(bikesCollection, options, favLoader) {
        var reservedBike = null;
        if (BikeClassDetail && BikeClassDetail.reservation && BikeClassDetail.reservation.result) {
            reservedBike = bikesCollection.where({
                reserved: true,
                localId: BikeClassDetail.reservation.result.localId
            });
        }
        var alreadyReservedBike = 0;
        if (reservedBike && reservedBike[0]) {
            alreadyReservedBike = reservedBike[0].get("localId");
        }
        var favoriteBike = bikesCollection.where({
            localId: parseInt(options.bikeId, 10)
        });
        var reservableEquipId = favoriteBike[0].get("reservableEquipId");
        if (alreadyReservedBike !== 0) {
            if (alreadyReservedBike !== favoriteBike[0].get("localId")) {
                App.Events.trigger("switchBike", {
                    bikeId: options.bikeId,
                    reservableEquipId: reservableEquipId,
                    loader: favLoader
                });
            }
        } else {
            BikeClassDetail.selectBike(options.bikeId, reservableEquipId, favLoader);
        }
    };
    BikeClassDetail.init = function($el, options) {
        var ENDPOINT, isSelectingFavorite;
        BikeClassDetail.classInstance = $el.data("class-instance");
        if (options.isSelectingFavorite === "True") {
            ENDPOINT = APIEndpoint + "/facilities/" + options.facilityId + "/studio";
            isSelectingFavorite = true;
        } else {
            ENDPOINT = APIEndpoint + "/classes/bikes/" + BikeClassDetail.classInstance;
        }
        DataClass.init($el, {
            endPoint: ENDPOINT,
            isSelectingFavorite: isSelectingFavorite,
            facilityId: options.facilityId
        });
    };
    BikeClassDetail.render = function(data, isSelectingFavorite, facilityId) {
        var $mapContainer, $listContainer, bikesMapView, doorsMapView, instructorsMapView, bikesListView, classFullMessageView, classClosedMessageView, bikesCollection, doorsCollection, instructorsCollection, bikeClassInfoView, classInfoModel, startTime, limitTime, upperTitle = "Choose your bike";
        BikeClassDetail.bikesJSON = data;
        BikeClassDetail.reservation = BikeClassDetail.bikesJSON.reservation;
        if (!isSelectingFavorite) {
            BikeClassDetail.bikesJSON.isFull = BikeClassDetail.bikesJSON.layout.cycleClassStatus.isClassFull;
        } else {
            BikeClassDetail.bikesJSON.layout.cycleClassStatus = {};
            BikeClassDetail.bikesJSON.isFull = false;
            BikeClassDetail.bikesJSON.classInstanceDetail = {
                isHappeningNow: false,
                isFinished: false
            };
        }
        BikeClassDetail.bikesJSON.isClosed = true;
        startTime = moment(BikeClassDetail.bikesJSON.layout.classStartDate);
        limitTime = moment(startTime.subtract("hours", 26).format());
        ModalClass.init();
        BikeClassDetail.classInfo = {
            clubId: BikeClassDetail.bikesJSON.layout.clubId,
            clubName: BikeClassDetail.bikesJSON.layout.clubName,
            id: BikeClassDetail.bikesJSON.layout.id,
            name: BikeClassDetail.bikesJSON.classInstanceDetail.name,
            instructorName: BikeClassDetail.bikesJSON.layout.instructorName,
            waitTime: BikeClassDetail.bikesJSON.layout.cycleClassStatus.waitTime || "",
            date: EQ.Helpers.dateTime.convertDateToString(BikeClassDetail.bikesJSON.layout.classStartDate, true),
            classStartDate: BikeClassDetail.bikesJSON.layout.classStartDate,
            time: BikeClassDetail.bikesJSON.classInstanceDetail.displayTime,
            reservation: BikeClassDetail.reservation,
            upperTitle: upperTitle,
            classstudio: BikeClassDetail.bikesJSON.layout.name,
            workoutSubCategoryId: BikeClassDetail.bikesJSON.classInstanceDetail.workoutSubCategoryId
        };
        var classInstructors = BikeClassDetail.bikesJSON.classInstanceDetail.instructors;
        if (classInstructors && classInstructors.length > 1) {
            BikeClassDetail.classInfo.instructorName = "";
            _.each(classInstructors, function(instructor, i) {
                var suffix = i === classInstructors.length - 1 ? "" : ", ";
                if (_.isNull(instructor.substitute)) {
                    if (_.isNull(instructor.instructor)) {
                        BikeClassDetail.classInfo.instructorName += "";
                    } else {
                        BikeClassDetail.classInfo.instructorName += instructor.instructor.firstName + " " + instructor.instructor.lastName + suffix;
                    }
                } else {
                    if (_.isNull(instructor.instructor)) {
                        BikeClassDetail.classInfo.instructorName += instructor.substitute.firstName + " " + instructor.substitute.lastName + suffix;
                    } else {
                        BikeClassDetail.classInfo.instructorName += instructor.substitute.firstName + " " + instructor.substitute.lastName + " (SUB for " + instructor.instructor.firstName + " " + instructor.instructor.lastName + ")" + suffix;
                    }
                }
            });
        }
        if (BikeClassDetail.bikesJSON.isFull === true && !BikeClassDetail.bikesJSON.reservation.result && !isSelectingFavorite) {
            upperTitle = "Class full";
            classFullMessageView = new ClassFullMessageView();
            classFullMessageView.render();
            classInfoModel = new ClassInfoModel(BikeClassDetail.classInfo);
            classInfoModel.upperTitle = "Class full";
            classInfoModel.set("upperTitle", "Class full");
            bikeClassInfoView = new BikeClassInfoView({
                model: classInfoModel
            });
            bikeClassInfoView.render();
        } else if (BikeClassDetail.bikesJSON.layout.cycleClassStatus.isClassClosed === true && BikeClassDetail.bikesJSON.layout.cycleClassStatus.isClassWithinReservationPeriod === false && !isSelectingFavorite) {
            classClosedMessageView = new ClassClosedMessageView({
                startDate: BikeClassDetail.bikesJSON.layout.classStartDate,
                endDate: BikeClassDetail.bikesJSON.layout.classEndDate
            });
            classClosedMessageView.render();
            classInfoModel = new ClassInfoModel(BikeClassDetail.classInfo);
            bikeClassInfoView = new BikeClassInfoView({
                model: classInfoModel
            });
            bikeClassInfoView.render();
        } else if (BikeClassDetail.bikesJSON.classInstanceDetail.isFinished === true || BikeClassDetail.bikesJSON.classInstanceDetail.isHappeningNow === true && !isSelectingFavorite) {
            ClassInPastMessageView = new ClassInPastMessageView();
            ClassInPastMessageView.render();
            upperTitle = "Class full";
        } else {
            if (isSelectingFavorite) {
                $mapContainer = $(".pick-favorite .bikes-graphic");
                $listContainer = $(".pick-favorite .content .bike-list-view");
                $(".pick-favorite").removeClass("hidden");
                App.Events.on("selectFavoriteBike", function(e, data) {
                    BikeClassDetail.selectFavoriteBike(data.bikeId, data.reservableEquipId, data.facilityId);
                });
                BikeClassDetail.bikesJSON.reservation = {
                    result: null
                };
            } else {
                $mapContainer = $(".book .bikes-graphic");
                $listContainer = $(".book .content .bike-list-view");
                $(".book").removeClass("hidden");
                App.Events.on("selectBike", function(e, data) {
                    BikeClassDetail.selectBike(data.bikeId, data.reservableEquipId, data.loader);
                    window.tagData = window.tagData || {};
                    window.tagData.bikeAction = {
                        action: "add-start",
                        bikeSelectionMethod: ""
                    };
                });
                App.Events.on("switchBike", function(e, data) {
                    BikeClassDetail.switchBikeBind(data.bikeId, data.reservableEquipId, data.loader);
                });
                classInfoModel = new ClassInfoModel(BikeClassDetail.classInfo);
                bikeClassInfoView = new BikeClassInfoView({
                    model: classInfoModel
                });
                bikeClassInfoView.render();
            }
            bikesCollection = new BikesCollection(BikeClassDetail.bikesJSON.layout.bikes);
            doorsCollection = new DoorsCollection(BikeClassDetail.bikesJSON.layout.doors);
            instructorsCollection = new InstructorsCollection(BikeClassDetail.bikesJSON.layout.instructors);
            bikesMapView = new BikesMapView({
                collection: bikesCollection,
                mapWidth: BikeClassDetail.bikesJSON.layout.width,
                mapHeight: BikeClassDetail.bikesJSON.layout.height,
                type: "bikes",
                el: $mapContainer,
                isSelectingFavorite: isSelectingFavorite,
                facilityId: facilityId,
                hasLoader: true
            });
            doorsMapView = new BikesMapView({
                collection: doorsCollection,
                mapWidth: BikeClassDetail.bikesJSON.layout.width,
                mapHeight: BikeClassDetail.bikesJSON.layout.height,
                type: "doors",
                el: $mapContainer
            });
            instructorsMapView = new BikesMapView({
                collection: instructorsCollection,
                mapWidth: BikeClassDetail.bikesJSON.layout.width,
                mapHeight: BikeClassDetail.bikesJSON.layout.height,
                type: "instructors",
                el: $mapContainer
            });
            bikesListView = new BikesListView({
                collection: bikesCollection,
                reservation: BikeClassDetail.bikesJSON.reservation.result,
                el: $listContainer,
                isSelectingFavorite: isSelectingFavorite,
                facilityId: facilityId
            });
            bikesMapView.render();
            doorsMapView.render();
            instructorsMapView.render();
            bikesListView.render();
        }
    };
    BikeClassDetail.switchBikeBind = function(bikeId, reservableEquipId, loader) {
        window.tagData = window.tagData || {};
        var model = ModalClass.modalWindowView.openModal("switchBikeModalSingleViewTemplate");
        model.find(".switch-confirm").off("click");
        model.find(".switch-confirm").on("click", function(e) {
            e.preventDefault();
            $(this).off("click");
            BikeClassDetail.switchBike(bikeId, reservableEquipId, loader);
        });
        window.tagData.bikeAction = {
            action: "edit-start",
            bikeSelectionMethod: ""
        };
    };
    BikeClassDetail.switchBike = function(bikeId, reservableEquipId, loader) {
        if (loader) {
            loader.showLoader();
        }
        var ENDPOINT = APIEndpoint + "/classes/bikes/" + BikeClassDetail.classInstance + "/switch/" + reservableEquipId;
        $.ajax({
            type: "POST",
            url: ENDPOINT,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function(data) {
                if (loader) {
                    loader.hideLoader();
                }
                if (data.message && data.message.length > 0) {
                    $(".book-a-bike-detail").removeClass("book").addClass("full");
                    $(".class-full-message").html(data.message[0].userFriendlyDescription);
                } else {
                    if (data.switchSuccessful) {
                        data.classInfo = BikeClassDetail.classInfo;
                        data.selectedBikeId = bikeId;
                        data.selectedReservableEquipId = reservableEquipId;
                        data.bikeTaken = false;
                        var confirmationModel = new ConfirmationModel(data), confirmationScreen = new BikeClassConfirmationView({
                            model: confirmationModel
                        });
                        window.tagData = window.tagData || {};
                        window.tagData.bikeAction = {
                            action: "edit-complete",
                            bikeSelectionMethod: ""
                        };
                        if (data && BikeClassDetail) {
                            if (parseInt(data.selectedBikeId, 10) === BikeClassDetail.favBike) {
                                window.tagData.bikeAction.bikeSelectionMethod = "chosen-fave";
                            } else {
                                window.tagData.bikeAction.bikeSelectionMethod = "chosen";
                            }
                        } else if (data) {
                            window.tagData.bikeAction.bikeSelectionMethod = "chosen";
                        }
                        confirmationScreen.render();
                        App.renderComponents(confirmationScreen.$el);
                        BikeClassDetail.checkOptStatus(data);
                    } else {
                        var classFullMessageView = new ClassFullMessageView();
                        classFullMessageView.render();
                        $(".book-a-bike-detail").removeClass("book").addClass("full");
                        $(".class-full-message").html("Selected bike is already taken by someone else.");
                        $(".book").hide();
                    }
                }
            },
            error: function(d) {
                debug("server error", d.responseJSON);
                if (loader) {
                    loader.showError();
                }
            }
        });
    };
    BikeClassDetail.selectBike = function(bikeId, reservableEquipId, loader) {
        var ENDPOINT = APIEndpoint + "/classes/bikes/" + BikeClassDetail.classInstance + "/book/" + reservableEquipId;
        if (loader) {
            loader.hideError();
            loader.showLoader();
        }
        $.ajax({
            type: "PUT",
            url: ENDPOINT,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function(data) {
                if (loader) {
                    loader.hideLoader();
                }
                if (data.error) {
                    console.log(data.error[0].userFriendlyDescription);
                    var classFullMessageView = new ClassFullMessageView();
                    classFullMessageView.render();
                    $(".book-a-bike-detail").removeClass("book").addClass("full");
                    $(".class-full-message").html(data.error[0].userFriendlyDescription);
                    $(".book").hide();
                    window.tagData = window.tagData || {};
                    window.tagData.bikeAction = {
                        action: "add-fail",
                        bikeSelectionMethod: ""
                    };
                } else {
                    console.log(data);
                    if (data.reservationSuccess) {
                        data.classInfo = BikeClassDetail.classInfo;
                        data.selectedBikeId = bikeId;
                        data.selectedReservableEquipId = reservableEquipId;
                        var timeOffset = moment(ClassDetail.layout.classStartDate).diff(ClassDetail.classInstanceDetail.facilityCurrentDateTime, "hours"), timeOffsetMinutes = moment(ClassDetail.layout.classStartDate).diff(ClassDetail.classInstanceDetail.facilityCurrentDateTime, "minutes");
                        if (timeOffset === 0) {
                            if (timeOffsetMinutes > 0) {
                                timeOffset = 1;
                            } else {
                                timeOffset = -1;
                            }
                        }
                        window.tagData = window.tagData || {};
                        window.tagData.classInstance = {
                            classID: ClassDetail.classInstanceDetail.classId,
                            facilityID: ClassDetail.classInstanceDetail.facility.facilityId,
                            classInstanceID: ClassDetail.layout.cycleClassStatus.classInstanceId,
                            categoryID: 6,
                            timeOffset: timeOffset
                        };
                        window.tagData.bikeAction = {
                            action: "add-complete"
                        };
                        if (data && BikeClassDetail) {
                            if (parseInt(data.selectedBikeId, 10) === BikeClassDetail.favBike) {
                                window.tagData.bikeAction.bikeSelectionMethod = "chosen-fave";
                            } else {
                                window.tagData.bikeAction.bikeSelectionMethod = "chosen";
                            }
                        } else if (data) {
                            window.tagData.bikeAction.bikeSelectionMethod = "chosen";
                        }
                        var confirmationModel = new ConfirmationModel(data), confirmationScreen = new BikeClassConfirmationView({
                            model: confirmationModel
                        });
                        if (data.classInfo.workoutSubCategoryId === 2 || data.classInfo.workoutSubCategoryId === 3) {
                            EQ.Helpers.getService("/v1/me").done(function(preferencesData) {
                                var gender = preferencesData.profile.gender;
                                debug("CURRENT GENDER+++++++++", gender);
                                if (gender !== "Male" && gender !== "Female") {
                                    App.loadComponent("gender-selection", $(".book-a-bike-detail"), {
                                        genderSelectedCallback: function(gender) {
                                            BikeClassDetail.gender = gender;
                                            if (BikeClassDetail.isConfirmationRendered) {
                                                $('.confirmation .opt-status .checkbox input[type="checkbox"]').attr("checked", true);
                                                $('.confirmation .opt-status .checkbox input[type="checkbox"]').parents(".checkbox.inline").addClass("checked");
                                                BikeClassDetail.getOptStatus(BikeClassDetail.classInstance, false);
                                            } else {
                                                confirmationScreen.render();
                                                App.renderComponents(confirmationScreen.$el);
                                                BikeClassDetail.isConfirmationRendered = true;
                                                BikeClassDetail.checkOptStatus(data, false);
                                            }
                                        },
                                        genderDeclinedCallback: function() {
                                            if (BikeClassDetail.isConfirmationRendered) {
                                                $('.confirmation .opt-status .checkbox input[type="checkbox"]').attr("checked", false);
                                                $('.confirmation .opt-status .checkbox input[type="checkbox"]').parents(".checkbox.inline").removeClass("checked");
                                                BikeClassDetail.getOptStatus(BikeClassDetail.classInstance, true);
                                            } else {
                                                confirmationScreen.render();
                                                App.renderComponents(confirmationScreen.$el);
                                                BikeClassDetail.isConfirmationRendered = true;
                                                BikeClassDetail.checkOptStatus(data, true);
                                            }
                                        }
                                    });
                                } else {
                                    confirmationScreen.render();
                                    App.renderComponents(confirmationScreen.$el);
                                    BikeClassDetail.isConfirmationRendered = true;
                                    BikeClassDetail.checkOptStatus(data);
                                }
                            });
                        } else {
                            confirmationScreen.render();
                            App.renderComponents(confirmationScreen.$el);
                            BikeClassDetail.isConfirmationRendered = true;
                        }
                    }
                }
            },
            error: function(d) {
                debug("server error", d.responseJSON);
                if (loader) {
                    loader.showError();
                }
            }
        });
    };
    BikeClassDetail.selectFavoriteBike = function(bikeId, reservableEquipId, facilityId) {
        debug("fav selected", bikeId, reservableEquipId, facilityId);
        var ENDPOINT = APIEndpoint + "/me/favorites/bikes/" + facilityId + "/" + bikeId;
        $.ajax({
            type: "PUT",
            url: ENDPOINT,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function(data) {
                if (data.error) {
                    debug("Server Error", data.error);
                } else {
                    EQ.Helpers.user.invalidateFavoritesCache();
                    ModalClass.modalWindowView.openModal("favoriteBikeModalSingleViewTemplate", bikeId);
                }
            },
            error: function(d) {
                debug("server error", d.responseJSON);
            }
        });
    };
    BikeClassDetail.cancelBike = function() {
        console.log("CANCEL BIKE");
        var ENDPOINT = APIEndpoint + "/classes/bikes/" + BikeClassDetail.classInstance + "/cancel";
        $.ajax({
            type: "DELETE",
            url: ENDPOINT,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function(data) {
                if (data.error) {
                    var classFullMessageView = new ClassFullMessageView();
                    classFullMessageView.render();
                    $(".book-a-bike-detail").removeClass("book").addClass("full");
                    $(".class-full-message").html(data.error[0].userFriendlyDescription);
                    $(".book").hide();
                } else {
                    window.tagData = window.tagData || {};
                    location.href = "/bookabike";
                    window.tagData.bikeAction = {
                        action: "delete-complete",
                        bikeSelectionMethod: ""
                    };
                }
            },
            error: function(d) {
                debug("server error", d.responseJSON);
            }
        });
    };
    BikeClassDetail.checkOptStatus = function(data, forcedValueForOptOut) {
        if (data.classInfo.workoutSubCategoryId === 2 || data.classInfo.workoutSubCategoryId === 3) {
            var isCyclingLeaderOptOut = false, $optInCheckBox = $('.confirmation .opt-status .checkbox input[type="checkbox"]');
            if (data.classInfo.reservation.result && data.classInfo.reservation.result.isCyclingLeaderOptOut === false) {
                isCyclingLeaderOptOut = false;
            }
            if (forcedValueForOptOut !== undefined) {
                isCyclingLeaderOptOut = forcedValueForOptOut;
            }
            $optInCheckBox.attr("checked", !isCyclingLeaderOptOut);
            $(".confirmation .opt-status").show();
            $optInCheckBox.on("change", function() {
                var isChecked = $(this).is(":checked");
                if ($(this).is(":checked") && !BikeClassDetail.gender) {
                    EQ.Helpers.getService("/v1/me").done(function(preferencesData) {
                        var gender = preferencesData.profile.gender;
                        debug("CURRENT GENDER+++++++++", gender);
                        if (gender !== "Male" && gender !== "Female") {
                            Backbone.Events.trigger("gender-selection:open");
                        } else {
                            $(".opt-status").find(".loader, .error-box").remove();
                            BikeClassDetail.getOptStatus(BikeClassDetail.classInstance, !isChecked);
                        }
                    });
                } else {
                    $(".opt-status").find(".loader, .error-box").remove();
                    BikeClassDetail.getOptStatus(BikeClassDetail.classInstance, !isChecked);
                }
            });
            $optInCheckBox.trigger("change");
        }
    };
    BikeClassDetail.getOptStatus = function(bikeInstanceID, optOutStatus) {
        console.log("OPT STATUS", optOutStatus);
        var ENDPOINT = APIEndpoint + "/classes/bikes/" + bikeInstanceID + "/leaderoptout/" + optOutStatus, loaderAndError;
        loaderAndError = EQ.Helpers.loaderAndErrorHandler($(".opt-status"), {
            type: "popup",
            color: "white",
            errorTitle: "Error"
        });
        loaderAndError.showLoader();
        $.ajax({
            type: "PUT",
            url: ENDPOINT,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function(data) {
                debug("OPT STATUS OK", data);
                loaderAndError.hideLoader();
            },
            error: function(d) {
                debug("server error", d.responseJSON);
                loaderAndError.showError();
            }
        });
    };
    ModalClass.init = function() {
        var modalWindowsTemplates, strikeCount = 0, remainingDays = 0;
        if (BikeClassDetail.bikesJSON.strikes) {
            strikeCount = BikeClassDetail.bikesJSON.strikes.count;
            remainingDays = BikeClassDetail.bikesJSON.strikes.remainingDays;
        }
        modalWindowsTemplates = [ "firstStrikeModalSingleViewTemplate", "secondStrikeModalSingleViewTemplate", "thirdStrikeModalSingleViewTemplate", "switchBikeModalSingleViewTemplate", "cancelBikeModalSingleViewTemplate", "favoriteBikeModalSingleViewTemplate" ];
        ModalClass.modalWindowView = new ModalWindowView({
            template: modalWindowsTemplates,
            strikes: strikeCount,
            remDays: remainingDays
        });
        ModalClass.modalWindowView.render();
        if (strikeCount > 0) {
            var modalId, hasSeenStrikes = JSON.parse(localStorage.getItem("hasSeenStrikes")) || false;
            if (strikeCount === 1) {
                modalId = "firstStrikeModalSingleViewTemplate";
            } else if (strikeCount === 2) {
                modalId = "secondStrikeModalSingleViewTemplate";
            } else if (strikeCount >= 3) {
                modalId = "thirdStrikeModalSingleViewTemplate";
            }
            if (hasSeenStrikes === false) {
                ModalClass.modalWindowView.openModal(modalId);
            }
            if (strikeCount === 1) {
                localStorage.setItem("hasSeenStrikes", true);
            } else if (strikeCount === 2) {
                localStorage.setItem("hasSeenStrikes", true);
            } else if (strikeCount >= 3) {
                localStorage.setItem("hasSeenStrikes", false);
            }
            if (strikeCount === 3) {
                App.Events.off("selectBike");
            }
        }
    };
    App.Components["bike-class-detail"] = function($el, options) {
        BikeClassDetail.init($el, options);
        $el.find(".expand").on("click", function() {
            $(this).toggleClass("active");
        });
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
