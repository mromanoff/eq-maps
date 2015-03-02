(function(global, App) {
    "use strict";
    console.log("loaded again");
    App.Components["club-list"] = function($el) {
        var regionName, region, $clubs, regionsData, clubList, isExpanded, scheduleTemplatePartial, clubsTemplate;
        regionName = $("[data-region]").data().region;
        $clubs = $("<ul></ul>");
        regionsData = global.allRegionsData;
        region = _.findWhere(regionsData, {
            ShortName: regionName
        });
        scheduleTemplatePartial = function(club) {
            return _.map(club.Schedule, function(item) {
                return '<div class="period"><span class="day-name"><strong>' + _.values(item)[0] + "</strong></span><span>" + _.values(item)[1] + "</span></div>";
            });
        };
        clubsTemplate = function() {
            return _.map(clubList, function(club) {
                return '<li class="' + isExpanded + '">                            <section class="club-location club-location-region">                                <div class="club-detail club-detail-region">                                <h3 class="club-title">' + club.ClubName + '<a href="" class="icon-close"></a></h3>                                <div class="club-body">                                    <div class="club">                                        <p>' + club.GoogleAddress + '</p>                                        <p><a href="tel:' + club.Telephone + '">' + club.Telephone + '</a></p>                                    </div>                                    <div class="club-hours">' + scheduleTemplatePartial(club).join("") + '</div>                                    <hr class="is-mobile">                                    <div class="club">                                        <p>General Manager: ' + club.Manager + '</p>                                    </div>                                    <nav class="buttons">                                        <a href="' + club.URL + '" data-club-href="' + club.URL + '" class="black box button small">View Club Page</a>                                        <a href="/classes/search?clubs=' + club.Id + '" class="white box button small">Browse Classes</a>                                    </nav>                              </div>                                </div>                            </section>                        </li>';
            });
        };
        if (region.SubRegions && region.SubRegions.length) {
            console.info("subregions");
            var html = "";
            _.each(region.SubRegions, function(subregion) {
                console.log("subregion.Name", subregion.Name);
                var clubList = EQ.Helpers.getAllFacilities(subregion);
                isExpanded = clubList.length <= 0 ? "" : "collapsed";
                var clubs = _.map(clubList, function(club) {
                    return '<li class="' + isExpanded + '">                            <section class="club-location club-location-region">                                <div class="club-detail club-detail-region">                                <h3 class="club-title">' + club.ClubName + '<a href="" class="icon-close"></a></h3>                                <div class="club-body">                                    <div class="club">                                        <p>' + club.GoogleAddress + '</p>                                        <p><a href="tel:' + club.Telephone + '">' + club.Telephone + '</a></p>                                    </div>                                    <div class="club-hours">' + scheduleTemplatePartial(club).join("") + '</div>                                    <hr class="is-mobile">                                    <div class="club">                                        <p>General Manager: ' + club.Manager + '</p>                                    </div>                                    <nav class="buttons">                                        <a href="' + club.URL + '" data-club-href="' + club.URL + '" class="black box button small">View Club Page</a>                                        <a href="/classes/search?clubs=' + club.Id + '" class="white box button small">Browse Classes</a>                                    </nav>                              </div>                                </div>                            </section>                        </li>';
                });
                html += '<div class="subregion-list"><h4 class="subrerion-title">' + subregion.Name + "</h4>";
                html += "<ul>" + clubs.join("") + "</ul></div>";
            }, this);
            $el.append(html);
        } else {
            console.info("no subregions");
            clubList = EQ.Helpers.getAllFacilities(region);
            isExpanded = clubList.length <= 10 ? "" : "collapsed";
            $el.append($clubs.append(clubsTemplate));
        }
        $el.on("click", "h3", function(e) {
            e.preventDefault();
            $(this).closest("li").toggleClass("collapsed");
        });
    };
})(window, window.App);
/*! local_env equinox_maps v1.0.0 - 2015-03-02 06:03:44 */
