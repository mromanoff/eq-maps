(function(global, App) {
    "use strict";
    App.Components["nearest-club"] = function() {
        EQ.Geo.getLatLng(function() {
            EQ.Geo.getNearestClub(function(club) {
                debug("[GetNearestClub] ", club);
                var shiftedLatitude = +club.Latitude + .02;
                EQ.Helpers.setPositionGetter(club);
                EQ.Maps.Load(function() {
                    var nearestMap = new EQ.Maps.Map($("#map")[0], shiftedLatitude, club.Longitude);
                    nearestMap.fit([ club ], -3);
                    nearestMap.freeze();
                });
                var address = "";
                var city = "";
                var phone = club.Telephone === "N/A" ? "" : club.Telephone;
                if (club.Address !== "") {
                    address = club.Address || "";
                    city = club.City + "," + club.Region + " " + club.Zip;
                }
                var formatedValue = phone.replace(/\./g, "");
                var phoneLink = "tel:" + formatedValue;
                $(".nearest-map").find(".club-name").text(club.ClubName).end().find(".address").text(address || "").end().find(".city").text(city || "").end().find(".phone").attr("href", phoneLink || "#").text(phone || "");
                $(".learn-more").attr("href", "/clubs/" + club.ShortName);
            });
        }, function() {
            $(".nearest-map").slideUp(function() {
                $(this).remove();
            });
        });
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
