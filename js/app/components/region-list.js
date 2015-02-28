(function (global, App) {
    'use strict';

    /* global EQ */

    App.Components['region-list'] = function ($el) {
        var $regions = $('<ul></ul>');
        var regionsData = global.allRegionsData;

        //Regions
        var USRegions = [],
            INTRegions = [];

        $.each(regionsData, function (j, region) {
            var $regionTemplate,
                facilities = EQ.Helpers.getAllFacilities(region),
                link,
                clubCount;

            if (facilities.length === 1) {
                link = App.Pages.Clubs.Club.getLink(facilities[0]);
                clubCount = '1 club';
            } else {
                link = '/clubs/' + region.ShortName.toLowerCase();
                clubCount = facilities.length + ' clubs';
            }

            $regionTemplate = '\
                <li>\
                    <img src="' + region.BackgroundImageSmall + '"/>\
                    <a href="' + link + '">' + region.CircleName + '<small>' + clubCount + '</small></a>\
                </li>';

            if (region.Country === 'US') {
                USRegions.push($regionTemplate);
            } else {
                INTRegions.push($regionTemplate);
            }
        });

        //All Regions
        var ALLRegions = USRegions.concat(INTRegions);
        $el.append($regions.append(ALLRegions));
    };

}(window, window.App));