(function (global) {
    'use strict';

    var
    // Library namespace
        Geo = {},

    // Time To Live for geolocation cache: 1hr
        TTL = 1000 * 60 * 60,

        geolocation = navigator.geolocation,
        cache,

    // Save to localStorage
        save = function () {
            if (localStorage && cache) {
                var cacheObj = {}; // We use a new object since FF seems to have issues serializing some objects like Position or Location
                cacheObj.now = (+new Date());
                cacheObj.coords = {
                    'latitude': cache.coords.latitude,
                    'longitude': cache.coords.longitude
                };

                localStorage.setItem('geolocation', JSON.stringify(cacheObj));
            }
        },

    // Load from localStorage
        load = function () {
            if (localStorage && cache) {
                cache = JSON.parse(localStorage.getItem('geolocation'));

                // Reset cache if TTL expired
                debug('[GEO] 1) cache now', cache.now);
                if (cache && (+new Date() >= cache.now + TTL)) {
                    debug('[GEO] 1b) cache TTL expired');
                    cache = null;
                }
            }
        };

    /**
     * Get user geolocation, fallbacks to Google JS API if no native support.
     * @param   {Function} [Optional] successHandler Callback for success.
     * @param   {Function} [Optional] errorHandler Callback for errors.
     * @see     https://gist.github.com/tomasdev/3163571
     */
    Geo.getLatLng = function (successHandler, errorHandler) {
        successHandler = successHandler || function () {};
        errorHandler = errorHandler || successHandler || function () {};

        // Try cached version first
        load();

        if (cache) {
            debug('[GEO] 2) cache exists as', cache);

            debug('[GEO] Hitting cache with:', cache);
            return successHandler(cache);
        } else {
            debug('[GEO] no cache: ', cache);
            //return  errorHandler();
        }

        // Otherwise calculate
        if (geolocation) {
            debug('[GEO] 3a) updating geo location...');
            // Native support
            return geolocation.getCurrentPosition(function (data) {
                cache = data;
                save();
                debug('[GEO] Browser geolocation API with:', data);
                if (window.location.hash === '#geo') {
                    alert('You previously chose to Allow Geo Access');
                }
                successHandler(data);
            }, function(err) {
                debug('[GEO] You previously chose to Deny Geo Access ' + err);
                if (window.location.hash === '#geo') {
                    alert('You previously chose to Deny Geo Access');
                }
                errorHandler();
            }, {
                timeout: 5000
            });
        } else {
            debug('[GEO] 3b) updating geo location...');
            // Fallback to Google JS API
            $.getScript('//www.google.com/jsapi', function () {
                /* global google */
                // sometimes ClientLocation comes back null
                if (google.loader.ClientLocation) {
                    cache = {
                        coords: {
                            'latitude': google.loader.ClientLocation.latitude,
                            'longitude': google.loader.ClientLocation.longitude
                        }
                    };
                }

                debug('[GEO] Fallback geolocation:', cache);

                successHandler(cache);
            });
        }
    };

    /**
     * A way to flush the geo localStorage cache for debugging purposes
     */
    Geo.flushCache = function () {
        if (localStorage) {
            localStorage.removeItem('geolocation');
            localStorage.removeItem('geolocation.nearestClub');
        }

        cache = null;
    };

    /**
     * Flush cache and get new latitude and longitude as per <Geo.getLatLng> signature.
     */
    Geo.refresh = function () {
        this.flushCache();
        this.getLatLng.apply(this, arguments);
    };

    /**
     * Fetch nearest clubs using back-end service if not already cached.
     * @param  {Object} options Contains `.lat`, `.lng`, `.callback`
     */
    Geo.fetchNearestClub = function (options) {
        if (localStorage) {
            var nearestClub = JSON.parse(localStorage.getItem('geolocation.nearestClub'));
            if (nearestClub) {
                return options.callback(nearestClub);
            }
        }

        var allFacilities = [],
            club;

        $.each(allRegionsData, function (i, region) {
            allFacilities = allFacilities.concat(EQ.Helpers.getAllFacilities(region));
        });

        EQ.Maps.Load(function () {
            club = EQ.Helpers.getClosestWithin(allFacilities, {
                Latitude: options.lat,
                Longitude: options.lng
            });

            if (localStorage) {
                localStorage.setItem('geolocation.nearestClub', JSON.stringify(club));
            }

            options.callback(club);
        });
    };

    /**
     * Get nearest club for user's location
     * @param  {Function} callback Function that will be called on either success or failure passing the result (club or null respectively)
     */
    Geo.getNearestClub = function (callback) {
        /* global nearestFacility */
        Geo.getLatLng(function (data) {
            if (data && data.coords) {
                Geo.fetchNearestClub({
                    lat: data.coords.latitude,
                    lng: data.coords.longitude,
                    callback: callback
                });
                debug('[GEO] Geo.getNearestClub case 1');
            } else if (typeof nearestFacility !== 'undefined') {
                debug('[GEO] Geo.getNearestClub case 2');
                callback(nearestFacility);
            } else {
                debug('[GEO] Geo.getNearestClub case 3');
                // Case of errors such as denied Geo
                callback(null);
            }
        });
    };

    /**
     * Get nearest region for user's location
     * @param  {Function} callback Function that will be called on either success or failure passing the result (region or null respectively)
     */
    Geo.getNearestRegion = function (callback, errorhandler) {
        Geo.getNearestClub(function (club) {
            // sometimes it returns undefined. Why you ask? I dunno, but i do know i want to go to bed soon
            if (typeof club !== 'undefined' && club !== null) {
                callback(global.EQ.Helpers.getRegionByTitle(club.Region));
            } else {
                debug('[GEO] Geo.getNearestClub failed. club object is null or undefined.');
            }
        });
    };

    // Just in case, fallback for loading order issues.
    global.EQ = global.EQ || {};
    // Expose globally
    global.EQ.Geo = Geo;

} (window));