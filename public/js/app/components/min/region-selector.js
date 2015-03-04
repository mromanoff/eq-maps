(function(global, App) {
    "use strict";
    var RegionSelector = function($el) {
        this.$el = $el;
    };
    RegionSelector.prototype = {
        init: function() {
            debug("[Region Selector Component] init()");
            this.getRegionSelector();
            this.events();
        },
        getRegionName: function() {
            return $("[data-region]").data().region;
        },
        getRegionsData: function() {
            return global.allRegionsData;
        },
        getSelectedRegion: function() {
            return _.findWhere(this.getRegionsData(), {
                UrlName: this.getRegionName()
            });
        },
        getRegionSelector: function() {
            this.render(this.JST.select({
                regionsData: this.getRegionsData(),
                selectedRegion: this.getSelectedRegion()
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
/*! local_env equinox_maps v1.0.0 - 2015-03-04 09:03:02 */
