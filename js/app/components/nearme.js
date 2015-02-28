(function (App) {
    'use strict';

    /* global EQ, allRegionsData, debug, Spinner, userProfileJson */

    var selectedRegion;

    var Handlers = {
        classes: {
            /**
             * Init
             *
             * This method populates the regions drop down with all the region data and then calls to populate all facilities for that region. If
             * the user is on the /Clubs page, find near clubs. For /region/ pages don't as we will be showing the region map instead
             *
             * @param module
             */
            init: function () {

                // show user location map only on clubs page
                //if (!$('.page').hasClass('clubs-region')) {
                //    EQ.Geo.getNearestClub(function (club) {
                //        debug('[NEARME] Classes closest club:', club);
                //        EQ.Maps.trigger('CLUB_MARKER_CLICK', {
                //            facility: club
                //        });
                //
                //        EQ.Maps.fixLayout();
                //    });
                //}
            }
        },
        spa: {
            init: function (module) {
                console.warn('spa init()');
                if ($.fn.simpleTabs) {
                    $('.tabs-simple').simpleTabs({
                        onTabShown: function () {
                            // fix map layout which broke by being hidden on page load
                            setTimeout(function () {
                                console.warn('load near clubs map');
                                EQ.Maps.fixLayout();
                            }, 600);
                        }
                    });
                } else {
                    debug('[CLUBS] simpleTabs plugin not loaded. Make sure Tabs component is loaded.');
                }

                console.warn('QQQQ module', module);
                //module.$el.hide(); // removed this cause it causes unnecessary jumpiness

                if (!module.clubsMap) {
                    module.clubsMap = $('.map-container').data('clubsMap');
                }

                $.get('/esb/getnearestspas/10018?radius=10000&numResults=1000', function (data) {
                    var regionsMarkup = '',
                        regions = module._regions,
                        allFacilities = [],
                        $regionDropdown;

                    module.clubsMap.parseRegionsData(data);

                    console.log('data', data);

                    $.each(data, function (i, region) {
                        // FIXME: the next line should be binded in backend.
                        region.ShortName = region.ShortName.replace(/ /g, '-');
                        console.warn('x->', region.ShortName);

                        var regionFacilities = EQ.Helpers.getAllFacilities(region);

                        allFacilities = allFacilities.concat(regionFacilities);

                        if (regionFacilities.length) {
                            // Append region options
                            regionsMarkup += '<option value="' +
                                            region.ShortName +
                                            (selectedRegion === region.ShortName ? '" selected="selected' : '') +
                                            '">' +
                                            region.Name +
                                            '</option>';
                            regions[region.ShortName] = region;
                        }
                    });

                    module.$regions.html(regionsMarkup);

                    $regionDropdown = $(module.$regions[0]);
                    console.log('$regionDropdown', $regionDropdown);


                    // set a default value
                    if (selectedRegion) {
                        module.$regions.next('span.option')
                                .hide()
                                .text($regionDropdown.find('option:selected').text())
                                .css('display', 'inline-block');
                    }

                    module.updateFacilities();

                    module.$el.show();

                    debug('[NEARME] Looking up closest spa within', allFacilities.length, 'facilities.');

                    EQ.Geo.getLatLng(function (data) {
                        if (data && data.coords) {
                            var club = EQ.Helpers.getClosestWithin(allFacilities, {
                                Latitude: data.coords.latitude,
                                Longitude: data.coords.longitude
                            });

                            debug('[NEARME] Spa closest club:', club);
                            EQ.Maps.trigger('CLUB_MARKER_CLICK', {
                                facility: club
                            });

                            EQ.Maps.fixLayout();
                        }
                    });
                });
            }
        }
    };

    var NearMe = function ($el, type) {

        if (!Handlers[type]) {
            throw new Error('No handler for nearme module type ' + type);
        }

        this.$el = $el;
        this.$clubsMap = this.$el.find('.map-container');
        this.$regions = $el.find('select[name="regions"]');
        this.$facilities = $el.find('select[name="facilities"]');
        this._regions = {};
        this.type = Handlers[type];
        this.isLoading = false;
        this.currClubId = null;

        this.bind();
        this.load();
    };

    NearMe.prototype = {
        firstTime: true,
        blacklist: ['14801', '11301', '125', '999'], // facilityIds that do not resolve to a valid club

        parseRegionsData: function (newData) {
            var clubsMap = this;

            clubsMap.regions = {};
            clubsMap.facilities = [];

            if (newData) {
                EQ.Helpers.fixRegionProperty(newData);
                clubsMap.Map.markers.empty();
            }

            // Store all facilities worldwide
            $.each(newData || allRegionsData, function (i, region) {
                clubsMap.facilities = clubsMap.facilities.concat(EQ.Helpers.getAllFacilities(region));
                clubsMap.regions[region.ShortName] = region;
            });

            // Add all facilities worldwide
            $.each(clubsMap.facilities, function (i, club) {
                clubsMap.Club.parse(club);
            });
        },

        bind: function () {
            var that = this;

            this.$facilities.on('change', function () {
                var clubId = $(this).val();
                var facilityId = EQ.Helpers.getFacilityIdFromClubId(clubId);
                var $component = $(this).closest('[data-component="nearme"]'),
                    $toggleLink = $component.find('.club-information .toggle-link');

                debug('[NEARME] Facilities Dropdown Changed to clubId:', clubId);

                that.changeFacility(clubId);
                that.currClubId = facilityId;

                if ($(this).find('option:selected').data('is-available-online') && !$(this).find('option:selected').data('is-presale')) {
                    $toggleLink.show();
                } else {
                    $toggleLink.hide();
                }
            });

            $('.browse-classes').click(function (e) {
                e.preventDefault();

                window.location = '/classes/search?clubs=' + that.currClubId;
            });

            EQ.Maps.on('CLUB_MARKER_CLICK', function (data) {
                console.warn('data', data);
                if (data.facility !== null) {
                    var region = EQ.Helpers.getRegionByTitle(data.facility.Region),
                        clubId = data.facility.ClubID;

                    if (that.firstTime && userProfileJson && userProfileJson.FacilityId && _.indexOf(that.blacklist, userProfileJson.FacilityId) === -1) {
                        clubId = EQ.Helpers.getClubIdFromFacilityId(userProfileJson.FacilityId);
                        console.log('||||||||||||||||||||');
                        console.log('clubId', clubId);
                        console.log('facilityId', userProfileJson.FacilityId);
                        that.firstTime = false;
                    }

                    if (region && clubId) {
                        if (that.$regions.val() !== region.ShortName) {
                            that.$regions
                                .prop('selectedIndex', that.$regions.find('option[value="' + region.ShortName + '"]').index())
                                .trigger('change');
                        }

                        if (that.$facilities.val() !== clubId) {
                            that.$facilities
                                .prop('selectedIndex', that.$facilities.find('option[value="' + clubId + '"]').index())
                                .trigger('change');
                        }
                    }
                } else {
                    debug('[NEARME] CLUB_MARKER_CLICK data coming null. Cancelling on logic.');
                }
            });

            //TODO:MR Map freeze. remove this. it is deprecated
            //$('.map-container').on('click', '.map-interaction-lock a .icon-refresh', function (evt) {
            //    evt.preventDefault();
            //
            //    var val = $('.select-wrapper').find('select[name="facilities"]').val();
            //
            //    that.changeFacility(val);


                /*var club = {
                 Address: '54 Murray Street',
                 ClubID: '130',
                 ClubName: 'Tribeca',
                 Country: '',
                 Description: 'Equinox Tribeca',
                 GoogleAddress: '54 Murray Street, New York, NY 10007',
                 Id: '111',
                 Latitude: '40.714182',
                 Longitude: '-74.009723',
                 Region: 'New York',
                 SchedulePDF: 'http://www.equinox.com/admin/groupfitness/pdf/getschedule.ashx?clubid=130',
                 ShortName: 'Tribeca',
                 Telephone: '212.566.6555',
                 URL: 'http://local-mobile.equinox.com/clubs/new-york/downtown/tribeca'
                 };

                 //that.loadNearClubsMap();
                 EQ.Maps.trigger('CLUB_MARKER_CLICK', {
                 facility: club,
                 marker: this
                 });

                 EQ.Maps.fixLayout();*/
           // });

            if (Modernizr.mq('only all and (min-width: 768px)')) {
                // overlay for loading icon that also serves to prevent click
                // through dropdowns or map while loading
                this.$el.prepend('<div class="overlay"></div>');

                // now store overlay in `this`
                this.$overlay = this.$el.find('.overlay');
            } else {
                this.$overlay = $('<div />');
            }

            var opts = {
                lines: 13, // The number of lines to draw
                length: 7, // The length of each line
                width: 2, // The line thickness
                radius: 10, // The radius of the inner circle
                corners: 0, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                color: '#000', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 52, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: '50%', // Top position relative to parent in px
                left: '50%' // Left position relative to parent in px
            };

            var target = document.getElementById('nearme');

            this.spinner = new Spinner(opts).spin(target);

            EQ.Maps.on('BOUNDS_CHANGE', function () {
                console.warn('**** BOUNDS_CHANGE that.loading');
                that.loading();
            });

            EQ.Maps.on('IDLE', function () {
                console.warn('**** IDLE that.loaded');
                that.loaded();
            });

            // for /clubs page
            EQ.Maps.on('IDLE_LOAD', function () {
                console.warn('**** IDLE that.loaded');
                that.loaded();
            });

        },

        loading: function () {
            if (!this.isLoading) {
                var target = document.getElementById('nearme');

                if (Modernizr.mq('only all and (min-width: 768px)')) {
                    this.$overlay.animate({ opacity: 0.6 });
                    this.$overlay.removeClass('disabled');
                }

                debug('[NEARME] loading map...');

                this.spinner.spin(target);
                this.isLoading = true;
            }
        },

        loaded: function () {
            this.spinner.stop();

            if (Modernizr.mq('only all and (min-width: 768px)')) {
                this.$overlay.animate({ opacity: 0 });
                this.$overlay.addClass('disabled');
                this.$overlay.hide();
            }

            debug('[NEARME] finished loading map');

            this.isLoading = false;
        },

        populateRegionsDropdown: function (module, opts) {
            var regionsMarkup = '',
                regions = module._regions;

            var options = opts;

            if (options.defaultText) {
                regionsMarkup += '<option selected="selected" value="' + options.defaultValue + '">' + options.defaultText + '</option>';
            }

            $.each(allRegionsData, function (i, region) {
                if (EQ.Helpers.getAllFacilities(region).length) {
                    // Append region options
                    regionsMarkup += '<option value="' +
                        region.ShortName +
                        (selectedRegion === region.ShortName ? '" selected="selected' : '') +
                        '">' +
                        region.Name +
                        '</option>';
                    regions[region.ShortName] = region;
                }
            });

            module.$regions.html(regionsMarkup);

            // set a default value
            if (selectedRegion) {
                // in case there is more than one instance of the select
                // drop down in the DOM
                for (var i = 0; i < module.$regions.length; i++) {
                    $(module.$regions[i]).next('span.option')
                        .hide()
                        .text($(module.$regions[i]).find('option:selected').text())
                        .css('display', 'inline-block')
                        .trigger('change');
                }
            }
        },

        loadDropDowns: function () {
            var that = this;
            // get the regions in an object $.fn.selectWrapper() would understand
            var regions = EQ.Helpers.normalizeRegionsData();

            // add the select region default value to the drop down
            regions.unshift({
                value: 'Select-Region',
                text: 'Select Region',
                selected: true
            });

            that._regions = EQ.Helpers.getRegions();

            $('.select-regions').selectWrapper({
                data: regions,
                syncInstances: true,
                onChange: function ($el) {
                    var selectedValue = $el.find('option:selected').val();
                    var selectedText = $el.find('option:selected').text();
                    /*var userHomeRegion;

                     if (that.flag && userProfileJson && userProfileJson.FacilityId) {
                     userHomeRegion = EQ.Helpers.getUserDefaultRegion(userProfileJson.FacilityId);
                     selectedText = $(this.$el).find('option[value="' + userHomeRegion.name + '"]');
                     selectedValue = userHomeRegion.id;

                     console.warn('userHomeRegion', userHomeRegion);
                     console.warn('selectedText', selectedText);
                     console.warn('selectedValue', selectedValue);

                     debug('[NEARME] defaultText set to userProfileJson.FacilityId:' + userProfileJson.FacilityId);
                     that.flag = false;

                     console.log('flag is set to true');
                     } else {
                     console.log('flag already set to false');
                     }*/

                    // @sam: change region to user region here
                    console.warn('@@', selectedValue, selectedText);

                    that.loading();
                    that.updateFacilities($el);

                    debug('[NEARME] selectWrapper onChange');

                    if ($('.page').attr('data-region') === 'undefined') {
                        that.loadRegionInfo(selectedValue, selectedText);
                    }
                },
                onReady: function ($el) {
                    debug('[NEARME] selectWrapper onReady ' + $el);
                    //that.updateFacilities($el);
                },
                defaultValue: ($('.page').attr('data-region')) ? $('.page').attr('data-region') : null
            });

            //that.loadNearClubsMap();
        },

        setDefaultMap: function () {
            var that = this;

            EQ.Maps.Map(that.$el.find('.map-container'), 41.850033, -87.6500523, {
                zoom: 3,
                minZoom: 3
            });
        },

        /**
         * setDefault
         *
         * In case the user has not chosen to allow or deny, set the map to show
         * the U.S. map and some default option in the dropdown
         */
        setDefault: function () {
            // Logged In User
            if (!_.isEmpty(window.user)) {
                var facility = EQ.Helpers.getFacilityById(userProfileJson.FacilityId),
                    region = EQ.Helpers.getUserDefaultRegion() || { value: 'Select-Region', name: 'Select Region' };

                if (!_.isEmpty(facility)) {
                    EQ.Maps.trigger('CLUB_SET_CENTER', {
                        lat: facility.Latitude,
                        lng: facility.Longitude
                    });
                    selectedRegion = facility.Region;
                    this.populateRegionsDropdown(this, { defaultText: region.name, defaultValue: region.value });
                } else {
                    this.defaultMapLocation();
                }
            }
            // Logged Out User
            else {
                this.defaultMapLocation();
            }
        },

        defaultMapLocation: function () {
            EQ.Maps.trigger('CLUB_SET_CENTER', {
                lat: 41.850033,
                lng: -87.6500523
            });
            selectedRegion = 'Select Region'; // val() to apply to the selected option
            this.populateRegionsDropdown(this, { defaultText: 'Select Region', defaultValue: 'Select-Region' });
        },

        load: function () {
            var that = this;

            this.loadDropDowns();

            EQ.Maps.Load(function () {
                that.setDefault();
            });

            EQ.Maps.on('IDLE_LOAD', function () {
                // Logged In User
                if (!_.isEmpty(window.user)) {
                    var club = EQ.Helpers.getFacilityById(userProfileJson.FacilityId);

                    if (!_.isEmpty(club)) {
                        var clubId = club.Id,
                            region = club.Region.replace(/ /g, '-');

                        //Check selectedRegion and default to that.
                        if (region) {
                            if ($('.tab2Select').is(':visible')) {
                                $('select.tab2Select > option').each(function (i, el) {
                                    if ($(el).val() === region) {
                                        $(el).parent().prop('selectedIndex', i).trigger('change');
                                        selectedRegion = region;
                                    }
                                });
                            } else {
                                $('select.tab1Select > option').each(function (i, el) {
                                    if ($(el).val() === region) {
                                        $(el).parent().prop('selectedIndex', i).trigger('change');
                                        selectedRegion = region;
                                    }
                                });
                            }
                            /*$('select[name="regions"] > option').each(function (i, el) {
                                if ($(el).val() === region) {
                                    $(el).parent().prop('selectedIndex', i).trigger('change');
                                    selectedRegion = region;
                                    return false;
                                }
                            });*/
                        }
                        //Check if there is a currentClub
                        if (clubId) {
                            that.changeFacility(clubId);
                        }
                    } else {
                        that.defaultMapLocation();
                    }
                }
                // Logged Out User
                else {
                    EQ.Geo.getNearestClub(function (club) {
                        var clubId = club.Id,
                            region = club.Region.replace(/ /g, '-');

                        //Check selectedRegion and default to that.
                        if (region) {
                            if ($('.tab2Select').is(':visible')) {
                                $('select.tab2Select > option').each(function (i, el) {
                                    if ($(el).val() === region) {
                                        $(el).parent().prop('selectedIndex', i).trigger('change');
                                        selectedRegion = region;
                                    }
                                });
                            } else {
                                $('select.tab1Select > option').each(function (i, el) {
                                    if ($(el).val() === region) {
                                        $(el).parent().prop('selectedIndex', i).trigger('change');
                                        selectedRegion = region;
                                    }
                                });
                            }
                        }
                        //Check if there is a currentClub
                        if (clubId) {
                            that.changeFacility(clubId);
                        }
                    });
                }
            });
        },

        show: function (club) {
            var $club = $('.club-information');
            $club.find('[data-club-href="searchclasses"]').attr('href', '/classes/search?clubs=' + club.Id);
            $club.find('[data-club-href="searchclasses"]').on('click', function (e) {
                if (e.handled !== true) {
                    window.tagData.searchLink = window.tagData.searchLink || {};
                    window.tagData.searchLink = {
                        type: 'club',
                        value: club.ClubID
                    };
                    window.track('clickClassSearchLink', window.tagData.searchLink);
                    e.handled = true;
                }
            });
            console.warn('nearme > on show');
            $.each(club, function (key, value) {
                if (typeof key === 'string') {
                    key = key.toLowerCase();
                    $club.find('[data-club-text="' + key + '"]').text(value);
                    if (key === 'telephone') {
                        var $phoneItem = $club.find('[data-club-text="' + key + '"]');
                        //from . to -
                        var formatedValue = value.replace(/\./g, '');
                        var phoneLink = 'tel:' + formatedValue;
                        $phoneItem.attr('href', phoneLink);
                    }
                    $club.find('[data-club-href="' + key + '"]').attr('href', value);
                }
            });

            $club.removeClass('hidden');
            $club.find('a[data-club-href="schedulepdf"]').on('click', function (e) {
                if (e.handled !== true) {
                    window.tagData.pdfLink = window.tagData.pdfLink || {};
                    window.tagData.pdfLink = {
                        facilityId: club.ClubID
                    };
                    window.track('clickClassPdf', window.tagData.pdfLink);
                    e.handled = true;
                }
            });
        },

        changeFacility: function (clubId) {
            this.$el.trigger('MAP_LOADING');

            if (!this.clubsMap) {
                this.clubsMap = $('.map-container').data('clubsMap');
            }

            if (typeof this.clubsMap === 'undefined') {
                return; // who knows why is undefined. just return so nothing else breaks. argh!
            }

            console.warn('## this.clubsMap', this.clubsMap);

            var facility = this.clubsMap.getFacilityByClubId(clubId);

            if (facility) {
                if ($('.map-container').find('.gm-style').length > 1) {
                    $('.map-container').find('.gm-style:nth-child(2)').remove();
                }
                this.clubsMap.Map.fit([facility], -1);

                this.show(facility);
            }
        },

        /**
         * loadNearClubsMap
         *
         * Does a Geolocation check for the nearest club and then triggers a click
         * on the maps with this club object as the facility in focus. It then trigger
         * the fixLayout method to fix any flakiness on the re-rendering
         *
         * Sample club object:
         *        var club = {
         *           Address: '54 Murray Street',
         *           ClubID: '130',
         *           ClubName: 'Tribeca',
         *           Country: '',
         *           Description: 'Equinox Tribeca',
         *           GoogleAddress: '54 Murray Street, New York, NY 10007',
         *           Id: '111',
         *           Latitude: '40.714182',
         *           Longitude: '-74.009723',
         *           Region: 'New York',
         *           SchedulePDF: 'http://www.equinox.com/admin/groupfitness/pdf/getschedule.ashx?clubid=130',
         *           ShortName: 'Tribeca',
         *           Telephone: '212.566.6555',
         *           URL: 'http://local-mobile.equinox.com/clubs/new-york/downtown/tribeca'
         *       }
         *
         * @param clubId
         */
        loadNearClubsMap: function () {
            EQ.Geo.getNearestClub(function (club) {
                debug('[NEARME] Classes closest club:', club);

                // @todo: @sam add this somewhere so the big marker shows onLoad
                EQ.Maps.trigger('CLUB_MARKER_CLICK', {
                    facility: club,
                    marker: this
                });

                EQ.Maps.fixLayout();
            });
        },

        /**
         * updateFacilities
         *
         * Populates the `Club Facilities` drop down(s) with all the clubs in that region/area
         *
         * @param el it's safer to pass $(this) object from the onchange to target only this instance
         */
        updateFacilities: function (el) {
            // if el is passed, use that instead as there might be multiple instances of the drop down
            this.$regions = el || this.$regions;

            var facilitiesMarkup = '',
                region = this._regions[this.$regions.val()],
                facilities,
                $component = this.$regions.closest('[data-component="nearme"]'),
                $toggleLink = $component.find('.club-information .toggle-link');

            if (!region) {
                console.warn('No region for selected value:', this.$regions.val());
                return;
            }

            facilities = EQ.Helpers.getAllFacilities(region);

            $.each(facilities, function (i, club) {
                facilitiesMarkup += '<option value="' + club.ClubID + '" data-is-available-online="' + club.IsAvailableOnline + '" data-is-presale="' + club.IsPresale + '">' + club.ClubName + '</option>';

                EQ.Helpers.setPositionGetter(club);
            });

            this.$facilities.html(facilitiesMarkup);

            var defaultText = $(this.$facilities[0]).find('option:selected').text();
            var defaultValue = $(this.$facilities[0]).find('option:selected').val();
            var clubId = null;

            if (userProfileJson && userProfileJson.FacilityId && _.indexOf(this.blacklist, userProfileJson.FacilityId) === -1) {
                clubId = EQ.Helpers.getClubIdFromFacilityId(userProfileJson.FacilityId);


                if ($(this.$facilities[0]).find('option[value="' + clubId + '"]').text() !== '') {
                    defaultText = $(this.$facilities[0]).find('option[value="' + clubId + '"]').text();
                    defaultValue = clubId;

                    console.log('@defaultText', defaultText);
                    console.log('@defaultValue', defaultValue);

                    console.log('userProfileJson.FacilityId', userProfileJson.FacilityId);

                    debug('[NEARME] defaultText set to userProfileJson.FacilityId:' + userProfileJson.FacilityId);
                } else {
                    debug('[NEARME] aborting population of dropdown by userProfileJson');
                }
            } else {
                //this.loadNearClubsMap();
                console.log('Either logged out or FacilityId blacklisted');
            }

            console.log('$$', defaultText, defaultValue);

            this.$facilities.val(defaultValue);

            var that = this;
            setTimeout(function () {
                that.$facilities.trigger('change');
            }, 3000);

            this.$facilities.next('span.option').text(defaultText).css('width', '100%');

            if (this.$facilities.find('option:eq(0)').data('is-available-online') && !this.$facilities.find('option:eq(0)').data('is-presale')) {
                $toggleLink.show();
            } else {
                $toggleLink.hide();
            }
        },

        loadRegionInfo: function (selectedValue, selectedText) {
            debug('[NEARME] loading region: ' + selectedValue);
            $('.region-information .title').text(selectedText);
            $('.region-information .description').load('/regions/' + selectedValue + ' .paragraph p');
            $('.region-information').slideDown();
        }
    };

    App.Components.nearme = function ($el, type) {
        if ($el.data('nearme')) {
            return $el.data('nearme');
        }

        $el.data('nearme', new NearMe($el, type));
    };

}(window.App));
