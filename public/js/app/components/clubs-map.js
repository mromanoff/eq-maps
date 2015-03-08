(function (global, App) {
    'use strict';

    /* global debug */

    var ClubsMap = function ($el) {
        this.$el = $el;
    };

    ClubsMap.prototype = {
        centerMapToClubIcon: function (data) {
            // Center map in marker
            data.marker.map.panTo(data.marker.getPosition());
            return this;
        },

        zoomInToClubIcon: function (data) {
            // Zoom in. Google Maps max Zoom is 16. if you do 10 + 10 it render max 16 still
            data.marker.map.setZoom(data.marker.map.getZoom() + 1);
            return this;
        },

        updateIcon: function (data) {
            data.marker.setContent(this.JST.marker.clubIcon());
            return this;
        },

        resetIcons: function () {
            $('.custom-marker').find('span').removeClass('icon-marker-o').addClass('icon-marker-dot');
            return this;
        },

        renderClubInfoWindow: function (data) {
            this.$el.append(this.JST.infoWindow.club({
                club: data.club
            }));
            this.$el.find('.club-map-marker-detail').fadeIn(200);
            return this;
        },

        removeClubInfoWindow: function () {
            this.$el.find('.club-map-marker-detail').fadeOut(200, function () {
                this.remove();
            });
            return this;
        },

        JST: {
            marker: {
                clubIcon: _.template('<div class="custom-marker active"><span class="icon-marker-o"></span><h5></h5></div>')
            },

            infoWindow: {
                schedule: _.template(
                    '<% _.each(club.Schedule, function (item) { %>\
                    <div class="period"><span class="day-name"><strong><%- item.Key %></strong></span><span><%- item.Value %></span></div>\
                    <% }); %>'
                ),

                club: _.template(
                    '<section class="club-map-marker-detail club-location club-location-region">\
                        <div class="club-detail club-detail-region">\
                        <h3 class="club-title"><%- club.ClubName %><a href="" class="icon-close"></a></h3>\
                        <div class="club-body">\
                            <div class="club">\
                                <p><%- club.GoogleAddress %></p>\
                                <p><a href="tel:<%- club.Telephone %>"><%- club.Telephone %></a></p>\
                            </div>\
                            <div class="club-hours"><%=  this.schedule({club: club}) %></div>\
                            <hr class="is-mobile">\
                            <div class="club">\
                                <p>General Manager: <%- club.Manager %></p>\
                            </div>\
                            <nav class="buttons">\
                                <a href="<%-  club.URL %>" data-club-href="<%-  club.URL %>" class="black box button small">View Club Page</a>\
                                <a href="/classes/search?clubs=<%- club.Id %>" class="white box button small">Browse Classes</a>\
                            </nav>\
                        </div>\
                        </div>\
                    </section>'
                )
            }
        },

        events: function () {
            this.$el.on('click', '.icon-close', _.bind(function (e) {
                e.preventDefault();
                this.removeClubInfoWindow();
            }, this));

            global.EQ.Maps.on('CLUB_MARKER_CLICK', _.bind(function (data) {
                if (data.club !== null) {
                    this.removeClubInfoWindow(data)
                        .resetIcons()
                        .renderClubInfoWindow(data)
                        .centerMapToClubIcon(data)
                        .zoomInToClubIcon(data)
                        .updateIcon(data);
                } else {
                    debug('[CLUBSMAP] CLUB_MARKER_CLICK data coming null. Cancelling on logic.');
                }
            }, this));
        },

        init: function () {
            debug('[Club Map Component] init()');
            this.events();
        }
    };

    App.Components['clubs-map'] = function ($el) {
        new ClubsMap($el).init();
    };

}(window, window.App));