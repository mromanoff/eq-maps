(function(App) {
    "use strict";
    var ClubSelector = {};
    ClubSelector.populateRegions = function() {
        var regionsMarkup = "", regions = this._regions, allFacilities = [];
        this.clubsMap.parseRegionsData(allRegionsData);
        $.each(allRegionsData, function(i, region) {
            region.ShortName = region.ShortName.replace(/ /g, "-");
            var regionFacilities = EQ.Helpers.getAllFacilities(region);
            allFacilities = allFacilities.concat(regionFacilities);
            if (regionFacilities.length) {
                regionsMarkup += '<option value="' + region.ShortName + '">' + region.Name + "</option>";
                regions[region.ShortName] = region;
            }
        });
        this.$regions.html(regionsMarkup);
    };
    ClubSelector.updateFacility = function() {
        var facilitiesMarkup = "", region = this._regions[this.$regions.val()], facilities, $component = this.$regions.closest('[data-component="club-selector"]'), handleCommingSoonClub = $component.data("handle-comming-soon-club");
        if (!region) {
            throw new Error("No region for selected value:", this.$regions.val());
        }
        facilities = EQ.Helpers.getAllFacilities(region);
        $.each(facilities, function(i, club) {
            if (handleCommingSoonClub && club.IsAvailableOnline) {
                makeOptions(club);
            } else if (!handleCommingSoonClub) {
                makeOptions(club);
            }
        });
        function makeOptions(club) {
            facilitiesMarkup += '<option value="' + club.ClubID + '">' + club.ClubName + "</option>";
            EQ.Helpers.setPositionGetter(club);
        }
        this.$facilities.html(facilitiesMarkup).trigger("change").next("span.option").hide().css("display", "inline-block");
    };
    ClubSelector.changeFacility = function(clubId) {
        var facility = this.clubsMap.getFacilityByClubId(clubId);
        EQ.Helpers.setPositionGetter(facility);
        if (facility) {
            this.clubsMap.Map.fit([ facility ], -1);
            this.show(facility);
        }
    };
    ClubSelector.Club = {
        set: function(facility) {
            var that = ClubSelector;
            var cid = facility.clubId || facility.ClubID;
            cid = "" + cid;
            var region = ClubSelector.clubsMap.getFacilityByClubId("" + cid).Region.replace(/\s/, "-");
            if (region && cid) {
                if (that.$regions.val() !== region.ShortName) {
                    that.$regions.prop("selectedIndex", that.$regions.find('option[value="' + region + '"]').index()).trigger("change");
                }
                if (that.$facilities.val() !== cid) {
                    that.$facilities.prop("selectedIndex", that.$facilities.find('option[value="' + cid + '"]').index()).trigger("change");
                }
                ClubSelector.changeFacility("" + cid);
            }
        },
        get: function() {
            return ClubSelector.clubsMap.getFacilityByClubId("" + ClubSelector.$facilities.val());
        }
    };
    ClubSelector.show = function(club) {
        var $club = $(".club-information");
        $.each(club, function(key, value) {
            if (typeof key === "string") {
                key = key.toLowerCase();
                $club.find('[data-club-text="' + key + '"]').text(value);
                if (key === "telephone") {
                    var $phoneItem = $club.find('[data-club-text="' + key + '"]');
                    var formatedValue = value.replace(/\./g, "");
                    var phoneLink = "tel:" + formatedValue;
                    $phoneItem.attr("href", phoneLink);
                }
                if (key === "shortname") {
                    $club.find(".more").attr("href", "/clubs/" + value);
                }
                $club.find('[data-club-href="' + key + '"]').attr("href", value);
            }
        });
        $club.removeClass("hidden");
    };
    ClubSelector.bind = function() {
        var that = this;
        this.$regions.on("change", function() {
            that.updateFacility();
        });
        this.$facilities.on("change", function() {
            ClubSelector.clubsMap.Map.markers.setIcon(ClubSelector.Icon.Marker.regular());
            ClubSelector.clubsMap.$el.find(".icon-marker-dot").removeClass("darker");
            var clubId = $(this).val(), facility = ClubSelector.clubsMap.getFacilityByClubId("" + clubId);
            that.changeFacility(clubId);
            ClubSelector.clubsMap.Map.markers.find(facility.Latitude, facility.Longitude).setContent(ClubSelector.Icon.Marker.activeNoInfo());
        });
        EQ.Maps.on("CLUB_MARKER_CLICK", function(data) {
            var region = EQ.Helpers.getRegionByTitle(data.facility.Region), clubId = data.facility.ClubID;
            if (region && clubId) {
                if (that.$regions.val() !== region.ShortName) {
                    that.$regions.prop("selectedIndex", that.$regions.find('option[value="' + region.ShortName + '"]').index()).trigger("change");
                }
                if (that.$facilities.val() !== clubId) {
                    that.$facilities.prop("selectedIndex", that.$facilities.find('option[value="' + clubId + '"]').index()).trigger("change");
                }
            }
            ClubSelector.clubsMap.Map.markers.setIcon(ClubSelector.Icon.Marker.regular());
            ClubSelector.clubsMap.$el.find(".icon-marker-dot").addClass("darker");
            data.marker.setContent(ClubSelector.Icon.Marker.activeNoInfo());
        });
    };
    ClubSelector.Icon = {
        Marker: {
            regular: function() {
                return '<div class="custom-marker">' + '<span class="icon-marker-dot"></span>' + "</div>";
            },
            active: function(facility) {
                return '<div class="custom-marker active">' + '<span class="icon-marker-o"></span>' + "<h5>" + facility.ClubName + "</h5>" + '<div class="is-tablet is-desktop">' + "<address>" + facility.GoogleAddress + "</address>" + '<a href="' + facility.URL || "/Clubs/" + facility.ShortName + '" class="button white fat cta">More Info</a>' + "</div>" + "</div>";
            },
            activeNoInfo: function() {
                return '<div class="custom-marker active">' + '<span class="icon-marker-o"></span>' + "</div>";
            }
        }
    };
    ClubSelector.init = function($el) {
        debug("[ClubSelector] ", ClubSelector);
        this.$el = $el;
        this.$regions = $el.find('select[name="regions"]');
        this.$facilities = $el.find('select[name="facilities"]');
        this._regions = {};
        this.populateRegions();
        this.bind();
        this.$regions.trigger("change");
        this.$facilities.trigger("change");
        $el.data("clubSelector", this.Club);
    };
    App.Components["club-selector"] = function($el) {
        EQ.Maps.on("IDLE_LOAD", function() {
            ClubSelector.clubsMap = $(".map-container").data("clubsMap");
            ClubSelector.init($el);
        });
    };
})(window.App);
/*! local_env equinox_maps v1.0.0 - 2015-03-02 03:03:03 */
