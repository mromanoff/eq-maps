(function(App) {
    "use strict";
    var ClubsMap = function($el, options) {
        this.$el = $el;
        this.options = options;
        EQ.Maps.Load(_.bind(this.init, this));
    };
    ClubsMap.prototype = {
        centerMapToClubIcon: function(data) {
            data.marker.map.panTo(data.marker.getPosition());
            return this;
        },
        zoomInToClubIcon: function(data) {
            data.marker.map.setZoom(data.marker.map.getZoom() + 1);
            return this;
        },
        updateIcon: function(data) {
            var template = '<div class="custom-marker active">                            <span class="icon-marker-o"></span>                          </div>';
            data.marker.setContent(template);
            return this;
        },
        resetIcons: function() {
            $(".custom-marker").find("span").removeClass("icon-marker-o").addClass("icon-marker-dot");
            return this;
        },
        renderClubDetail: function(data) {
            this.$el.append(this.clubDetailTemplate(data.facility));
            this.$el.find(".club-map-marker-detail").fadeIn(200);
            return this;
        },
        removeClubDetail: function() {
            this.$el.find(".club-map-marker-detail").fadeOut(200, function() {
                this.remove();
            });
            return this;
        },
        scheduleTemplatePartial: function(club) {
            return _.map(club.Schedule, function(item) {
                return '<div class="period"><span class="day-name"><strong>' + _.values(item)[0] + "</strong></span><span>" + _.values(item)[1] + "</span></div>";
            });
        },
        clubDetailTemplate: function(club) {
            var template = '<section class="club-map-marker-detail club-location club-location-region">                        <div class="club-detail club-detail-region">                        <h3 class="club-title">' + club.ClubName + '<a href="" class="icon-close"></a></h3>                        <div class="club-body">                            <div class="club">                                <p>' + club.GoogleAddress + '</p>                                <p><a href="tel:' + club.Telephone + '">' + club.Telephone + '</a></p>                            </div>                            <div class="club-hours">' + this.scheduleTemplatePartial(club).join("") + '</div>                            <hr class="is-mobile">                            <div class="club">                                <p>General Manager: ' + club.Manager + '</p>                            </div>                            <nav class="buttons">                                <a href="' + club.URL + '" data-club-href="' + club.URL + '" class="black box button small">View Club Page</a>                                <a href="/classes/search?clubs=' + club.Id + '" class="white box button small">Browse Classes</a>                            </nav>                        </div>                        </div>                    </section>';
            return template;
        },
        events: function() {
            this.$el.on("click", ".icon-close", _.bind(function(e) {
                e.preventDefault();
                this.removeClubDetail();
            }, this));
            EQ.Maps.on("CLUB_MARKER_CLICK", _.bind(function(data) {
                if (data.facility !== null) {
                    this.removeClubDetail(data).resetIcons().renderClubDetail(data).centerMapToClubIcon(data).zoomInToClubIcon(data).updateIcon(data);
                } else {
                    debug("[CLUBSMAP] CLUB_MARKER_CLICK data coming null. Cancelling on logic.");
                }
            }, this));
        },
        init: function() {
            this.events();
        }
    };
    App.Components["clubs-map"] = function($el, options) {
        $el.data("clubsMap", new ClubsMap($el, options));
    };
})(window.App);
/*! local_env equinox_maps v1.0.0 - 2015-03-02 06:03:06 */
