(function(App) {
    "use strict";
    App.Components["inline-select"] = function($el, type) {
        function selectDefaultFacility(options) {
            var arr = [];
            $.each(options, function() {
                if (parseInt($(this).data("facility-id"), 10) === parseInt(window.user.FacilityId, 10)) {
                    return arr.push($(this).attr("selected", "selected")[0]);
                }
                arr.push($(this)[0]);
            });
            options = arr;
            return $el.find("select").append(options);
        }
        if (type === "clubslist") {
            var handleCommingSoonClub = $el.data("handle-comming-soon-club");
            var options = allRegionsData.reduce(function(prev, nextRegion) {
                return prev.concat(EQ.Helpers.getAllFacilities(nextRegion));
            }, []).sort(function(a, b) {
                return a.ClubName < b.ClubName ? -1 : 1;
            }).map(function(club) {
                if (handleCommingSoonClub && club.IsAvailableOnline && club.IsPresale === false) {
                    return makeOptions(club);
                } else if (!handleCommingSoonClub) {
                    return makeOptions(club);
                }
            });
            var dataSelectDefaultClub = $el.data("select-defualt-club");
            if (dataSelectDefaultClub) {
                selectDefaultFacility(options);
            } else {
                $el.find("select").append(options);
            }
            var $selectedValue = $("#selectedValue", $el);
            if ($selectedValue.length > 0 && $selectedValue.val() !== "") {
                $el.find('select option[value="' + $selectedValue.val() + '"]').attr("selected", "selected");
            }
        }
        function makeOptions(club) {
            return '<option data-facility-id="' + club.Id + '" value="' + club.ClubID + '">' + club.ClubName + "</option>";
        }
        var $optionPlaceholder = $el.find("span.option");
        $optionPlaceholder.text($el.find("option:selected").text());
        $el.find("select").on("change", function(e) {
            console.log(e, $el.find("option:selected").text());
            $optionPlaceholder.removeClass("open");
            if (!$(this).attr("data-skip")) {
                $optionPlaceholder.text($el.find("option:selected").text());
                $el.trigger("change", e);
                setTimeout(function() {
                    $el.find("select").blur();
                }, 1);
            }
        });
        $el.find("select").on("click", function() {
            $optionPlaceholder.addClass("open");
            $el.find("select").on("mouseup", function() {
                $el.find("select").off("mouseup");
                setTimeout(function() {
                    $el.find("select").blur();
                }, 1);
            });
        });
        $el.find("select").on("blur", function() {
            $optionPlaceholder.removeClass("open");
            $el.find("select").off("mouseup");
        });
    };
})(window.App);
/*! local_env equinox_maps v1.0.0 - 2015-03-04 01:03:19 */
