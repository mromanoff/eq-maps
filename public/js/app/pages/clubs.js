(function (global, App) {
    'use strict';
    /* global debug */

    var Clubs = App.Pages.Clubs = {};
    debug('[CLUBS] page');

    Clubs.parse = function (club) {
        Clubs.Map.setPositionGetter(club);
        Clubs.Map.markers.add({
            lat: club.Latitude,
            lng: club.Longitude,
            click: function () {
                // Trigger marker click
                global.EQ.Maps.trigger('CLUB_MARKER_CLICK', {
                    club: club,
                    marker: this
                });
            }
        });
        return this;
    };

    Clubs.showAll = function () {
        return _.each(Clubs.clubs, function (club) {
            Clubs.parse(club);
        });
    };

    Clubs.setRegionMap = function () {
        var otherClubs = Clubs.Map.getChildrenPoints(Clubs.region);
        var bounds = Clubs.Map.getBounds(otherClubs);

        Clubs.Map.fitBounds(bounds);
        Clubs.showAll();
    };

    Clubs.getRegion = function (regionName) {
        return global.EQ.Helpers.getRegionByTitle(regionName);
    };

    Clubs.getClubs = function (region) {
        return global.EQ.Helpers.getAllFacilities(region);
    };

    Clubs.createMap = function () {
        Clubs.Map = new global.EQ.Maps.Map(Clubs.ui.mapContainer);
        Clubs.setRegionMap();
    };

    Clubs.toggleMapContainer = function (e) {
        e.preventDefault();
        $(e.currentTarget).closest('.club-finder-map').children('div').toggle();

        // check if map was already loaded in DOM
        if (!Clubs.mapLoaded) {
            global.EQ.Maps.Load(Clubs.createMap);
            // Change state flag
            Clubs.mapLoaded = true;
        }
    };

    /**
     * Events
     */
    Clubs.events = function () {
        Clubs.ui.$toggleMapContainer.on('click', Clubs.toggleMapContainer);
    };

    /**
     * Views
     */
    Clubs.ui = {
        mapContainer: $('.map-container').get(0), //convert to native DOM
        $toggleMapContainer: $('.toggleMapContainer')
    };

    /**
     * Clubs initialization
     * @param regionName
     */
    Clubs.init = function (regionName) {
        debug('[Clubs Page] init() ', regionName);

        Clubs.region = Clubs.getRegion(regionName);
        Clubs.clubs = Clubs.getClubs(Clubs.region);
        Clubs.mapLoaded = false;
        Clubs.events();
    };

}(window, window.App));