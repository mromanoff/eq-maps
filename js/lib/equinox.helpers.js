(function (global) {
    var DEVICE_MAXIMUM_WIDTH_SMALL = 768,
        DEVICE_MAXIMUM_WIDTH_MEDIUM = 1024,
		CB_QUEUE = [],
		LOADED_FAVS = false,

        // EQ namespace
        EQ = global.EQ || {},

        // Library namespace
        Helpers = {};

    // getService "in-page cache"
    var data_cache = [];

    /**
     * Check if the webpage is being run in homepage-enabled mode in iOS
     *
     * @return boolean
     */
    Helpers.isHomepageEnabled = function () {
        if ('standalone' in navigator && !navigator.standalone && (/iphone|ipod|ipad/gi).test(navigator.platform) && (/Safari/i).test(navigator.appVersion)) {
            return true;
        } else {
            return false;
        }
    };
    /**
    * Helper to create Coookie in client
    *
    * @param string name, name of cookie
    * @param string value,  Value of cookie,
	* @param integer days, number of days for cookie to be set, if undefined session
    * 
    */
    Helpers.createCookie = function (name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }
        else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/;domain=.equinox.com;";
    };
    /**
    * Helper to get a Coookie from a client
    *
    * @param string name, name of cookie
    *
	*/
    Helpers.readCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    /**
     * Get approximate device size depending on screen resolution.
     *
     * @return string small|medium|large
     */
    Helpers.getDeviceSize = function () {
        var w = (document.documentElement || document.body).clientWidth,
            deviceSize;

        if (w < DEVICE_MAXIMUM_WIDTH_SMALL) {
            deviceSize = 'small';
        } else if (w >= DEVICE_MAXIMUM_WIDTH_SMALL && w < DEVICE_MAXIMUM_WIDTH_MEDIUM) {
            deviceSize = 'medium';
        } else {
            deviceSize = 'large';
        }

        return deviceSize;
    };

    /**
     * Check if the browser is IE (if it is, it returns the version)
     *
     * @return string || boolean  7,8,9,10,false
     */
    Helpers.isIe = function () {
        var rv = false; // Return value assumes failure.
        if (navigator.appName === 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null) {
                rv = parseFloat(RegExp.$1);
            }
        }
        return rv;
    };

    Helpers.getBrowser = function () {
        var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/)
            if (tem != null) { return 'Opera ' + tem[1]; }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
        return M[0];
    };

    Helpers.getBrowserVersion = function () {
        var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/)
            if (tem != null) { return 'Opera ' + tem[1]; }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
        return M[1];
    };

    /**
    * Helper to create throttle functions
    *
    * @param function handler Method to proxy by
    * @param integer time Time to throttle by. Default: 500 (optional)
    * @return function
    */
    Helpers.throttle = function (handler, time) {
        var throttle;
        time = time || 500;
        return function () {
            var args = arguments,
                context = this;
            clearTimeout(throttle);
            throttle = setTimeout(function () {
                handler.apply(context, args);
            }, time);
        };
    };

    /**
     * Get all facilities for specified region.
     * @param  {RegionObject} region
     * @return {Array}        Facilities including SubRegions facilities.
     */
    Helpers.getAllFacilities = function (region) {
        var facilities = [];

        if (region) {

            if (region.AllFacilities) {
                facilities = region.AllFacilities;
            }
            else {
                if (region.SubRegions && region.SubRegions.length) {
                    $.each(region.SubRegions, function (j, subregion) {
                        facilities = facilities.concat(subregion.Facilities);
                    });
                } else if (region.Facilities && region.Facilities.length) {
                    facilities = facilities.concat(region.Facilities);
                }
            }
            facilities = _.sortBy(facilities, 'ClubName');

        } else {

            // regions with no subregions have a Facilities key inmediately under
            $.each(allRegionsData, function (i, region) {
                facilities.push(region.Facilities);

                //addRegionsByFacility(region);

                // while some other regions like NY have Facilities under Subregions key
                if (region.SubRegions && region.SubRegions.length > 0) {
                    $.each(region.SubRegions, function (i, subregion) {
                        facilities.push(subregion.Facilities);

                        subregion.ShortName = region.ShortName;
                        subregion.Name = region.Name;

                        //addRegionsByFacility(subregion);
                    });
                }
            });

            facilities = _.flatten(facilities, true);

        }

        return facilities;
    };


    /**
     * getFacilityIdFromClubId
     *
     * In some places in the code like the nearme widget, we still use the old
     * clubId but we should be using facilityId from now on. We use this method
     * to convert the clubId to facilityId
     *
     * @param clubId
     * @returns {*}
     */
    Helpers.getFacilityIdFromClubId = function (clubId) {
        var facilitiesArray = this.getAllFacilities();
        var facilitiesByClubId = {};

        $.each(facilitiesArray, function (i, facility) {
            facilitiesByClubId[facility.ClubID] = facility.Id;
        });

        return facilitiesByClubId[clubId];
    };


    Helpers.getClubIdFromFacilityId = function (facilityId) {
        var facilitiesArray = this.getAllFacilities();
        var facilitiesByFacilityId = {};

        $.each(facilitiesArray, function (i, facility) {
            facilitiesByFacilityId[facility.Id] = facility.ClubID;
        });
        return facilitiesByFacilityId[facilityId];
    };

    Helpers.getFacilityLatLng = function (facilityId) {
        var facilitiesArray = this.getAllFacilities();
        var facilitiesLatLng = {};

        $.each(facilitiesArray, function (i, facility) {
            facilitiesLatLng[facility.Id] = {
                lat: facility.Latitude,
                lng: facility.Longitude
            };
        });

        return facilitiesLatLng[facilityId];
    };

    Helpers.getFacilityById = function (facilityId) {
        var facilitiesArray = this.getAllFacilities(),
            facilityFound = null;

        $.each(facilitiesArray, function (i, facility) {
            if (parseInt(facility.Id) === parseInt(facilityId)) {
                facilityFound = facility;
            }
        });
        return facilityFound;
    };

    /**
     * Currently we only get the clubId from the backend so we determine the region
     * for this user's default clubId using this method until backend starts sending
     * us that info. It would be preferrable to get it from the backend as this
     * method is too heavy just to get that region name.
     *
     * @param  {RegionObject} region
     * @return {Array} Facilities including SubRegions facilities.
     */
    Helpers.getUserDefaultRegion = function (clubId) {
        var region, facilitiesByRegion = [], regionByFacility = {};

        /**
         * we store the region name/value by facility id since the server
         * does not provide us this detail
         * */
        function addRegionsByFacility(region) {
            $.each(region.Facilities, function (i, facility) {
                regionByFacility[facility.Id] = {
                    value: region.ShortName,
                    name: region.Name
                }
            });

            return regionByFacility;
        }

        // regions with no subregions have a Facilities key inmediately under
        $.each(allRegionsData, function (i, region) {
            facilitiesByRegion.push(region.Facilities);

            addRegionsByFacility(region);

            // while some other regions like NY have Facilities under Subregions key
            if (region.SubRegions && region.SubRegions.length > 0) {
                $.each(region.SubRegions, function (i, subregion) {
                    facilitiesByRegion.push(subregion.Facilities);

                    subregion.ShortName = region.ShortName;
                    subregion.Name = region.Name;

                    addRegionsByFacility(subregion);
                });
            }
        });

        facilities = _.flatten(facilitiesByRegion, true);

        region = _.find(facilities, { Id: userProfileJson.FacilityId });

        if (region !== undefined) {
            return regionByFacility[region.Id];
        } else {
            return {
                name: '',
                value: ''
            };
        }

    };

    Helpers.normalizeRegionsData = function () {
        var regions = []; // store in arr instead of obj to manipulate order

        $.each(allRegionsData, function (key, value) {
            regions.push({
                value: value.ShortName,
                text: value.Title,
                selected: false
            });
        });

        return regions;
    };

    /**
     * getRegions
     *
     * @return all the regions available
     */
    Helpers.getRegions = function () {
        var regions = {};

        $.each(allRegionsData, function (i, region) {
            if (EQ.Helpers.getAllFacilities(region).length) {
                regions[region.ShortName] = region;
            }
        });

        return regions;
    };

    /**
     * Bind `.getPosition()` into club object.
     * @param {Object} club Contains Latitude and Longitude properties
     */
    Helpers.setPositionGetter = function (club) {
        if (typeof club.getPosition !== 'function') {
            club.getPosition = function () {
                return EQ.Maps.Point({
                    lat: this.Latitude,
                    lng: this.Longitude
                });
            };
        }
    };

    /**
     * // Fix for `.Region` property on Facilities not matching parent Region Title.
     * @param  {Object} newData Optional data array, defaults to <allRegionsData> global variable.
     */
    Helpers.fixRegionProperty = function (newData) {
        /* global allRegionsData */
        var data = newData || allRegionsData;

        if (!data) {
            throw new Error('Either newData or allRegionsData need to be passed/set for fixRegionProperty()');
        }

        $.each(data, function (i, region) {
            if (region.SubRegions) {
                $.each(region.SubRegions, function (j, subregion) {
                    $.each(subregion.Facilities, function (k, facility) {
                        facility.Region = region.Title;
                    });
                });
            }

            if (region.Facilities) {
                $.each(region.Facilities, function (j, facility) {
                    facility.Region = region.Title;
                });
            }
        });
    };

    /**
     * Get closest facility to given location.
     * @param  {Array} availableLocations  Contains elements with `Latitude` and `Longitude` properties.
     * @param  {Object} currentLocation    Contains `Latitude` and `Longitude` properties.
     * @return {Object} candidate          Closest element within the array.
     */
    Helpers.getClosestWithin = function (availableLocations, currentLocation) {
        var candidate = null,
            maxDistance;

        $.each(availableLocations, function (i, location) {
            var distance = EQ.Maps.distance({
                lat: location.Latitude,
                lng: location.Longitude
            }, {
                lat: currentLocation.Latitude,
                lng: currentLocation.Longitude
            });

            if (typeof maxDistance === 'undefined' || maxDistance > distance) {
                maxDistance = distance;
                candidate = location;
            }
        });

        if (candidate && candidate.ClubName) {
            debug('[HELPERS] Closest club:', candidate.ClubName, '- distance:', maxDistance.toFixed(2), 'meters.');
        }

        return candidate;
    };

    /**
     * Get device OS name.
     * @return {string} Either `android`, `ios` or `unknown`.
     */
    Helpers.getDevicePlatform = function () {
        var agent = navigator.userAgent,
            candidate;

        if (agent.match(/android/i)) {
            candidate = 'android';
        } else if (agent.match(/ipad|ipod|iphone/i)) {
            candidate = 'ios';
        } else {
            candidate = 'unknown';
        }
        debug('[HELPERS] Device is:', candidate);
        return candidate;
    };

    /**
     * Get an URL for triggering the device native maps application if possible
     * @param  {Object} club Club containing `Latitude` and `Longitude`
     * @return {string|undefined} URL.
     */
    Helpers.getDeviceMapURL = function (club) {
        var href = {
            // android: 'geo:0,0?q={latitude},{longitude}',
            // Without sensor:false it will show the user's location.
            //android: 'http://maps.google.com/?sensor=false&q={latitude},{longitude}',
            //ios: 'http://maps.apple.com/?q={latitude},{longitude}'
            android: 'http://maps.google.com/?client=gme-equinoxfitness&v=3.16&sensor=false&q={googleAddress}',
            ios: 'http://maps.apple.com/?q={googleAddress}'
        };

        if (href[Helpers.getDevicePlatform()]) {
            //href = href[Helpers.getDevicePlatform()]
            //            .replace('{latitude}', club.Latitude)
            //            .replace('{longitude}', club.Longitude);
            href = href[Helpers.getDevicePlatform()]
                        .replace('{googleAddress}', club.GoogleAddress);
        } else {
            // Return default google link for unkown devices
            href = href['android'].replace('{googleAddress}', club.GoogleAddress);
        }
        return href;
    };

    /**
     * Namespace inside helpers to group all the utilities related to dates and time.
     * @namespace
     */
    //Uses moment.js for date manipulations.
    Helpers.dateTime = {
        /**
         * Return the current week range from monday to sunday
         * @param  {Date} date to check the week. Optional, if it is not defined,
         *  the current day is used.
         * @return {object} object containing 'startDate' and 'endDate'(YYYY-MM-DD).
         */
        getCurrentWeek: function (date) {
            var today = moment(date),
                monday,
                sunday;

            monday = moment(today).startOf('isoWeek'),
            sunday = moment(monday).add('days', 7);

            return ({
                startDate: monday.format('YYYY-MM-DD'),
                endDate: sunday.format('YYYY-MM-DD')
            });
        },
        /**
         * Return the current day range from today to tomorrow
         * @param  {Date} date to check the day. Optional, if it is not defined,
         *  the current day is used.
         * @return {object} object containing 'startDate' and 'endDate'(YYYY-MM-DD).
         */
        getCurrentDay: function (date) {
            var today = moment(date),
                tomorrow = moment(today).add('days', 1);

            return ({
                startDate: today.format('YYYY-MM-DD'),
                endDate: tomorrow.format('YYYY-MM-DD')
            });
        },

        /**
         * Return the time range between two dates.
         * @param  {String} startTime date in format 2014-02-10T19:58:00Z
         * @param  {String} endTime Optional date in format 2014-02-10T19:58:00Z
         * @param  {String} twentyfour Optional 24 hour time
         * @return {String} String containing the time range in format "7:20 - 8:00 PM"
         */
        getTimeRange: function (startTime, endTime, twentyfour) {
            var start = moment(startTime),
                end = moment(endTime),
                format = '';

            if (twentyfour) {
                if (endTime) {
                    return start.format('H:mm') + '-' + end.format('H:mm');
                } else {
                    return start.format('H:mm');
                }
            } else {
                if (endTime) {
                    return start.format('h:mm') + '-' + end.format('h:mma');
                } else {
                    return start.format('h:mm a');
                }
            }

        },

        /**
         * Return the date in string format
         * @param  {String} Time in format 2014-02-21T10:45:00Z
         * @param  {Boolean} Return the full month instead of shortened one
         * @return {String} Date in format tuesday, jan 14
         */
        convertDateToString: function (rawDate, fullMonth) {
            var date = moment(rawDate);
            monthString = fullMonth ? 'MMMM' : 'MMM',
            dateString = EQ.Helpers.user.getUserCountry() === 'US' ? 'dddd, ' + monthString + ' D' : 'dddd, D ' + monthString;

            return date.format(dateString);
        },

        /**
         * Return the time formatted for correct visualization
         * @param  {String} displayTimeString Time in format '06:00 AM - 07:00 AM PDT' (displayTime comes from api services)
         * @return {String} Date in format 6:00-7:00AM PDT
         */
        formatDisplayTime: function (displayTimeString) {
            var displayTime = displayTimeString.substr(0, 19),
                regionInfo = displayTimeString.substr(19),
                AMcount,
                PMcount;

            // Strip all blank spaces
            displayTime = displayTime.replace(/ /g, '');

            // replace 0 at left of hour values
            displayTime = displayTime.replace(/0([1-9]):/g, '$1:');

            // See if there are two PM or two AM dates
            AMcount = (displayTime.split('AM').length - 1);
            // If there are two, remove the first
            if (AMcount === 2) {
                displayTime = displayTime.replace('AM', '');
            }

            PMcount = (displayTime.split('PM').length - 1);
            // If there are two, remove the first
            if (PMcount === 2) {
                displayTime = displayTime.replace('PM', '');
            }
            return displayTime + regionInfo;
        }
    };

    /**
     * Get Region object by `.Region` property on Clubs objects.
     * @param  {string} regionTitle
     * @return {Object|null} region if found a match.
     */
    Helpers.getRegionByTitle = function (regionTitle) {
        var candidate = null;
        regionTitle = regionTitle.replace(/-/g, ' ');

        $.each(allRegionsData, function (shortName, obj) {
            if (obj.Title.replace(/-/g, ' ').toLowerCase() === regionTitle.toLowerCase()) {
                candidate = obj;
            }
        });
        return candidate;
    };
    /**
     * tries to fast app switch to the ios App
     */
    Helpers.tryFastAppSwitch = function () {
        var applink = function (fail) {
            function redirect() {
                var enteredAt = +new Date();
                // During tests on 3g/3gs this timeout fires immediately if less than 500ms.
                setTimeout(function () {
                    // To avoid failing on return to MobileSafari, ensure freshness!
                    if (+new Date() - enteredAt < 2000) {
                        window.location = fail;
                    }
                }, 500);
            }
            return redirect();
        },
		checkDevice = function () {
		    var userAgent = navigator.userAgent;
		    // can also do navigator.platform
		    var eqURL = 'equinox://';
		    // check if user is on an iphone
		    if (userAgent.search('iPhone') !== -1 || userAgent.search('iPad') !== -1) {
		        applink(eqURL);
		    } else {
		        debug('not an iphone yet has the cookie');
		    }
		};

        checkDevice();
    };

    Helpers.user = {
        favoritesCache: JSON.parse(localStorage.getItem('favorites')) || {
            data: undefined,
            lastChecked: undefined
        },
        invalidateFavoritesCache: function () {
            // Clear Queue, just in case.
            CB_QUEUE = [];
            // Remove from localStorage
            localStorage.removeItem('favorites');
            // Remove local copy
            this.favoritesCache = {
                data: undefined,
                lastChecked: undefined
            };
            // Set flag to false
            LOADED_FAVS = false;
        },
        getFavorites: function (callback, errcallback) {
            var endpoint = APIEndpoint + '/me/favorites',
                that = this;
            if (user === undefined || user === null) {
                // Dont do anything for logged out users
                return false
            } else if (this.favoritesCache.data !== undefined && moment(this.favoritesCache.lastChecked).add(2, 'hours').isAfter(moment())) {
                callback && callback(this.favoritesCache.data);
            } else {
                CB_QUEUE.push({
                    'success': callback,
                    'error': errcallback
                });

                if (!LOADED_FAVS) {
                    LOADED_FAVS = true;
                    $.ajax({
                        type: 'GET',
                        url: endpoint,
                        contentType: 'application/json',
                        xhrFields: { 'withCredentials': true },
                        dataType: 'json',
                        success: function (data) {
                            var favoritesData = data,
		                        finalFavoritesData = {
		                            categories: '',
		                            instructors: '',
		                            classes: '',
		                            clubs: '',
		                            homeClub: ''
		                        };
                            finalFavoritesData.categories = Helpers.mapObject(favoritesData.categories,
		                        { 'id': 'categoryId', 'name': 'categoryName' }, 'categories');

                            finalFavoritesData.classes = Helpers.mapObject(favoritesData.classes,
		                        { 'id': 'classId', 'name': 'name' }, 'classes');
                            finalFavoritesData.clubs = Helpers.mapObject(favoritesData.clubs,
		                        { 'id': 'facilityId', 'name': 'name' }, 'clubs');

                            finalFavoritesData.bikes = Helpers.mapObject(favoritesData.bikes, {
                                id: "facilityId",
                                name: "bikeNumber",
                                name2: "facilityName"
                            }, "bikes");

                            // Sorting the favorites
                            _.each(finalFavoritesData, function (arr, cat, obj) {
                                obj[cat] = _.sortBy(arr, function (o) { return o.displayText; });
                            });

                            favoritesData.instructors = _.sortBy(favoritesData.instructors, 'lastName');
                            finalFavoritesData.instructors = Helpers.mapObject(favoritesData.instructors,
		                        { 'id': 'id', 'name': 'firstName', 'name2': 'lastName' }, 'instructors');

                            debug('favs', finalFavoritesData);

                            // Assign to cache variable
                            that.favoritesCache.data = finalFavoritesData;
                            that.favoritesCache.lastChecked = moment().format();

                            // Save in localStorage
                            localStorage.setItem('favorites', JSON.stringify(that.favoritesCache));
                            Helpers.executeFavoriteCallbackQueue(finalFavoritesData);
                        },
                        error: function (d) {
                            Helpers.executeFavoriteCallbackQueue(d.responseJSON, true);
                            debug('server error', d.responseJSON);
                        }
                    });
                }
            }
        },
        getUserCountry: function () {
            switch (user.SourceSystem) {
                case 1:
                    return 'US';
                    break;
                case 5:
                    return 'UK';
                    break;
                case 6:
                    return 'CA';
                    break;
            }
        }
    };

    Helpers.executeFavoriteCallbackQueue = function (favoriteData, error) {
        if (error && CB_QUEUE.length !== 0) {
            //execute errorcallback queues
            for (var i = 0, len = CB_QUEUE.length; i < len; i++) {
                if (CB_QUEUE[i]['error']) {
                    CB_QUEUE[i]['error'](favoriteData);
                }
            }
        } else if (CB_QUEUE.length !== 0) {
            // call sucess
            for (var i = 0, len = CB_QUEUE.length; i < len; i++) {
                if (CB_QUEUE[i]['success']) {
                    CB_QUEUE[i]['success'](favoriteData);
                }
            }
        }
        // Empty queue
        CB_QUEUE = [];
    };

    Helpers.mapObject = function (dataArray, dataMap, type) {
        var newarray = [];
        $.each(dataArray, function (index, item) {
            var firstString = item[dataMap.name], secondString = "";
            if (type === "bikes") {
                firstString = "Bike " + firstString;
            }
            if (dataMap.name2) {
                secondString = " " + item[dataMap.name2];
            }
            newarray.push({
                id: parseInt(item[dataMap.id], 10),
                displayText: firstString + secondString,
                type: type
            });
        });
        return newarray;
    };

    Helpers.loaderAndErrorHandler = function ($el, options) {

        var LoaderError,
            loaderDiv,
            errorDiv,
            loaderOverlay,
            errorOverlayDiv;

        loaderDiv = '<div class="loader hidden">' +
            '<div class="loader-circles bounce1"></div>' +
            '<div class="loader-circles bounce2"></div>' +
            '<div class="loader-circles bounce3"></div>' +
        '</div>';

        loaderOverlay = '<div class="loader-overlay hidden">' +
            '<div class="loader-overlay-container">' +
            '<div class="loader-circles bounce1"></div>' +
            '<div class="loader-circles bounce2"></div>' +
            '<div class="loader-circles bounce3"></div>' +
            '</div>' +
        '</div>';

        errorDiv = '<div class="error-box error-message-component hidden">' +
            '<p class="error-title"></p>' +
            '<p class="error-description"></p>' +
        '</div>';

        errorOverlayDiv = '<div class="error-box error-overlay hidden">' +
            '<div class="error-overlay-container">' +
            '<p class="error-title"></p>' +
            '<p class="error-description"></p>' +
            '</div>' +
        '</div>';


        LoaderError = function () {
            var $errorBox,
                $loaderBox;

            this.$el = $el;
            this.options = options || {};
            // Options defaults
            this.options.type = this.options.type || 'div';
            this.options.color = this.options.color || '';
            this.options.errorTitle = this.options.errorTitle || 'Loading Error';
            this.options.errorDescription = this.options.errorDescription || 'Check your internet connection and try refreshing the page';

            // TODO REFACTOR CODE TO USE TWO METHODS: buildErrorBox(), buildLoaderBox()
            // Init
            if (this.options.type === 'button') {
                var originalDom = this.$el.html();

                originalDom = '<span>' + originalDom + '</span>';
                this.$el.html(loaderDiv).append(originalDom);
                this.$originalDom = this.$el.find('span');
            } else {
                $loaderBox = $(this.options.type === 'overlay' ? loaderOverlay : loaderDiv);
                this.$el.append($loaderBox);

                if (this.options.type === 'popup') {
                    $loaderBox.addClass('popup');
                }
            }

            // Set loader and error divs
            this.$loader = this.$el.find('.loader, .loader-overlay');
            this.$loader.addClass(this.options.color);

            $errorBox = $(this.options.type === 'overlay' ? errorOverlayDiv : errorDiv);
            this.$el.append($errorBox);

            if (this.options.type === 'popup') {
                $errorBox.addClass('popup');
            }

            this.$error = $errorBox;
            this.$error.addClass(this.options.color);
            // Set error title
            this.$error.find('.error-title').text(this.options.errorTitle);

            // Error description is not necessary for button type loaders
            if (this.options.type !== 'button') {
                this.$error.find('.error-description').text(this.options.errorDescription);
            } else {
                this.$error.find('.error-description').remove();
            }
        };

        LoaderError.prototype = {
            showLoader: function () {
                debug('show loader COMPONENT');
                this.$loader.removeClass('hidden');

                if (this.options.type === 'button') {
                    this.$originalDom.css({ 'visibility': 'hidden' });
                    this.$error.addClass('hidden');
                }
            },
            hideLoader: function () {
                debug('hide loader COMPONENT');
                this.$loader.addClass('hidden');

                if (this.options.type === 'button') {
                    this.$originalDom.css({ 'visibility': 'visible' });
                }
            },
            showError: function () {
                debug('show error COMPONENT');
                this.hideLoader();

                if (this.options.type === 'button') {
                    this.$originalDom.css({ 'visibility': 'hidden' });
                }

                this.$error.removeClass('hidden');
            },
            hideError: function () {
                debug('hide error COMPONENT');
                this.$error.addClass('hidden');
            }
        };

        return new LoaderError($el, options);
    };

    Helpers.PopupMessageHandler = function ($el, options) {

        var popupDiv;

        popupDiv = '<div class="overlay-box">' +
            '<h2></h2>' +
            '<p></p>' +
            '<a href="/profile" class="button box small"></a>' +
            '<a href="#" class="icon-close"></a></div>';

        PopupMessage = function () {
            this.$el = $el;
            this.options = options || {};

            // Options defaults
            this.options.closeButton = this.options.closeButton || '';
            this.options.title = this.options.title || '';
            this.options.description = this.options.description || '';
            this.options.buttonColor = this.options.buttonColor || '';
            this.options.buttonText = this.options.buttonText || '';

            // Append element to the DOM            
            this.$el.append(popupDiv);

            // Set default or set options
            this.$popup = this.$el.find('.overlay-box');
            this.$popup.find('h2').text(this.options.title);
            this.$popup.find('p').text(this.options.description);
            this.$popup.find('.button').addClass(this.options.buttonColor);
            this.$popup.find('.button').text(this.options.buttonText);

            if (this.options.closeButton === true) {
                this.$popup.find('.icon-close').show();
            }

            this.$popup.find('.icon-close').on('click', function (e) {
                e.preventDefault();
                $(this).closest('.overlay-box').removeClass('active');
            });
        };

        PopupMessage.prototype = {
            showPopup: function () {
                debug('show popup');
                var that = this;

                this.$popup.addClass('active');

                if (this.options.closeButton !== true) {
                    setTimeout(function () {
                        that.$popup.removeClass('active');
                    }, 5000);
                }
            }
        }

        return new PopupMessage($el, options);
    };

    /**
    * Get a queryString variable
    **/
    Helpers.getQueryStringVariable = function (name) {
        var query = History.getState().url.split('?')[1],
            vars = query ? query.split('&') : [],
            result;
        if (vars.length !== 0) {
            vars.forEach(function (v) {
                var pair = v.split('=');
                if (pair[1]) {
                    if (decodeURIComponent(pair[0]) === name) {
                        result = decodeURIComponent(pair[1]);
                    }
                } else if (decodeURIComponent(pair[0]) === name) {
                    result = pair[0];
                }
            });

            return result || false;
        } else {
            return false
        }
    };

    /**
    * Set a queryString variable
    * If the variable already exits it appends the value as a comma separated lists.
    * Accepts arrays (1-dimension) or string values
    **/
    Helpers.setQueryStringVariable = function (name, value, duplicate, replace) {
        var query = History.getState().url.split('?')[1],
            vars = query ? query.split('&') : [],
            result;


        if (vars.length !== 0) {
            // Query exists
            vars.forEach(function (v) {
                var pair = v.split('=');
                if (decodeURIComponent(pair[0]) === name) {
                    // Query exists & has data
                    if (pair[1] && (replace === null || replace === undefined || replace === false)) {
                        if (value instanceof Array) {
                            value.forEach(function (val) {
                                if (pair[1].indexOf(val) === -1) {
                                    pair[1] += ',' + val;
                                } else if (duplicate === true) {
                                    pair[1] += ',' + val;
                                }
                            });
                        } else {
                            if (pair[1].indexOf(value) === -1) {
                                pair[1] += ',' + value;
                            } else if (duplicate === true) {
                                pair[1] += ',' + value;
                            }
                        }
                    } else { // Query exists, no value
                        pair[1] = value;
                    }

                    result = pair.join('=');
                    query = query.replace(new RegExp(v, 'g'), result.trim());

                } else if (query.indexOf(name) === -1) {
                    if (value instanceof Array) {
                        query += '&' + name + '=' + value.join(',')
                    } else {
                        query += '&' + name + '=' + value;
                    }
                }
            });

            query = '?' + query;

        } else {

            if (query === undefined) {
                query = '?';
            } else {
                query += '&';
            }

            if (value instanceof Array) {
                query += name + '=' + value.join(',')
            } else {
                query += name + '=' + value;
            }
        }

        History.replaceState(null, null, location.pathname + query);
    };

    Helpers.removeQueryStringVariable = function (name, value) {
        var query = History.getState().url.split('?')[1],
            vars = query ? query.split('&') : [],
            result;


        if (vars.length !== 0) {
            // Query exists
            vars.forEach(function (v) {
                var pair = v.split('=');
                if (decodeURIComponent(pair[0]) === name) {
                    // Query exists & has data
                    if (pair[1]) {
                        if (value instanceof Array) {
                            var currValues = pair[1].split(',');

                            value.forEach(function (val) {
                                // Corce numbers to strings
                                if (typeof val === "number") {
                                    val = "" + val;
                                }
                                if (pair[1].indexOf(val) !== -1 && currValues.indexOf(val) !== -1) {
                                    currValues.splice(currValues.indexOf(val), 1);
                                }
                            });

                            pair[1] = currValues;
                        } else {
                            // Corce numbers to strings
                            if (typeof value === "number") {
                                value = "" + value;
                            }

                            var currValues = pair[1].split(',');
                            if (pair[1].indexOf(value) !== -1 && currValues.indexOf(value) !== -1) {
                                currValues.splice(currValues.indexOf(value), 1);
                            }

                            pair[1] = currValues;
                        }

                        // Are there any values left? If not, remove variable all together.
                        if (pair[1].length === 0) {
                            pair[1] = '';
                            pair[0] = '';
                        }

                    } else { // Query exists, no value
                        pair[1] = '';
                        pair[0] = '';
                    }

                    if (pair[0] !== '') {
                        result = pair.join('=');
                    } else {
                        result = '';
                    }

                    if (query.indexOf('&' + v) !== -1 && pair[1] === '') { // &queryvariabke
                        query = query.replace(new RegExp('&' + v, 'g'), result.trim());

                    } else {
                        query = query.replace(new RegExp(v, 'g'), result.trim());
                    }

                }
            });

            query = '?' + query;
        }

        if (query === '?') {
            query = '';
        }

        History.replaceState(null, null, location.pathname + query);
    };

    /**
    * Refresh User Cache data
    * This call will always be "async = true" as Firefox does not support synchronous calls in window context
    * callbackFuncRef parameter is used to hold the function reference to be called after the ajax request is over
    **/
    Helpers.refreshUserCacheData = function (callbackFuncRef) {
        $.ajax({
            type: 'GET',
            url: '/me/refresh',
            async: true,
            contentType: 'application/json',
            xhrFields: { 'withCredentials': true },
            dataType: 'json',
            success: function (data) {
                debug('[Refresh cache OK]', data);
                window.userProfileJson = data;
                // call the callback function after successful call
                if (typeof (callbackFuncRef) === 'function') {
                    callbackFuncRef();
                }
            },
            error: function (a, b, c) {
                debug('error', a.responseJSON);
                // call the callback function even after call is not successful
                if (typeof (callbackFuncRef) === 'function') {
                    callbackFuncRef();
                }
            }
        });
    };


    Helpers.str = {
        /**
         * toCamelCase
         *
         * Convert any string into a camelCase string with no spacing. Useful for converting HTML markup (dash-based) data attributes into JavaScript camelCase friendly strings and object keys. For instance, convert "cards carousel" to "cardsCarousel."
         *
         * @param str
         * @returns {XML|string|void|*}
         */
        toCamelCase: function (str) {
            return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        },

        /**
         * toDashCase
         *
         * Convert spaces in strings to dash based.
         *
         * @todo: enhance to convert camelCase to lower-dash-case
         * @param str
         * @returns {string}
         */
        toDashCase: function (str) {
            return str.replace(' ', '-', 'gi').toLowerCase();
        }
    };

    Helpers.numbers = {
        roundToTwoDecimals: function (value) {
            return Math.round(value * 100) / 100;
        },
        trimDecimals: function (value, decimals) {
            return parseFloat(value.toFixed((typeof decimals === 'undefined') ? 2 : 0));
        },
        trimWithFlooring: function (value, decimals) {
            var power = Math.pow(10.0, decimals || 1);
            return Math.floor(value * power) / power;
        },
        getOneDecimal :function(value) {
            return Number.parseFloat(value).toFixed(1);
        }
    };

    Helpers.ordinate = function (num) {
        var ord = '';
        if (!num) {
            num = '0';
            ord = 'th';
        } else if (num > 3 && num < 21) {
            ord = 'th';
        } else if (/1$/.test(num)) {
            ord = 'st';
        } else if (/2$/.test(num)) {
            ord = 'nd';
        } else if (/3$/.test(num)) {
            ord = 'rd';
        } else {
            ord = 'th';
        }
        return { num: num.toString(), ord: ord, full: (num + ord) };
    };

    Helpers.unitMap = {
        'Distance' : 'Km',
        'DistanceMetric' : 'Km',
        'DistanceImperial' : 'MI',
        'Power' :  '',
        'Energy' : 'kJ',
        'Calories' : ''
    };

    Helpers.unitLongMap = {
        'Distance' : 'kilometers',
        'DistanceMetric' : 'kilometers',
        'DistanceImperial' : 'miles',
        'Power' :  '',
        'Energy' : 'kilojoules',
        'Calories' : ''
    };

    Helpers.shortUnit = function ( unit ) {
        return (Helpers.unitMap[unit] || '');
    };

    Helpers.longUnit = function ( unit ) {
        return (Helpers.unitLongMap[unit] || '');
    };

    Helpers.goToTop = function (time) {
        if (!time) {
            $('html, body').scrollTop(0);
        } else {
            $('html, body').animate({ scrollTop: 0 }, time);
        }
    };

    Helpers.image = function (url) {
        var img = url;
        $.ajax({
            url: url,
            async: false,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        })
        .error(function (d) {
            img = '../../../images/noimage.jpg';
        });
        return img;
    };

    Helpers.buildGetParams = function ( params ) {
        var result = '';
        if (typeof params !== 'undefined' || !$.isEmptyObject(params)) {
            result = '?';
            $.each(params, function (key, val) {
                result += (key + '=' + val + '&');
            });
            result = result.slice(0, -1)
        }
        return result;
    };

    Helpers.putService = function (service, params, opts) {

        var url = APIBaseUrl + service;
        var ajaxOpts = {
            crossDomain: true,
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(params),
            type: 'put',
            xhrFields: {
                withCredentials: true
            }
        }

        if (typeof opts === 'object') {
            $.extend(ajaxOpts, opts);
        }

        return $.ajax(url, ajaxOpts).fail(Helpers.errorHandler);
    };


    Helpers.getService = function (service, params, opts, multiple) {

        var url = APIBaseUrl + service + Helpers.buildGetParams(params),
            deferred = new $.Deferred(),
            isCrossDomain = EQ.Helpers.getBrowser() === "MSIE" && parseInt(EQ.Helpers.getBrowserVersion()) < 10 ? false : true,
            ajaxOpts = {
                crossDomain: isCrossDomain,
                contentType: 'application/json',
                dataType: 'json',
                type: 'get',
                xhrFields: {
                    withCredentials: true
                }
            };

        if (typeof opts === 'object') {
            $.extend(ajaxOpts, opts);
        }

        if (data_cache[url]) {
            console.info('load from cache: ', url);
            if (multiple) {
                deferred.resolve([data_cache[url], {}, {}]) // Return as a 3 part array.
                /*
                
                    TODO: Fix this. The issue is that when you use $.when with 2 or more calls,
                    the result get sent as service1array, service2array and each one includes 
                    response, status, dfObj inside, so in the done function you have to do
                    var data = service1array[0].

                    But if you are calling only one, then the deferred returns as
                    .done(function(data){
                        console.log(data)
                    });

                    Wich is fine, but when we save cache and manually resolve the deferred
                    we don't take this into account making things break on sub-sequent requests.

                 */
            } else {
                deferred.resolve(data_cache[url]);
            }
        } else {
            console.info('loading from service: ', url);
            deferred = $.ajax(url, ajaxOpts)
            .fail(Helpers.errorHandler)
            .done(function (response, status, dfObj) {
                Helpers.saveCache(response, url);
            });
        }

        return deferred;
    };

    Helpers.deleteService = function (service, params, opts) {

        var url = APIBaseUrl + service,
            isCrossDomain = EQ.Helpers.getBrowser() === "MSIE" && parseInt(EQ.Helpers.getBrowserVersion()) < 10 ? false : true,
            ajaxOpts = {
                crossDomain: isCrossDomain,
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(params),
                type: 'delete',
                xhrFields: {
                    withCredentials: true
                }
            };

        if (typeof opts === 'object') {
            $.extend(ajaxOpts, opts);
        }

        $.ajax(url, ajaxOpts).fail(Helpers.errorHandler);
    };

    Helpers.saveCache = function (response, url) {
        data_cache[url] = response;
    };

    Helpers.errorHandler = function (e) {
        console.log('[ASYNC ERROR HANDLER]:')
        console.log(e);
    };

    Helpers.when = function () {
        return $.when.apply(this, arguments)
            .then(function () {
                var args = [];
                $.each(arguments, function (i, arg) {
                    if (typeof arg[1] === 'string' && typeof arg[0] === 'object') {
                        args.push(arg[0]);
                    } else {
                        args.push(arg);
                    }
                });
                return args || arguments;
            });
    };

    Helpers.getACCEstatus = function () {
        return $.ajax({
            url: APIBaseUrl + '/v2.6/me/profile/acce',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        });
    };

    Helpers.abortService = function (service) {
        if (service) {
            if (typeof service.reject == 'function') {
                service.reject();
            }

            if (typeof service.abort == 'function') {
                service.abort();
            }
        }
    };

    Helpers.convertLBStoKGS = function (weightValue, weightUnit) {
        var equivalence = 0.45359237;
        weightValue = parseFloat(weightValue);
        if (weightUnit === 'kgs' && !isNaN(weightValue)) {
            return Helpers.numbers.roundToTwoDecimals(weightValue * equivalence);
        } else {
            return weightValue;
        }
    };

    Helpers.convertDistance = function (distanceValue, distanceUnit, system) {
        var equivalenceMIinKM = 1.609344;
        var equivalenceKMinMI = 0.621371192;
        distanceValue = parseFloat(distanceValue);
        if (distanceUnit && system) {
            if (distanceUnit.toUpperCase() === 'MILES' && system.toUpperCase() === 'METRIC') {
                return Helpers.numbers.roundToTwoDecimals(distanceValue * equivalenceMIinKM);
            } else if (distanceUnit.toUpperCase() === 'KM' && system.toUpperCase() === 'IMPERIAL') {
                return Helpers.numbers.roundToTwoDecimals(distanceValue * equivalenceKMinMI);
            } else {
                return distanceValue;
            }
        } else {
            return distanceValue;
        }
    };

    // Expose globally
    EQ.Helpers = Helpers;
    global.EQ = EQ;

}(window));
