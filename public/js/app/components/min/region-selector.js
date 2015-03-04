(function(global, App) {
    "use strict";
    var RegionSelector = function($el) {
        this.$el = $el;
        this.regionName = $("[data-region]").data().region;
        this.regionsData = global.allRegionsData;
        this.selectedRegion = _.findWhere(this.regionsData, {
            UrlName: this.regionName
        });
    };
    RegionSelector.prototype = {
        init: function() {
            debug("[Region Selector Component] init()");
            this.getRegionSelector();
            this.events();
        },
        getRegionSelector: function() {
            this.render(this.JST.select({
                regionsData: this.regionsData,
                selectedRegion: this.selectedRegion
            }));
        },
        events: function() {
            this.$el.on("change", "select", function() {
                window.location.href = "/clubs/" + $(this).find("option:selected").val();
            });
        },
        render: function(data) {
            return this.$el.append(data);
        },
        JST: {
            select: _.template('<img src="<%- selectedRegion.BackgroundImage %>" alt="<%- selectedRegion.Name %>">                <span class="select-wrapper select-regions" data-component="inline-select">                    <select name="regions">                        <option value="Select-Region">Select Region</option>                        <%= this.option({regionsData: regionsData}) %>                    </select>                    <span class="option" style="display: inline-block;"><%- selectedRegion.Name %></span>                </span>'),
            option: _.template('<% _.each(regionsData, function (region) { %>                    <option value="<%- region.ShortName.toLowerCase() %>"><%- region.Name %></option>                <% }, this); %>')
        }
    };
    App.Components["region-selector"] = function($el) {
        new RegionSelector($el).init();
    };
})(window, window.App);
/*! local_env equinox_maps v1.0.0 - 2015-03-04 12:03:24 */
