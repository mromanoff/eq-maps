(function (global) {
    'use strict';
    /* global debug, google, RichMarker, RichMarkerPosition */

    var CALLBACK_NAME = 'googleMapsLoadedCallback' + (+new Date());
    var MAPS_API_URL = function (callback) {
        var mapUrl = 'https://maps.googleapis.com/maps/api/js';
        var mapUrlFragment = '&v=3.16&libraries=geometry&callback=' + callback;
        //var mapKey = 'AIzaSyALmAA_5_F2DcTKVRilfusfS1ULr_sB9T8';
        var mapKey = 'AIzaSyDy2_C0CnYm7HBfgGugr-vVOsPZPslcgpM';

        var mapClientId = 'gme-equinoxfitness';

        var url = location.href;
        var domainName = url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];

        if (domainName.split('.')[0] === 'equinox') {
            mapUrl += '?client=' + mapClientId + mapUrlFragment;
        } else {
            mapUrl += '?key=' + mapKey + mapUrlFragment;
        }

        return mapUrl;
    };

    // Map Styles generated with http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html
    var googleMapStyles = [{
        'stylers': [
            {'visibility': 'simplified'},
            {'saturation': -100},
            {'invert_lightness': true},
            {'lightness': -15}
        ]
    }, {
        'featureType': 'road',
        'elementType': 'labels',
        'stylers': [
            {'visibility': 'on'},
            {'lightness': -50}
        ]
    }, {
        'featureType': 'poi',
        'stylers': [
            {'visibility': 'off'}
        ]
    }];

    // Helper array for Loader queue
    var loaderCallbacks = [];

    // Helper map for listeners
    var listeners = {};

    // Boolean for events queue
    var isLoaded = false;

    // Events queue list
    var eventsQueue = [];

    // Load async the lib
    var loadScript = function () {
        if (document.getElementById('googlemapsscript')) {
            return false;
        }

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = MAPS_API_URL(CALLBACK_NAME);
        script.id = 'googlemapsscript';
        document.body.appendChild(script);
    };

    var parseQueue = function () {
        for (var i = 0, l = eventsQueue.length; i < l; i++) {
            Maps.trigger(eventsQueue[i].eventName, eventsQueue[i].data);
        }
    };

    // EQ namespace
    var EQ = global.EQ || {};

    // Library namespace
    var Maps = {};

    var MapMarkers = function (map) {
        this.map = map;
        this.markers = [];
    };

    MapMarkers.prototype = {
        add: function (club) {

            if (typeof RichMarker === 'undefined') {
                throw new Error('RichMarker library has not yet been loaded.');
            }

            var marker = new RichMarker({
                    position: new google.maps.LatLng(club.lat, club.lng),
                    map: this.map,
                    shadow: false,
                    anchor: RichMarkerPosition.MIDDLE,
                    content: club.content || this.marker.regular()
                });

            if (typeof club.click === 'function') {
                google.maps.event.addListener(marker, 'click', club.click);
            }

            this.markers.push(marker);
            return this;
        },

        marker: {
            regular: function () {
                return '<div class="custom-marker"><span class="icon-marker-dot"></span></div>';
            },

            clubIcon: function (club) {
                return '<div class="custom-marker active"><span class="icon-marker-o"></span><h5>' + club.ClubName + '</h5></div>';
            }
        },

        find: function (lat, lng) {
            var candidate = null;
            var lookUpPosition;

            debug('[MAPS] Looking up for markers at:', lat, lng);

            if (lat && lng) {
                lookUpPosition = new google.maps.LatLng(lat, lng);

                _.each(this.markers, function (marker) {
                    if (_.isEqual(marker.getPosition(), lookUpPosition)) {
                        candidate = marker;
                        return false;
                    }
                });
            }
            return candidate;
        }
        //,

        //get: function () {
        //    return this.markers;
        //},
        //
        //set: function (markers) {
        //    this.markers = markers;
        //    return this;
        //},

        //setIcon: function (url) {
        //    for (var i = 0, marker; marker = this.markers[i]; i++) {
        //        if (typeof marker.setIcon === 'function') {
        //            marker.setIcon(url);
        //        } else if (typeof marker.setContent === 'function') {
        //            if (marker.getContent() !== url) {
        //                marker.setContent(url);
        //            }
        //        }
        //    }
        //}
    };

    var Map = function (container, extra) {
        if (typeof google === 'undefined' || typeof google.maps.LatLng === 'undefined') {
            throw new Error('Google Maps has not yet been loaded.');
        }

        var options = {
            center: new google.maps.LatLng(0, 0),
            panControl: false,
            styles: googleMapStyles,
            zoom: 9,
            minZoom: 6,
            // There's a bug on Android devices, do not remove maxZoom limit.
            maxZoom: 16,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            overviewMapControl: false,
            scrollwheel: false
        };

        options = $.extend(true, options, extra);
        this.map = new google.maps.Map(container, options);
        this.markers = new MapMarkers(this.map);
        this.init();
    };

    Map.prototype = {
        fitBounds: function (bounds) {
            return this.map.fitBounds(bounds);
        },

        fit: function (markersArr, diffZoom) {

            console.log('markersArr, diffZoom', markersArr, diffZoom);

            var bounds = new google.maps.LatLngBounds(),
                that = this;

            if (markersArr && !markersArr.length) {
                throw new Error('Invalid markers array passed to fit.');
            }

            markersArr = markersArr || this.markers.get();

            for (var i = 0, l = markersArr.length; i < l; i++) {
                bounds.extend(markersArr[i].getPosition());
            }

            this.map.fitBounds(bounds);

            if (diffZoom) {
                var zoomlistener = google.maps.event.addListener(this.map, 'bounds_changed', function () {
                    that.map.setZoom(that.map.getZoom() + diffZoom);
                    google.maps.event.removeListener(zoomlistener);
                });
            }
            return this;
        },

        point: function (obj) {
            return new google.maps.LatLng(obj.lat || obj.latitude, obj.lng || obj.longitude);
        },

        setPositionGetter: function (club) {
            if (typeof club.getPosition !== 'function') {
                club.getPosition = function () {
                    return this.point({
                        lat: this.Latitude,
                        lng: this.Longitude
                    });
                };
            }
        },

        getChildrenPoints: function (region) {
            var points = [];
            // either has facilities under subregions,
            // or just facilities but not both.
            if (region.SubRegions && region.SubRegions.length) {
                _.each(region.SubRegions, function (subregion) {
                    points = points.concat(this.getChildrenPoints(subregion));
                }, this);
            } else if (region.Facilities.length) {
                points = _.map(region.Facilities, function (club) {
                    if (club.Latitude && club.Longitude) {
                        return this.point({
                            lat: club.Latitude,
                            lng: club.Longitude
                        });
                    } else {
                        console.error('A club doesn\'t have Lat Lng properties.', club);
                    }
                }, this);
            }
            return points;
        },

        getBounds: function (latLngArr) {
            var bounds = new google.maps.LatLngBounds();
            if (!latLngArr || !latLngArr.length) {
                throw new Error('Invalid latLng array passed to Bounds().');
            }

            _.each(latLngArr, function (item) {
                bounds.extend(item);
            });
            return bounds;
        },

        init: function () {
            // Bind bounds_change for API
            google.maps.event.addListener(this.map, 'bounds_changed', _.bind(function () {
                Maps.trigger('BOUNDS_CHANGE', {
                    map: this.map
                });
            }, this));
        }
    };

    // Callback for asyncrhonously loading of the maps library
    global[CALLBACK_NAME] = function () {
        Maps.trigger('LIB_LOADED');
        for (var i = 0, l = loaderCallbacks.length; i < l; i++) {
            try {
                loaderCallbacks[i](google);
            } catch (e) {
                console.error(e.message, e);
            }
        }
        Maps.trigger('AFTER_INIT');
        isLoaded = true;
        parseQueue();
        // Reset queue
        loaderCallbacks = [];
    };

    Maps.Load = function (callback) {
        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
            callback(google);
        } else {
            loaderCallbacks.push(callback);
            loadScript();
        }
    };

    Maps.on = function (eventName, handler) {
        if (eventName && typeof handler === 'function') {
            listeners[eventName] = listeners[eventName] || [];
            listeners[eventName].push(handler);
        }
    };

    Maps.trigger = function (eventName, data) {
        if (!isLoaded && eventName !== 'LIB_LOADED' && eventName !== 'AFTER_INIT') {
            debug('[MAPS] Queued event:', eventName);
            return eventsQueue.push({
                eventName: eventName,
                data: data
            });
        }
        debug('[MAPS] Trigger event:', eventName);

        if (listeners[eventName]) {
            for (var i = 0, l = listeners[eventName].length; i < l; i++) {
                listeners[eventName][i](data);
            }
        }
    };

    Maps.Map = Map;

    // Expose globally
    EQ.Maps = Maps;
    global.EQ = EQ;

}(window));