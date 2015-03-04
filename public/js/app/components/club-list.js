(function (global, App) {
    'use strict';

    /* global debug */

    var ClubList = function ($el) {
        this.$el = $el;
        this.regionName = $('[data-region]').data().region;
        this.regionsData = global.allRegionsData;
        this.region = _.findWhere(this.regionsData, {'UrlName': this.regionName});
        this.expandLimit = 10;
        this.clubList = null;
    };

    ClubList.prototype = {
        init: function () {
            debug('[Club List Component] init()');
            this.getClubList();
            this.events();
        },

        getClubList: function () {
            // either has facilities under subregions,
            // or just facilities but not both.
            if (this.region.SubRegions && this.region.SubRegions.length) {
                _.each(this.region.SubRegions, function (subregion) {
                    this.clubList = global.EQ.Helpers.getAllFacilities(subregion);
                    this.addViewState();
                    this.render(this.JST.subregions({
                        subregion: subregion,
                        clubList: this.clubList
                    }));
                }, this);

            } else {
                this.clubList = global.EQ.Helpers.getAllFacilities(this.region);
                this.addViewState();
                this.render(this.JST.clubs({
                    clubList: this.clubList
                }));
            }
        },

        addViewState: function () {
            return _.extend(this.clubList, {state: this.getClubViewState()});
        },

        events: function () {
            this.$el.on('click', 'h3', function (e) {
                e.preventDefault();
                $(this).closest('li').toggleClass('collapsed');
            });
        },

        getClubViewState: function () {
            return global.EQ.Helpers.getAllFacilities(this.region).length <= this.expandLimit ? 'expanded' : 'collapsed';
        },

        render: function (data) {
            return this.$el.append(data);
        },

        JST: {
            schedule: _.template(
                '<% _.each(club.Schedule, function (item) { %>\
                <div class="period"><span class="day-name"><strong><%- item.Key %></strong></span><span><%- item.Value %></span></div>\
                <% }); %>'
            ),

            // _.each(list, function(){}, context)!!!   Context needed for using schedule partial;
            clubs: _.template(
                '<ul><% _.each(clubList, function (club) { %>\
                    <li class="<%- clubList.state %>">\
                        <section class="club-location club-location-region">\
                            <div class="club-detail club-detail-region">\
                            <h3 class="club-title"><%- club.ClubName %><a href="" class="icon-close"></a></h3>\
                            <div class="club-body">\
                                <div class="club">\
                                    <p><%- club.GoogleAddress %></p>\
                                    <p><a href="tel:<%- club.Telephone %>"><%- club.Telephone %></a></p>\
                                </div>\
                                <div class="club-hours"><%= this.schedule({club: club})  %></div>\
                                <hr class="is-mobile">\
                                <div class="club">\
                                    <p>General Manager: <%- club.Manager  %></p>\
                                </div>\
                                <nav class="buttons">\
                                    <a href="<%- club.URL  %>" data-club-href="<%- club.URL  %>" class="black box button small">View Club Page</a>\
                                    <a href="/classes/search?clubs=<%- club.Id  %>" class="white box button small">Browse Classes</a>\
                                </nav>\
                          </div>\
                            </div>\
                        </section>\
                    </li>\
                <% }, this); %></ul>'
            ),

            subregions: _.template(
                '<div class="subregion-list"><h4 class="subrerion-title"><%- subregion.Name %></h4>\
                <%= this.clubs({clubList: clubList})  %>\
                </div>'
            )
        }
    };

    App.Components['club-list'] = function ($el) {
        new ClubList($el).init();
    };

}(window, window.App));
