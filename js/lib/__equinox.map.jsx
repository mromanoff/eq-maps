(function (global) {
    var MAPS_API_KEY = 'AIzaSyALmAA_5_Ff2DcTKVRilfusfS1ULr_sB9T8',
        CALLBACK_NAME = 'googleMapsLoadedCallback' + (+new Date()),
        MAPS_API_URL = 'https://maps.googleapis.com/maps/api/js?key=' + MAPS_API_KEY + '&sensor=true&libraries=geometry&callback=' + CALLBACK_NAME,

        // Map Styles generated with http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html
        googleMapStyles = [{
            "stylers": [
                { "visibility": "simplified" },
                { "saturation": -100 },
                { "invert_lightness": true },
                { "lightness": -15 }
            ]
        }, {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
                { "visibility": "on" },
                { "lightness": -50 }
            ]
        }, {
            "featureType": "poi",
            "stylers": [
                { "visibility": "off" }
            ]
        }],

        // Helper array for Loader queue
        loaderCallbacks = [],

        // Helper map for listeners
        listeners = {},

        // Boolean for events queue
        isLoaded = false,

        // Events queue list
        eventsQueue = [],

        // Load async the lib
        loadScript = function () {
            if (document.getElementById('googlemapsscript')){
                return false;
            }

            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = MAPS_API_URL;
            script.id = 'googlemapsscript';
            document.body.appendChild(script);
        },

        parseQueue = function () {
            for (var i = 0, l = eventsQueue.length; i < l; i++) {
                Maps.trigger(eventsQueue[i].eventName, eventsQueue[i].data);
            }
        },

        // EQ namespace
        EQ = global.EQ || {},

        // Library namespace
        Maps = {},

        MapMarkers = function (map) {
            this.map = map;
            this.markers = [];
        },

        MapIcon = function (url, width, height) {
            return new google.maps.MarkerImage(
                url,
                // size
                new google.maps.Size(width, height),
                // origin
                new google.maps.Point(0, 0),
                // anchor
                new google.maps.Point(width / 2, height / 2)
            );
        },

        Map = function (container, lat, lng, extra) {
            if (typeof google === 'undefined' || typeof google.maps.LatLng === 'undefined') {
                throw new Error('Google Maps has not yet been loaded.');
            }

            var options = {
                center: new google.maps.LatLng(lat || 0, lng || 0),
                panControl: false,
                styles: googleMapStyles,
                zoom: 9,
                minZoom: 9,
                // There's a bug on Android devices, do not remove maxZoom limit.
                maxZoom: 16,
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                overviewMapControl: false
            };

            options = $.extend(true, options, extra);

            debug('[MAPS] Map options: ', options);

            this.map = new google.maps.Map(container, options);
            this.container = container;
            this.markers = new MapMarkers(this.map);
            this.init();
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

    Maps.once = function (eventName, handler) {
        var handlerWrapper = function () {
            handler.apply(this, arguments);
            Maps.off(eventName, handlerWrapper);
        };
        Maps.on(eventName, handlerWrapper);
    };

    Maps.off = function (eventName, handler) {
        if (typeof handler === 'function' && listeners[eventName]) {
            $.each(listeners[eventName], function (i, fn) {
                if (fn === handler) {
                    listeners[eventName][i] = function () {};
                }
            });
        } else if (eventName && !handler) {
            listeners[eventName] = [];
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

    Maps.distance = function (pointA, pointB) {
        if (typeof google === 'undefined') {
            throw new Error('Using `EQ.Maps.distance()` helper requires to have `EQ.Maps.Load()` [google] loaded.');
        }

        if (!pointA.lat || !pointA.lng || !pointB.lat || !pointB.lng) {
            throw new Error('`EQ.Maps.distance()` called with invalid objects. Both must contain `lat` and `lng` properties.');
        }

        pointA = new google.maps.LatLng(pointA.lat, pointA.lng);
        pointB = new google.maps.LatLng(pointB.lat, pointB.lng);

        return google.maps.geometry.spherical.computeDistanceBetween(pointA, pointB);
    };

    Maps.fixLayout = function () {
        // Because google breaks when map is hidden and shown after initialization.
        // 50ms difference to prevent some IDLEing issues. (like showing a marker will increase a div height and by then the map height and by then show it off-centered).
        setTimeout(function () {
            try {
                google.maps.event.trigger(global, 'resize');
            } catch (e) {
                // Weird Google maps triggering an error here.
            }
        }, 50);
    };

    Maps.Point = function (obj) {
        return new google.maps.LatLng(obj.lat || obj.latitude, obj.lng || obj.longitude);
    };

    Maps.Bounds = function (latLngArr) {
        var bounds = new google.maps.LatLngBounds();

        if (!latLngArr || !latLngArr.length) {
            throw new Error('Invalid latLng array passed to Bounds().');
        }

        for (var i = 0, l = latLngArr.length; i < l; i++) {
            bounds.extend(latLngArr[i]);
        }
        return bounds;
    };

    MapMarkers.prototype = {
        add: function (obj, isRich) {
            if (typeof google === 'undefined') {
                obj.undone = true;
                return this.markers.push(obj);
            }

            if (isRich && typeof RichMarker === 'undefined') {
                throw new Error('RichMarker library has not yet been loaded.');
            }

            var map = this.map,
                latLng = new google.maps.LatLng(obj.lat, obj.lng),
                marker;

            if (isRich) {
                marker = new RichMarker({
                    position: latLng,
                    map: map,
                    shadow: false,
                    // animation: google.maps.Animation.DROP,
                    anchor: RichMarkerPosition.MIDDLE,
                    content: obj.content
                });
            } else {
                marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    animation: google.maps.Animation.DROP,
                    icon: obj.icon || null
                });
            }

            if (typeof obj.click === 'function') {
                google.maps.event.addListener(marker, 'click', obj.click);
            }

            this.markers.push(marker);

            return this;
        },

        find: function (lat, lng) {
            var candidate = null,
                lookUpPosition;

            debug('[MAPS] Looking up for markers at:', lat, lng);

            if (lat && lng) {
                lookUpPosition = new google.maps.LatLng(lat, lng);

                $.each(this.markers, function (i, marker) {
                    if (marker.getPosition().equals(lookUpPosition)) {
                        candidate = marker;
                        return false;
                    }
                });
            }
            return candidate;
        },

        cluster: function (before, after) {
            if (typeof MarkerClusterer === 'undefined') {
                throw new Error('MarkerClusterer library has not yet been loaded.');
            }

            before = before || '';
            after = after || '';

            if (!this._cluster) {
                this._cluster = new MarkerClusterer(this.map, this.markers, {
                    calculator: function (markers, numStyles) {
                        var index = 0,
                            count = markers.length.toString();

                        var dv = count;
                        while (dv !== 0) {
                            dv = parseInt(dv / 10, 10);
                            index++;
                        }

                        index = Math.min(index, numStyles);
                        return {
                            text: before + count + after,
                            index: index,
                            title: ''
                        };
                    }
                });
            }

            return this._cluster;
        },

        get: function () {
            return this.markers;
        },

        set: function (markers) {
            this.markers = markers;

            return this;
        },

        redraw: function () {
            var newMarkers = [],
                i, marker;

            for (i = 0; marker = this.markers[i]; i++) {
                if (marker.undone) {
                    // Prepare for later clean up
                    this.markers[i] = null;
                    // Add the marker
                    this.add(marker);
                } else if (!marker.getMap()) {
                    marker.setMap(this.map);
                }
            }

            // Remove the enqueued nulls
            for (i = 0; marker = this.markers[i]; i++) {
                if (marker !== null) {
                    newMarkers.push(marker);
                }
            }

            this.markers = newMarkers;

            return this;
        },

        setIcon: function (url) {
            for (var i = 0, marker; marker = this.markers[i]; i++) {
                if (typeof marker.setIcon === 'function') {
                    marker.setIcon(url);
                } else if (typeof marker.setContent === 'function') {
                    if (marker.getContent() !== url) {
                        marker.setContent(url);
                    }
                }
            }
        },

        empty: function () {
            for (var i = 0, marker; marker = this.markers[i]; i++) {
                marker.setMap(null);
            }

            this.markers = [];

            return this;
        }
    };

    Map.prototype = {
        fit: function (markersArr, diffZoom) {
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
                var zoomlistener = google.maps.event.addListener(this.map, 'bounds_changed', function (event) {
                    that.map.setZoom(that.map.getZoom() + diffZoom);
                    google.maps.event.removeListener(zoomlistener);
                });
            }

            return this;
        },

        fitBounds: function (bounds) {
            this.map.fitBounds(bounds);

            return this;
        },

        init: function () {
            var that = this,
                map = this.map;

            // Bind resize for responsiveness
            google.maps.event.addDomListener(global, 'resize', function () {
                var center = map.getCenter();
                google.maps.event.trigger(map, 'resize');
                map.setCenter(center);
            });

            // Bind zoom for API
            google.maps.event.addListener(map, 'zoom_changed', EQ.Helpers.throttle(function () {
                EQ.Maps.trigger('ZOOM_CHANGE', {
                    map: map,
                    zoom: map.getZoom()
                });
            }, 300));

            // Bind bounds_change for API
            google.maps.event.addListener(map, 'bounds_changed', function () {
                EQ.Maps.trigger('BOUNDS_CHANGE', {
                    map: map
                });
            });

            // Prevent minZoom to crash Safari mobile, #DPLAT-407
            if (EQ.Helpers.getDevicePlatform() === 'ios') {
                var minZoomLevel = map.get('minZoom');
                map.set('minZoom', 1);
                google.maps.event.addListener(map, 'zoom_changed', function () {
                    if (map.getZoom() < minZoomLevel) {
                        map.setZoom(minZoomLevel);
                    }
                });
            }

            // Bind idling for API
            google.maps.event.addListenerOnce(map, 'idle', function () {
                // do something only the first time the map is loaded
                EQ.Maps.trigger('IDLE_LOAD', {
                    map: map
                });
            });
            google.maps.event.addListener(map, 'idle', function () {
                // do something only the first time the map is loaded
                EQ.Maps.trigger('IDLE', {
                    map: map
                });
            });

            // #DPLAT-567
            $(global).on('orientationchange', EQ.Helpers.throttle(function () {
                var center = map.getCenter();
                google.maps.event.trigger(map, 'resize');
                map.setCenter(center);
            }));

            // Bind click for API
            // Using jQuery instead of Google binding because #DPLAT-410
            $(this.container).on('click', function (evt) {
                EQ.Maps.trigger('MAP_CLICK', { map: map });
            });

            $(this.container).on('click', '.map-interaction-lock a .map-lock', function (evt) {
                evt.preventDefault();
                $(this).toggleClass('icon-unlocked icon-locked');
                that.toggleFreeze();
            });
        },

        center: function (point) {
            if (typeof point.getPosition !== 'function') {
                throw new Error('Cannot center an object without .getPosition()');
            }

            this.map.panTo(point.getPosition());

            return this;
        },
        mobilePanning: function () {
            this.freeze();

            var $control = $('<div class="map-interaction-lock"><a href="#"><span class="icon-locked map-lock"></span></a><a href="#"><span class="icon-refresh"></span></a></div>');

            this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push($control[0]);
        },
        toggleFreeze: function () {
            if (this.isFrozen) {
                this.unfreeze();
            } else {
                this.freeze();
            }
        },
        freeze: function () {
            debug('[MAPS] freeze');
            this.isFrozen = true;
            this.map.setOptions({draggable: false, zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true});
        },
        unfreeze: function () {
            debug('[MAPS] unfreeze');
            this.isFrozen = false;
            this.map.setOptions({draggable: true, scrollwheel: true, disableDoubleClickZoom: false});
        }
    };

    Maps.Icon = MapIcon;
    Maps.Map = Map;

    // Expose globally
    EQ.Maps = Maps;
    global.EQ = EQ;

} (window));