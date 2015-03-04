(function(global, App) {
    "use strict";
    var RegionList = function($el) {
        this.$el = $el;
        this.regionsData = global.allRegionsData;
    };
    RegionList.prototype = {
        init: function() {
            debug("[Region List Component] init()");
            this.getRegionList();
        },
        getRegionList: function() {
            var allRegions = "";
            _.each(this.regionsData, function(region) {
                var clubList = global.EQ.Helpers.getAllFacilities(region);
                var link = _.isEqual(clubList.length, 1) ? App.Pages.Clubs.Club.getLink(clubList[0]) : "/clubs/" + region.ShortName.toLowerCase();
                var count = _.isEqual(clubList.length, 1) ? "1 club" : clubList.length + " clubs";
                allRegions += this.JST.region({
                    region: region,
                    link: link,
                    count: count
                });
            }, this);
            this.render(allRegions);
        },
        render: function(data) {
            return this.$el.html("<ul>").children().append(data);
        },
        JST: {
            region: _.template('<li>                    <img src="<%- region.BackgroundImageSmall %>"/>                    <a href="<%- link %>"><%- region.CircleName %><small><%- count %></small></a>                </li>')
        }
    };
    App.Components["region-list"] = function($el) {
        new RegionList($el).init();
    };
})(window, window.App);
/*! local_env equinox_maps v1.0.0 - 2015-03-04 12:03:24 */
