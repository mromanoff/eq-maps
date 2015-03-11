(function (global, App) {
    'use strict';
    /* global debug, RichMarkerPosition */

    var Clubs = App.Pages.Clubs = {};
    debug('[CLUBS] page');

    Clubs.addMarker = function (club) {
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

    Clubs.addMarkers = function () {
        return _.each(Clubs.clubs, function (club) {
            Clubs.addMarker(club);
        });
    };

    Clubs.setClubMap = function () {
        var marker = Clubs.Map.markers.find(Clubs.club.Latitude, Clubs.club.Longitude);

        // If there's a marker there, set icon to active state.
        if (marker) {
            marker.setAnchor(RichMarkerPosition.TOP);
            marker.setContent(Clubs.Map.markers.marker.clubIcon(Clubs.club));
            Clubs.Map.map.setCenter(marker.getPosition());
            Clubs.Map.map.setZoom(13);
        }
    };

    Clubs.setRegionMap = function () {
        var otherClubs = Clubs.Map.getChildrenPoints(Clubs.region);
        var bounds = Clubs.Map.getBounds(otherClubs);
        Clubs.Map.fitBounds(bounds);
    };

    Clubs.getRegion = function (regionName) {
        return global.EQ.Helpers.getRegionByTitle(regionName);
    };

    Clubs.getClubs = function (region) {
        return global.EQ.Helpers.getAllFacilities(region);
    };

    Clubs.setMap = function () {
        Clubs.Map = new global.EQ.Maps.Map(Clubs.ui.mapContainer);
        Clubs.addMarkers();

        // here where we check.
        // 1. it is region page load setRegionMap()
        // 2. it is club page load setClubMap()
        return _.isNull(Clubs.clubName) ? Clubs.setRegionMap() : Clubs.setClubMap();
    };

    // TODO this function does two things. SEPARATE!!!
    Clubs.toggleMapContainer = function (e) {
        e.preventDefault();
        $(e.currentTarget).closest('.club-finder-map').children('div').toggle();

        // check if map was already loaded in DOM
        if (!Clubs.mapLoaded) {
            global.EQ.Maps.Load(Clubs.setMap);
            // Change state flag
            Clubs.mapLoaded = true;
        }
    };

    /**
     * Events
     */
    Clubs.events = function () {
        Clubs.ui.$toggleMapContainer.on('click', Clubs.toggleMapContainer);

        if (!_.isNull(Clubs.clubName)) {
            Clubs.ui.$nativeMapTrigger.attr('href', global.EQ.Helpers.getDeviceMapURL(Clubs.club));
        }
    };

    /**
     * Views
     */
    Clubs.ui = {
        mapContainer: $('.map-container').get(0), //convert to native DOM
        $toggleMapContainer: $('.toggleMapContainer'),
        $nativeMapTrigger: $('.native-map-trigger')
    };

    /**
     * Clubs initialization
     * @param regionName
     * @param subRegionName
     * @param clubName
     */
    //Clubs.init = function (regionName, subRegionName, clubName) {
    //    debug('[Clubs Page] init() ', regionName, subRegionName, clubName);

    Clubs.init = function (regionName, subRegionName, clubName) {
        debug('[Clubs Page] init() ', regionName, subRegionName, clubName);


        var args = Array.prototype.slice.call(arguments);

        console.log('arguments:', arguments.length, arguments);
        console.log('args:', args.length, args);

        Clubs.regionName = args[0]; //regionName;
        Clubs.subregionName = !_.isNull(args[2]) ? args[1] : null;
        Clubs.clubName = !_.isNull(args[2]) ? args[2] : args[1];



        Clubs.region = Clubs.getRegion(Clubs.regionName);
        Clubs.clubs = Clubs.getClubs(Clubs.region);
        Clubs.mapLoaded = false;

        if (!_.isNull(Clubs.clubName)) {

            //TODO: this method is too slow . searching throudg all facilities. we need to search though selected region.

            Clubs.club =  _.findWhere(Clubs.clubs, {'UrlName': Clubs.clubName});

            //Clubs.club = global.EQ.Helpers.getFacilityByUrlName(Clubs.clubName);
        }

        // init events last. all data need to be set before kick in events.
        Clubs.events();
    };

}(window, window.App));