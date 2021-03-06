(function (global, App) {
    'use strict';

    /* global debug */

    var RegionList = function ($el) {
        this.$el = $el;
    };

    RegionList.prototype = {
        init: function () {
            debug('[Region List Component] init()');
            this.getRegionList();
        },

        getRegionsData: function () {
            return global.allRegionsData;
        },

        getRegionList: function () {
            var allRegions = '';
            _.each(this.getRegionsData(), function (region) {
                var clubList = global.EQ.Helpers.getAllFacilities(region);
                var link = _.isEqual(clubList.length, 1) ? global.EQ.Helpers.getFacilityUrl(clubList[0].Id) : '/clubs/' + region.ShortName.toLowerCase();
                var count = _.isEqual(clubList.length, 1) ? '1 club' : clubList.length + ' clubs';
                allRegions += this.JST.region({
                    region: region,
                    link: link,
                    count: count
                });

            }, this);
            this.render(allRegions);
        },

        render: function (data) {
            return this.$el.html('<ul>').children().append(data);
        },

        JST: {
            region: _.template(
                '<li>\
                    <img src="<%- region.BackgroundImageSmall %>"/>\
                    <a href="<%- link %>"><%- region.CircleName %><small><%- count %></small></a>\
                </li>'
            )
        }
    };

    App.Components['region-list'] = function ($el) {
        new RegionList($el).init();
    };

}(window, window.App));