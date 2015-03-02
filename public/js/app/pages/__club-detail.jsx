(function (global) {
    /* global debug, App, EQ, currentClub */
    'use strict';

    var Facilities = App.Pages.Facilities = {};

    Facilities.Icon = function (facility) {
        return '<div class="custom-marker active">' +
            '<span class="icon-marker-o"></span>' +
            '<h5>' + facility.ClubName + '</h5>' +
            '</div>';
    };

    Facilities.setClub = function (clubId) {
        var club = this.clubsMap.getFacilityById(clubId),
            Map = this.clubsMap.Map,
            marker = Map.markers.find(club.Latitude, club.Longitude);

        // Center map into Club.
        Map.fit([club], -3).freeze();

        // Bind mobile native map trigger
        $('.native-map-trigger').attr('href', EQ.Helpers.getDeviceMapURL(club));

        // If there's a marker there, set Icon to active state.
        if (marker) {
            debug('[ClubDetail] Setting marker open:', marker);
            /* global RichMarkerPosition */
            marker.setAnchor(RichMarkerPosition.TOP);
            marker.setContent(Facilities.Icon(club));
        }
        // Omniture - DPLAT-1929
        $('#onboard-startBtn, #clubCtaSchedule-btn').on('click', function () {
            window.tagData.pdfLink = window.tagData.pdfLink || {};
            window.tagData.pdfLink = {
                facilityId: club.Id
            };
            window.track('clickClassPdf', window.tagData.pdfLink);
        });

        $('#clubCtaBrowse-btn').on('click', function () {
            window.tagData.searchLink = window.tagData.searchLink || {};
            window.tagData.searchLink = {
                type: 'club',
                value: club.Id
            };
            window.track('clickClassSearchLink', window.tagData.searchLink);
        });

        $('#visitUs-btn').on('click', function () {
            window.track('clickLeadFormJump');
        });
    };

    Facilities.init = function (region, subregion, club) {
        debug('[ClubDetail] init:', club);

        global.isClubDetail = true;

        // Note: `club` could be either ClubName, ClubID, etc.
        // Different URL cases, `club` is the only var always set.
        if (arguments.length === 2) {
            club = subregion;
            subregion = null;
        } else if (arguments.length === 1) {
            club = region;
            subregion = null;
            region = null;
        }

        EQ.Maps.on('c', function () {
            Facilities.clubsMap = $('.map-container').data('clubsMap');

            // Note: `currentClub` contains the ClubID of the current page.
            Facilities.setClub(currentClub);
        });
    };

})(window);