(function (global, App) {
    'use strict';
    /* global debug, EQ */

    var Clubs = App.Pages.Clubs = {};
    debug('[CLUBS] page');

    Clubs.Club = {
        parse: function (facility) {
            EQ.Helpers.setPositionGetter(facility);
            Clubs.Map.markers.add({
                lat: facility.Latitude,
                lng: facility.Longitude,
                content: Clubs.Icon.Marker.regular(),
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
                $.each(Clubs.Data, function (i, region) {
                    facilities = facilities.concat(EQ.Helpers.getAllFacilities(region));
                });
                this._facilities = facilities;
            }

            $.each(this._facilities, function (i, club) {
                Clubs.Club.parse(club);
            });
        },

        getLink: function (facility) {
            return facility.URL || ('/clubs/' + facility.ShortName);
        }
    };

    Clubs.Icon = {
        Marker: {
            regular: function () {
                return '<div class="custom-marker"><span class="icon-marker-dot"></span></div>';
            }
        }
    };

    Clubs.onMapsLoaded = function () {
        Clubs.Map = new EQ.Maps.Map(Clubs.ui.$mapContainer[0]);
        var region = EQ.Helpers.getRegionByTitle($('.clubs-region').data('region'));

        if (region) {
            Clubs.Region.select(region);
        }
    };

    Clubs.Region = {
        select: function (region) {
            if (!region.bounds) {
                region.bounds = EQ.Maps.Bounds(Clubs.getChildrenPoints(region));
            }
            this.showClubs(region);
        },

        showClubs: function (region) {
            Clubs.Map.fitBounds(region.bounds);
            Clubs.Club.showAll();
        }
    };

    Clubs.getChildrenPoints = function (region) {
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

    Clubs.toggleMapContainer = function (e) {
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
     * Events
     * @public
     */

    Clubs.events = function () {
        this.ui.$toggleMapContainer.on('click', _.bind(this.toggleMapContainer, this));
    };

    /**
     * Views
     */
    Clubs.ui = {
        $mapContainer: $('.map-container'),
        $toggleMapContainer: $('.toggleMapContainer')
    };


    /**
     * Clubs initialization
     */
    Clubs.init = function () {
        Clubs.Data = global.allRegionsData;
        Clubs.mapLoaded = false;
        Clubs.events();
    };

}(window, window.App));