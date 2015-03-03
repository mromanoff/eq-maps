(function(global, App) {
    "use strict";
    App.Components["region-selector"] = function($el) {
        var regionsData, getSelectedRegionName, selectedRegion, optionTemplatePartial, selectTemplate;
        regionsData = global.allRegionsData;
        getSelectedRegionName = function() {
            return $("[data-region]").data().region;
        };
        selectedRegion = _.findWhere(regionsData, {
            UrlName: getSelectedRegionName()
        });
        optionTemplatePartial = function(selectedRegion) {
            var selected;
            return _.map(regionsData, function(region) {
                selected = _.isEqual(selectedRegion.Name, region.Name) ? ' selected="selected"' : "";
                return "<option" + selected + ' value="' + region.ShortName.toLowerCase() + '">' + region.Name + "</option>";
            }, this);
        };
        selectTemplate = function(selectedRegion) {
            return '<img src="' + selectedRegion.BackgroundImage + '" alt="' + selectedRegion.Name + '">                    <span class="select-wrapper select-regions" data-component="inline-select">                        <select name="regions">                            <option value="Select-Region">Select Region</option>' + optionTemplatePartial(selectedRegion).join("") + '                        </select>                        <span class="option" style="display: inline-block;">' + selectedRegion.Name + "</span>                    </span>";
        };
        $el.html(selectTemplate(selectedRegion));
        $el.on("change", "select", function() {
            window.location.href = "/clubs/" + $(this).find("option:selected").val();
        });
    };
})(window, window.App);
/*! local_env equinox_maps v1.0.0 - 2015-03-03 01:03:55 */
