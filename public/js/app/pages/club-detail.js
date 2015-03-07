(function (global, App) {
    'use strict';
    /* global debug, RichMarkerPosition */

    var Club = App.Pages.Club = {};
    debug('[CLUB DETAIL] page');

    Club.parse = function (club) {
        Club.Map.setPositionGetter(club);
        Club.Map.markers.add({
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

    Club.showAll = function () {
        return _.each(Club.clubs, function (club) {
            Club.parse(club);
        });
    };

    Club.setClubMap = function () {
        Club.showAll();

        var marker = Club.Map.markers.find(Club.club.Latitude, Club.club.Longitude);

        //TODO:MR move this to events object Bind mobile native map trigger
        //$('.native-map-trigger').attr('href', EQ.Helpers.getDeviceMapURL(club));

        // If there's a marker there, set icon to active state.
        if (marker) {
            marker.setAnchor(RichMarkerPosition.TOP);
            marker.setContent(Club.Map.markers.marker.clubIcon(Club.club));
            Club.Map.map.setCenter(marker.getPosition());
            Club.Map.map.setZoom(14);
        }
    };

    Club.getRegion = function (regionName) {
        return global.EQ.Helpers.getRegionByTitle(regionName);
    };

    Club.getClubs = function (region) {
        return global.EQ.Helpers.getAllFacilities(region);
    };

    Club.createMap = function () {
       Club.Map = new global.EQ.Maps.Map(Club.ui.mapContainer);
       Club.setClubMap();
    };

    Club.toggleMapContainer = function (e) {
        e.preventDefault();
        $(e.currentTarget).closest('.club-finder-map').children('div').toggle();

        // check if map was already loaded in DOM
        if (!Club.mapLoaded) {
            global.EQ.Maps.Load(Club.createMap);
            // Change state flag
            Club.mapLoaded = true;
        }
    };

    /**
     * Events
     */
    Club.events = function () {
        Club.ui.$toggleMapContainer.on('click', Club.toggleMapContainer);
    };

    /**
     * Views
     */
    Club.ui = {
        mapContainer: $('.map-container').get(0), //convert to native DOM
        $toggleMapContainer: $('.toggleMapContainer')
    };

    /**
     * init method
     * @param regionName
     * @param clubName
     */
    Club.init = function (regionName, clubName) {
        debug('[ClubDetail] init()', regionName, clubName);

        Club.region = Club.getRegion(regionName);
        Club.clubs = Club.getClubs(Club.region);
        Club.club = global.EQ.Helpers.getFacilityByUrlName(clubName);
        Club.mapLoaded = false;
        Club.events();
    };

})(window, window.App);