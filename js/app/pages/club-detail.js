(function (global, App) {
    'use strict';
    /* global debug, EQ, currentClub, RichMarkerPosition */

    var Club = App.Pages.Club = {};
    debug('[CLUB DETAIL] page');

    Club.icon = function (facility) {
        return '<div class="custom-marker active"><span class="icon-marker-o"></span><h5>' + facility.ClubName + '</h5></div>';
    };

    Club.onMapsLoaded = function () {
        Club.Map = new EQ.Maps.Map(Club.ui.$mapContainer[0]);
        var region = EQ.Helpers.getRegionByTitle(Club.region);
        if (region) {
            Club.Region.select(region);
        }

        var club = EQ.Helpers.getFacilityById(Club.clubId);
        var marker = Club.Map.markers.find(club.Latitude, club.Longitude);

        // Center map into Club.
        Club.Map.fit([club], -3);

        //TODO:MR move this to events object Bind mobile native map trigger
        //$('.native-map-trigger').attr('href', EQ.Helpers.getDeviceMapURL(club));

        // If there's a marker there, set icon to active state.
        if (marker) {
            debug('[ClubDetail] Setting marker open:', marker);
            marker.setAnchor(RichMarkerPosition.TOP);
            marker.setContent(Club.icon(club));
        }
    };

    Club.Club = {
        parse: function (facility) {
            EQ.Helpers.setPositionGetter(facility);
            Club.Map.markers.add({
                lat: facility.Latitude,
                lng: facility.Longitude,
                content: Club.Icon.Marker.regular(),
                click: function () {
                    // Trigger marker click
                    EQ.Maps.trigger('CLUB_MARKER_CLICK', {
                        facility: facility,
                        marker: this
                    });
                }
            }, true);
            return this;
        },

        showAll: function () {
            if (!this._facilities) {
                var facilities = [];
                $.each(Club.Data, function (i, region) {
                    facilities = facilities.concat(EQ.Helpers.getAllFacilities(region));
                });
                this._facilities = facilities;
            }

            $.each(this._facilities, function (i, club) {
                Club.Club.parse(club);
            });
        }
    };

    Club.Icon = {
        Marker: {
            regular: function () {
                return '<div class="custom-marker"><span class="icon-marker-dot"></span></div>';
            }
        }
    };

    Club.Region = {
        select: function (region) {
            if (!region.bounds) {
                region.bounds = EQ.Maps.Bounds(Club.getChildrenPoints(region));
            }
            this.showClubs(region);
        },

        showClubs: function (region) {
            Club.Map.fitBounds(region.bounds);
            Club.Club.showAll();
        }
    };

    Club.getChildrenPoints = function (region) {
        var that = this,
            points = [];

        // either has facilities under subregions,
        // or just facilities but not both.
        if (region.SubRegions && region.SubRegions.length) {
            $.each(region.SubRegions, function (i, subregion) {
                points = points.concat(that.getChildrenPoints(subregion));
            });
        } else if (region.Facilities.length) {
            points = $.map(region.Facilities, function (club) {
                if (club.Latitude && club.Longitude) {
                    return EQ.Maps.Point({
                        lat: club.Latitude,
                        lng: club.Longitude
                    });
                } else {
                    console.error('A club doesn\'t have Lat Lng properties.', club);
                }
            });
        }
        return points;
    };

    Club.toggleMapContainer = function (e) {
        e.preventDefault();
        $(e.currentTarget).closest('.club-finder-map').children('div').toggle();

        // check if map was already loaded in DOM
        if (!this.mapLoaded) {
            EQ.Maps.Load(this.onMapsLoaded);
            // Change state flag
            this.mapLoaded = true;
        }
    };

    /**
     * Bind Events
     * Store all bindings in one place
     * @public
     */
    Club.events = function () {
        this.ui.$toggleMapContainer.on('click', _.bind(this.toggleMapContainer, this));
    };

    /**
     * all ui elements
     * @type {{$toggleMapContainer: (*|jQuery|HTMLElement)}}
     */
    Club.ui = {
        $mapContainer: $('.map-container'),
        $toggleMapContainer: $('.toggleMapContainer')
    };

    /**
     * init method
     * @param region
     * @param subregion
     * @param club
     */
    Club.init = function (region, subregion, club) {
        debug('[ClubDetail] init:', region, subregion, club);

        Club.region = region;
        Club.Data = global.allRegionsData;
        Club.mapLoaded = false;
        Club.clubId = currentClub;
        Club.events();
    };

})(window, window.App);