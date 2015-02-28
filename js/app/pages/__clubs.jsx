(function (global, App) {
    'use strict';
    /* global EQ, debug */

    var Clubs = App.Pages.Clubs = {};

    Clubs.Region = {
        showAll: function () {
            var that = this;

            Clubs.Map.markers.empty();

            $.each(Clubs.Data, function (i, region) {
                if (!region.bounds) {
                    region.bounds = EQ.Maps.Bounds(Clubs.getChildrenPoints(region));
                }

                that.addMarker(region);
            });

            EQ.Maps.once('IDLE', Clubs.updateLabelPosition);
        },
        addMarker: function (region) {
            Clubs.Map.markers.add({
                lat: region.bounds.getCenter().lat(),
                lng: region.bounds.getCenter().lng(),
                content: Clubs.Icon.Region(region),
                click: function (evt) {
                    evt.stopPropagation();

                    Clubs.Region.select(region);
                }
            }, true);
        },
        showClubs: function (region) {
            debug('[Clubs] Showing clubs markers');

            EQ.Maps.once('BOUNDS_CHANGE', function (data) {
                debug('[Clubs] Setting markerThreshold:', data.map.getZoom());
                Clubs.markerThreshold = data.map.getZoom();
            });

            // Fit bounds
            Clubs.Map.fitBounds(region.bounds);

            // Show club markers, as this is a subregion
            Clubs.Club.showAll();
        },
        showSubs: function (region) {
            debug('[Clubs] Region level (showing Subregion labels)');

            // As per Mark requested, prioritize showing Manhattan areas.
            if (region.Name === 'New York') {
                region.bounds.extend(EQ.Maps.Point({
                    lat: 40.45,
                    lng: -74.15
                }));
            }

            // Fit bounds
            Clubs.Map.fitBounds(region.bounds);

            // Show region level.
            Clubs.Subregion.showAll();
        },
        select: function (region) {
            var that = this;

            if (!region.bounds) {
                region.bounds = EQ.Maps.Bounds(Clubs.getChildrenPoints(region));
            }

            $.each(region, function (property, value) {
                if (typeof value === 'string') {
                    var $el = $('[data-region-text="' + property.toLowerCase() + '"]');

                    if ($el.length) {
                        $el.html(value);
                    }
                }
            });

            // Append description
            if (!Clubs.isRegionLanding) {
                $('.region-information .description').load('/regions/' + region.ShortName + ' .paragraph p');
            }

            // If subregions, show the closest subregion.
            if (region.SubRegions && region.SubRegions.length) {
                debug('[Clubs] It has subregions');
                EQ.Geo.getNearestClub(function (club) {
                    var candidate;

                    debug('[Clubs] Nearest club is:', club);

                    // Make sure club is not undefined and also current region is same as club region
                    if (club && club.Region === region.Title) {
                        $.each(region.SubRegions, function (i, subregion) {
                            $.each(subregion.Facilities, function (j, facility) {
                                if (facility.Id === club.Id) {
                                    candidate = subregion;
                                }
                            });
                        });
                    }

                    if (candidate && !Clubs.isRegionLanding) {
                        debug('[Clubs] Chosen subregion is:', candidate.Title);
                        candidate.bounds = EQ.Maps.Bounds(Clubs.getChildrenPoints(candidate));

                        that.showClubs(candidate);
                    } else {
                        that.showSubs(region);
                    }
                });
            } else {
                that.showClubs(region);
            }
        }
    };

    Clubs.Subregion = {
        showAll: function () {
            var that = this;

            Clubs.Map.markers.empty();

            // FIXME: Ideally we should cache them.
            // if (this._markers) {
            //     return Clubs.Map.markers.set(this._markers).redraw();
            // }

            $.each(Clubs.Data, function (i, region) {
                if (!region.bounds) {
                    region.bounds = EQ.Maps.Bounds(Clubs.getChildrenPoints(region));
                }

                if (region.SubRegions && region.SubRegions.length) {
                    // Has subregions, add each subregions marker
                    $.each(region.SubRegions, function (j, subregion) {
                        if (!subregion.bounds) {
                            subregion.bounds = EQ.Maps.Bounds(Clubs.getChildrenPoints(subregion));
                        }

                        that.addMarker(subregion);
                    });
                } else {
                    // No subregion, just add the regular region marker
                    Clubs.Region.addMarker(region);
                }
            });

            EQ.Maps.once('IDLE', Clubs.updateLabelPosition);
        },
        addMarker: function (subregion) {
            Clubs.Map.markers.add({
                lat: subregion.bounds.getCenter().lat(),
                lng: subregion.bounds.getCenter().lng(),
                content: Clubs.Icon.Subregion(subregion),
                click: function (evt) {
                    evt.stopPropagation();

                    // Fit bounds
                    Clubs.Map.fitBounds(subregion.bounds);

                    // Show club markers
                    Clubs.Club.showAll();
                }
            }, true);
        }
    };

    Clubs.Club = {
        parse: function (facility) {
            EQ.Helpers.setPositionGetter(facility);

            Clubs.Map.markers.add({
                lat: facility.Latitude,
                lng: facility.Longitude,
                content: Clubs.Icon.Marker.regular(),
                click: function (evt) {
                    // Cancel bubbling
                    evt.stopPropagation();

                    // Trigger marker click
                    EQ.Maps.trigger('CLUB_MARKER_CLICK', {
                        facility: facility,
                        marker: this
                    });
                }
            }, true);

            return this;
        },
        getLink: function (facility) {
            return facility.URL || ('/Clubs/' + facility.ShortName);
        },
        show: function (data) {
            // Throttle for #DPLAT-561
            if (Clubs.lastClubShow) {
                return false;
            }
            Clubs.lastClubShow = true;
            setTimeout(function () {
                Clubs.lastClubShow = false;
            }, 1000);

            // Toggle visibility if clicked on an active marker
            if (data.marker && data.marker.getContent  && data.marker.getContent().indexOf('active') > -1) {
                return Clubs.Club.hide();
            } else {
                console.warn('Warning: something seems wrong with data or data.marker', data);
            }

            if (typeof data.marker === 'undefined' || !data.marker.getPosition) {
                console.warn('Warning: data.marker undefined. Cancelling show()...');
                return;
            }

            var position = data.marker.getPosition(),
                link = Clubs.Club.getLink(data.facility);

            // Center map in marker
            Clubs.Map.map.panTo(position);

            // Reset all icons
            Clubs.Map.markers.setIcon(Clubs.Icon.Marker.regular());
            Clubs.$el.find('.icon-marker-dot').addClass('darker');

            // Set current to active
            data.marker.setContent(Clubs.Icon.Marker.active(data.facility));

            // Set extra info
            if (Clubs.$info) {
                Clubs.$info.find('[data-club-href="url"]').attr('href', link);
                Clubs.$info.find('[data-club-text="telephone"]').attr('href', 'tel:' + data.facility.Telephone.replace(/\./g, '-'));

                $.each(data.facility, function (property, value) {
                    if (typeof value === 'string') {
                        var $el = $('[data-club-text="' + property.toLowerCase() + '"]');

                        if ($el.length) {
                            $el.html(value);
                        // } else {
                        //     console.log('Not using region property: ', property);
                        }
                    }
                });
            }

            // Show extra info
            $('div.club-information').removeClass('hidden');

            // Mobile usability.
            if (EQ.Helpers.getDeviceSize() === 'small') {
                var mapTopOffset = Clubs.$el.offset().top - $('nav.main').height();
                $('html, body').animate({
                    scrollTop: mapTopOffset
                }, 300);
            }

            return this;
        },
        hide: function () {
            // Reset all icons only if Clubs are active
            if (Clubs.layout === 'Club') {
                Clubs.Map.markers.setIcon(Clubs.Icon.Marker.regular());
                Clubs.$el.find('.icon-marker-dot').removeClass('darker');
            }
        },
        showAll: function () {
            Clubs.layout = 'Club';
            // FIXME: next line is causing the marker to do nothing in mobile.
            // Perhaps it's a race condition between showAll() and ZOOM_CHANGE
            Clubs.preventZoomChange = true;

            Clubs.Map.markers.empty();

            if (!this._facilities) {
                var facilities = [];

                $.each(Clubs.Data, function (i, region) {
                    facilities = facilities.concat(EQ.Helpers.getAllFacilities(region));
                });

                this._facilities = facilities;
            }

            $.each(this._facilities, function (i, club) {
                Clubs.Club.parse(club);
            });
        }
    };

    Clubs.Icon = {
        Marker: {
            regular: function () {
                return '<div class="custom-marker">' +
                        '<span class="icon-marker-dot"></span>' +
                        '</div>';
            },
            active: function (facility) {
                return '<div class="custom-marker active">' +
                        '<span class="icon-marker-o"></span>' +
                        '<h5>' + facility.ClubName + '</h5>' +
                        '<div class="is-tablet is-desktop">' +
                        '<address>' + facility.GoogleAddress + '</address>' +
                        '<a href="' + Clubs.Club.getLink(facility) + '" class="button white fat cta">More Info</a>' +
                        '</div>' +
                        '</div>';
            }
        },
        Subregion: function (subregion) {
            var n = subregion.Facilities.length;

            return '<div class="custom-marker caption">' +
                    '<span>' + subregion.Name + '</span>' +
                    '<small>' + n + ' Club' + (n === 1 ? '' : 's') + '</small>' +
                    '</div>';
        },
        Region: function (region) {
            var n = region.Facilities.length;

            $.each(region.SubRegions, function (i, subregion) {
                n += subregion.Facilities.length;
            });

            return '<div class="custom-marker caption">' +
                    '<span>' + region.Name + '</span>' +
                    '<small>' + n + ' Club' + (n === 1 ? '' : 's') + '</small>' +
                    '</div>';
        }
    };

    Clubs.getChildrenPoints = function (region) {
        var that = this,
            points = [];

        // either has facilities under subregions,
        // or just facilities but not both.
        if (region.SubRegions && region.SubRegions.length) {
            $.each(region.SubRegions, function (i, subregion) {
                points = points.concat(that.getChildrenPoints(subregion));
            });
        } else if (region.Facilities.length) {
            points = $.map(region.Facilities, function (club) {
                if (club.Latitude && club.Longitude) {
                    return EQ.Maps.Point({
                        lat: club.Latitude,
                        lng: club.Longitude
                    });
                } else {
                    console.error('A club doesn\'t have Lat Lng properties.', club);
                }
            });
        }

        return points;
    };

    Clubs.updateLabelPosition = function () {
        debug('[Clubs] updatePosition length:', $('.custom-marker.caption').length);

        var labels = [],
            containerY,
            currentY;

        $('.custom-marker.caption').each(function () {
            /* jshint bitwise: false */
            // Using bitwise for performance reasons as integer cast.
            var $el = $(this),
                offset = $el.offset();

            // Objects containing only y position because
            // we care about vertical spacing only.
            labels.push({
                y: offset.top,
                height: ($el.height() >> 0),
                x: offset.left,
                width: ($el.width() >> 0),
                // Parent div containing position (the one with top:x)
                el: $el.offsetParent()
            });
        });

        // Only do stuff if there are captions (labels) - subregions.

        if (labels.length) {
            // Sort them by Y position ASC.
            labels.sort(function (a, b) {
                return a.y - b.y;
            });

            // Minimum Y position, the first one of the sorted.
            currentY = labels[0].y - 1;
            // Get offsetY corresponding to the container of all elements.
            containerY = labels[0].el.offsetParent().offset().top;

            // Iterate through all looking for collisions.
            for (var i = 0, l = labels.length; i < l; i++) {
                var label = labels[i];
                // Does it fit in current available Y?
                if (label.y > currentY) {
                    currentY = label.y + label.height;
                } else {
                    // TODO: this guarantees right to left but not left to right.
                    var prevLabel = labels[i - 1];
                    if (label.x > prevLabel.x + prevLabel.width) {
                        debug('[Clubs] Should not collide:', label.el, prevLabel.el);
                    } else {
                        // Move Google parent to available Y pos.
                        label.el.css('top', currentY - containerY);
                        currentY += label.height;
                    }
                }
            }
        }

        // console.timeEnd('updatePosition');
    };

    Clubs.hasToChangeLayout = function (zoom) {
        // FIXME: every showAll() should set the layout, instead of this fn
        var layout = null,
            subregionThreshold = Clubs.subregionThreshold || 9,
            markerThreshold    = Clubs.markerThreshold || 13;

        if (zoom < subregionThreshold) {
            layout = 'Region';
        } else if (zoom < markerThreshold) {
            layout = 'Subregion';
        } else {
            layout = 'Club';
        }

        if (layout !== Clubs.layout) {
            Clubs.layout = layout;
            return true;
        }

        return false;
    };

    Clubs.onMapsLoaded = function () {
        $('.club-finder').addClass('visible');

        Clubs.$el = $('.map-container');

        var minZoom = (EQ.Helpers.getDeviceSize() === 'small') ? 7 : 10;

        Clubs.Map = new EQ.Maps.Map(Clubs.$el[0], 41.850033, -87.6500523, {
            zoom: minZoom,
            minZoom: minZoom
        });

        Clubs.Map.mobilePanning();

        EQ.Maps.on('CLUB_MARKER_CLICK', Clubs.Club.show);
        EQ.Maps.on('MAP_CLICK', function () {
            if (!Clubs.lastClubShow) {
                Clubs.Club.hide();
            }
        });

        EQ.Maps.on('ZOOM_CHANGE', function (data) {
            // Loading the first time triggers zoom change, prevented with a flag.
            if (Clubs.preventZoomChange) {
                Clubs.preventZoomChange = false;
                return false;
            }

            if (Clubs.hasToChangeLayout(data.zoom)) {
                Clubs[Clubs.layout].showAll();
            } else if (Clubs.layout === 'Club') {
                // Only hide if zoom was triggered from a previous Club showing state
                Clubs.Club.hide();
            } else {
                // May not have to change layout but may be diff zoom level on subregions
                Clubs.updateLabelPosition();
            }
        });

        if (Clubs.isRegionLanding) {
            var candidate = EQ.Helpers.getRegionByTitle($('.clubs-region').data('region'));

            if (candidate) {
                Clubs.preventZoomChange = true;
                Clubs.Region.select(candidate);
            }
        } else {
            EQ.Geo.getNearestRegion(function (candidate) {
                if (candidate) {
                    Clubs.preventZoomChange = true;
                    Clubs.Region.select(candidate);
                }
            });
        }
    };

    Clubs.Data = global.allRegionsData;

    /**
     * setupTabs
     *
     * Initializes the simpleTabs plugin
     *
     * @public
     */
    Clubs.setupTabs = function () {
        if ($.fn.simpleTabs) {
            $('.tabs-simple').simpleTabs({
                onTabShown : function () {
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
    };

    /**
     * hideOfflineMsg
     *
     * By default we show a message to the user saying that they don't have allow access
     * to their geolocation API. We have to leave it visible by default because there
     * doesn't seem to be a way to know if the user has not chosen one of the two options
     * in the geo prompt: `allow` or `deny`
     *
     * @public
     */
    Clubs.hideOfflineMsg = function () {
        Clubs.$views.$geoOffline.hide();
    };

    /**
     * setDefaultMap
     *
     * There is no way of knowing if the user has not yet made a decision to `allow` or `deny`;
     * therefore, while we find out the geo location of the user && as long as the map API is
     * loaded, we will load this temp default map. Right now, it loads as a new instance, as
     * opposed to using the same instance we've been using. Need to find an elegant way to do
     * this; just not familiar enough with this codebase.
     *
     * @todo set default map in the same instance as Clubs.onMapsLoaded()
     *
     * @public
     */
    Clubs.setDefaultMap = function () {
        if (!Clubs.userLocationKnown) {
            Clubs.$el = $('.map-container');

            var minZoom = 3; //(EQ.Helpers.getDeviceSize() === 'small') ? 7 : 10;

            // set to load the entire U.S. map
            Clubs.Map = new EQ.Maps.Map(Clubs.$el[0], 41.850033, -87.6500523, {
                zoom: minZoom,
                minZoom: minZoom
            });

            Clubs.Club.showAll();
        }
    };

    /**
     * setTemporaryInfo
     *
     * In case user does not allow/deny geo access we load a temporary map of the U.S.
     * We have to do this mostly because we don't have a certain way of knowing if the
     * user has not chosen either `allow` or `deny`. google.geo.getCurrentPosition seems
     * to only be able to reliably tell you if the user `allowed` or `denied` access
     * but not if the user has not chosen anything
     *
     * @public
     */
    Clubs.setTemporaryInfo = function () {
        Clubs.setDefaultMap();
    };


    /**
     * Bindings
     *
     * Store all bindings in one place for sanity's sake
     *
     * @public
     */
    Clubs.bindings = function () {
        Clubs.$views.$geoOffline.find('a').on('click', function (e) {
            e.preventDefault();
            $(this).closest('.geo-offline').hide();
        });
    };

    /**
     * Views
     *
     * Since there isn't any views or separation of concerns in this app, let's
     * at least create a dummy view here and store the jQuery selectors into
     * memory
     *
     * @type {{$geoOffline: (*|jQuery|HTMLElement)}}
     */
    Clubs.$views = {
        $geoOffline : $('.geo-offline')
    };

    /**
     * userLocationKnown
     *
     * used for avoiding the default map overriding the user geolocated map
     *
     * @type {boolean}
     */
    Clubs.userLocationKnown = false;

    Clubs.init = function (region) {
        if (true) {
            return; // @sam remove me
        }
        // !! casts to boolean
        Clubs.isRegionLanding = !!region;

        Clubs.$finder = $('.club-finder');
        Clubs.$info = $('div.club-information');

        Clubs.bindings(); // let's store all the bindings in one place
        Clubs.setupTabs();

        //EQ.Helpers.getAllRegions(); //tmp
        //EQ.Maps.Load(Clubs.setTemporaryInfo);

        EQ.Maps.on('CLUB_SET_CENTER', function (loc) {
            Clubs.Map.map.setCenter({lat: loc.lat, lng: loc.lng});
            Clubs.Map.map.minZoom = 3;
            Clubs.Map.unfreeze();
            Clubs.Map.markers = { map: {}, markers: []};

            // putting setZoom in a timeout is the only way i can get
            // this fucker to act right.
            setTimeout(function () {
                Clubs.Map.map.setZoom(1); //that.Map.markers.markers,
            }, 1000);
        });

        EQ.Geo.getLatLng(function () {
            debug('[Clubs Finder] ALLOWED TO USE GEO API');
            Clubs.hideOfflineMsg();
            Clubs.userLocationKnown = true;
            EQ.Maps.Load(Clubs.onMapsLoaded);
        }, function () {
            // On error, simply won't show the map.
            // UNLESS it's a region landing page
            debug('[Clubs Finder] NOT ALLOWED TO USE GEO API');

            if (Clubs.isRegionLanding) {
                EQ.Maps.Load(Clubs.onMapsLoaded);
            } else {
                $('.region-information').hide();
                Clubs.$finder.removeClass('module')
                        .find('.region-list-container').removeClass('module');
            }
        });

        var $links = $('.switch-views nav a');
        $links.on('click', function () {
            $links.removeClass('active').filter(this).addClass('active');
            Clubs.$finder.toggleClass('listing');
        });
    };

} (window, window.App));