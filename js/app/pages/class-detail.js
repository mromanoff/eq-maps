(function (App) {
    'use strict';

    /* global EQ, APIEndpoint, APIEndpoint26, userProfileJson, Backbone, _, debug, moment, user */

    var ClassDetail = App.Pages.ClassDetail = {};

    /*
     * Models
     */

    var Item = Backbone.Model.extend({
        defaults: {
            id: '',
            type: '',
            selected: false,
            displayName: ''
        }
    });


    /*
     * Models
     */

    var ItemCollection = Backbone.Collection.extend();


    /*
     * Views
     */

    var FavoritesContainerView = Backbone.View.extend({
        el: '.favorites-class-container',
        initialize: function (options) {
            this.options = options || {};
        },
        render: function () {
            var itemCollection = new ItemCollection(),
                favoritesButtonView = new FavoritesButtonView(),
                favoritesListView = new FavoritesListView({
                    collection: itemCollection,
                    favoritesData: this.options.favoritesData,
                    updateCallback: (favoritesButtonView.updateCount).bind(favoritesButtonView)
                });

            favoritesButtonView.render();
            favoritesListView.render();
        }
    });

    var FavoritesButtonView = Backbone.View.extend({
        el: '.favorites-button',
        updateCount: function (number) {
            var content = '';
            if (number !== 0) {
                content = '(' + number + ')';
            }
            this.$el.find('.favorite-count').text(content);
        },
        render: function () {
            var that = this;
            this.$el.on('click', function () {
                that.$el.toggleClass('active');
            });
        }
    });

    var FavoritesListView = Backbone.View.extend({
        el: '.favorites-list',
        initialize: function (options) {
            this.options = options || {};
        },
        updateCount: function () {
            var count = 0;
            this.collection.each(function (item) {
                if (item.get('selected')) {
                    count++;
                }
            });
            this.options.updateCallback(count);
        },
        render: function () {
            var that = this;
            this.$el.find('li').each(function (index, element) {
                var type = $(element).attr('data-type'),
                    id = parseInt($(element).attr('data-id'), 10),
                    data = that.options.favoritesData,
                    item,
                    selected = false,
                    favoritesListSingleView;

                if (_.findIndex(data[type], { id: id }) !== -1) {
                    selected = true;
                }

                item = new Item({
                    displayName: $(element).find('strong').text(),
                    type: type,
                    id: id,
                    selected: selected
                });

                that.collection.add(item);

                favoritesListSingleView = new FavoritesListSingleView({
                    el: element,
                    model: item,
                    updateCallback: (that.updateCount).bind(that)
                });

                favoritesListSingleView.render();
            });
        }
    });

    var FavoritesListSingleView = Backbone.View.extend({
        model: Item,
        initialize: function (options) {
            this.options = options || {};
        },
        toggleSelected: function () {
            this.model.set('selected', !this.model.get('selected'));
            this.options.updateCallback();
            this.$el.find('span').toggleClass('icon-star icon-star-empty');
        },
        updateFavorite: function () {
            var status = this.model.get('selected'),
                ENDPOINT_URL = APIEndpoint + '/me/favorites/' + this.model.get('type'),
                that = this;
            if (!status) {
                this.model.urlRoot = ENDPOINT_URL;
                this.model.save({}, {
                    contentType: 'application/json',
                    xhrFields: { 'withCredentials': true },
                    success: function (model, response) {
                        debug('SAVE MODEL', response);
                        that.toggleSelected();
                    }
                });
            } else {
                ENDPOINT_URL = ENDPOINT_URL + '/remove/' + this.model.get('id');
                $.ajax({
                    type: 'DELETE',
                    url: ENDPOINT_URL,
                    xhrFields: { 'withCredentials': true },
                    contentType: 'application/json'
                }).success(function (response) {
                    debug('DESTROY MODEL', response);
                    that.toggleSelected();
                });
            }
            EQ.Helpers.user.invalidateFavoritesCache();
        },
        render: function () {
            var that = this;
            if (this.model.get('selected')) {
                this.$el.find('span').removeClass('icon-star-empty').addClass('icon-star');
                this.options.updateCallback();
            }
            this.$el.on('click', function () {
                that.updateFavorite();
            });
        }
    });

    var DataBikes = {};
    var DataClass = {};
    var BikeClassDetail = {};
    var RegularClassDetail = {};

    DataBikes.init = function (ENDPOINT, bikeInstanceID) {
        $.ajax({
            type: 'GET',
            url: ENDPOINT,
            contentType: 'application/json',
            xhrFields: { 'withCredentials': true },
            dataType: 'json',
            success: function (data) {
                debug('bikesdata', data);
                if (data.reservation.result !== null) {
                    if (data.layout.cycleClassStatus.isClassWithinCancelPeriod === false) {
                        $('.remove-class').addClass('active');
                        $('.remove-class').on('click', DataClass.removeClass);
                    }
                    else {
                        $('.see-bike, .cancel-class').addClass('active');
                        $('.cancel-class').on('click', function () {
                            DataBikes.cancelBike(bikeInstanceID, $(this));
                        });

                        DataBikes.checkOptStatus(bikeInstanceID, data);
                    }
                } else {
                    $('.see-bike, .cancel-class').removeClass('active');
                    $('.book-bike, .remove-class').addClass('active');
                }
                if (DataClass.jsonData.status.isWithinBookingWindow === false) {
                    $('.see-bike, .book-bike').removeClass('active');
                }
            },
            error: function (d) {
                debug('server error', d.responseJSON);
            }
        });
    };

    DataBikes.checkOptStatus = function (bikeInstanceID, data) {
        if (data.classInstanceDetail.workoutSubCategoryId === 2 || data.classInstanceDetail.workoutSubCategoryId === 3) {
            var isCyclingLeaderOptOut = true,
                $optInCheckBox = $('.class-detail li .checkbox input[type="checkbox"]'),
                $checkBoxComponent = $optInCheckBox.parents('.checkbox.inline');
            
            if (data.reservation.result && data.reservation.result.isCyclingLeaderOptOut === false) {
                isCyclingLeaderOptOut = false;
            }

            $('.class-detail li.opt-status').show();
            
            // If optOut is false, we need to check if not uncheck.
            $optInCheckBox.attr('checked', !isCyclingLeaderOptOut);
            if (!isCyclingLeaderOptOut) {
                $checkBoxComponent.addClass('checked');
            } else {
                $checkBoxComponent.removeClass('checked');
            }

            DataBikes.OptInCheckboxloader = EQ.Helpers.loaderAndErrorHandler($('.opt-status'), {
                type: 'popup',
                color: 'white',
                errorTitle: 'Error'
            });

            $optInCheckBox.on('change', function () {
                DataBikes.OptInCheckboxloader.showLoader();

                var isChecked = $(this).is(':checked');

                // if the optIn was not checked, get the gender before check
                if ($(this).is(':checked') && !DataBikes.gender) {
                    EQ.Helpers.getService('/v1/me').done(function (preferencesData) {
                        var gender = preferencesData.profile.gender;

                        debug('CURRENT GENDER+++++++++', gender);

                        if (gender !== 'Male' && gender !== 'Female') {

                            DataBikes.OptInCheckboxloader.hideLoader();

                            if (!DataBikes.genderModalInitialized) {
                                App.loadComponent('gender-selection', $('.classdetail'), {
                                    genderSelectedCallback: function (gender) {
                                        DataBikes.gender = gender;
                                        $checkBoxComponent.addClass('checked');
                                        $optInCheckBox.attr('checked', true);

                                        DataBikes.OptInCheckboxloader.showLoader();
                                        DataBikes.getOptStatus(bikeInstanceID, false);
                                    },
                                    genderDeclinedCallback: function () {
                                        $checkBoxComponent.removeClass('checked');
                                        $optInCheckBox.attr('checked', false);

                                        DataBikes.OptInCheckboxloader.showLoader();
                                        DataBikes.getOptStatus(bikeInstanceID, true);
                                    }
                                });
                                DataBikes.genderModalInitialized = true;
                            } else {
                                Backbone.Events.trigger('gender-selection:open');
                            }

                        } else {
                            // NORMAL BEHAVIOR
                            DataBikes.OptInCheckboxloader.showLoader();
                            $('.opt-status').find('.loader, .error-box').remove();
                            DataBikes.getOptStatus(bikeInstanceID, !isChecked);
                        }
                    });
                } else {
                    // NORMAL BEHAVIOR
                    DataBikes.OptInCheckboxloader.showLoader();
                    $('.opt-status').find('.loader, .error-box').remove();
                    DataBikes.getOptStatus(bikeInstanceID, !isChecked);
                }
            });
        }
    };

    DataBikes.getOptStatus = function (bikeInstanceID, optOutStatus) {
        console.log('OPT STATUS', optOutStatus);

        var ENDPOINT = APIEndpoint + '/classes/bikes/' + bikeInstanceID + '/leaderoptout/' + optOutStatus;

        $.ajax({
            type: 'PUT',
            url: ENDPOINT,
            contentType: 'application/json',
            xhrFields: { 'withCredentials': true },
            dataType: 'json',
            success: function (data) {
                debug('OPT STATUS OK', data);
                
                DataBikes.OptInCheckboxloader.hideLoader();
            },
            error: function (d) {
                debug('server error', d.responseJSON);
                DataBikes.OptInCheckboxloader.showError();
            }
        });
    };

    DataBikes.cancelBike = function (bikeInstanceID, $el) {
        console.log('CANCEL BIKE');
        var ENDPOINT = APIEndpoint + '/classes/bikes/' + bikeInstanceID + '/cancel',
            loaderAndError;

        loaderAndError = EQ.Helpers.loaderAndErrorHandler($el, {
            type: 'button',
            color: 'black',
            errorTitle: 'Error'
        });
        loaderAndError.showLoader();

        $.ajax({
            type: 'DELETE',
            url: ENDPOINT,
            contentType: 'application/json',
            xhrFields: { 'withCredentials': true },
            dataType: 'json',
            success: function (data) {
                debug('CANCEL BIKE OK', data);
                loaderAndError.hideLoader();

                $('.remove-class').trigger('click');
                $('.see-bike, .cancel-class').removeClass('active');
                $('.opt-status').hide();
                $('.remove-class, .book-bike').addClass('active');
            },
            error: function (d) {
                debug('server error', d.responseJSON);
                loaderAndError.showError();
            }
        });
    };

    DataClass.init = function (CLASSENDPOINT) {
        $.ajax({
            type: 'GET',
            url: CLASSENDPOINT,
            cache: false,
            contentType: 'application/json',
            xhrFields: { 'withCredentials': true },
            dataType: 'json',
            success: function (data) {
                debug('classdata', data);
                window.tagData = window.tagData || {};

                var timeOffset = window.moment(data.startLocal).diff(data.facilityCurrentDateTime, 'hours'),
                    timeOffsetMinutes = window.moment(data.startLocal).diff(data.facilityCurrentDateTime, 'minutes');

                if (timeOffset || timeOffsetMinutes) {
                    if (timeOffset > 0) {
                        timeOffset = Math.floor(timeOffset);
                    } else {
                        timeOffset = Math.ceil(timeOffset);
                    }

                    if (timeOffset === 0) {
                        if (timeOffsetMinutes > 0) {
                            timeOffset = 1;
                        } else {
                            timeOffset = -1;
                        }
                    }
                }
                window.tagData.classInstance = {
                    'classId': data.classId.toString(),
                    'facilityId': data.facilityId,
                    'classInstanceId': data.classInstanceId.toString(),
                    'categoryId': data.workoutCategoryId.toString(),
                    'timeOffset': timeOffset.toString()
                };

                // Make data available on other methods
                DataClass.jsonData = data;

                if (data.isOnCalendar === false) {
                    $('.add-class').addClass('active');
                } else {
                    $('.export-to-calendar').addClass('active');

                    $('.export-to-calendar').on('click', function () {
                        window.tagData.exportToCal = window.tagData.exportToCal || {};
                        window.tagData.exportToCal = {
                            'action': 'export-complete',
                            'type': 'class'
                        };
                        window.track('exportToCal', window.tagData.exportToCal);
                    });

                    if (data.isCyclingClass === true) {
                        var ENDPOINT = APIEndpoint + '/classes/bikes/' + BikeClassDetail.classInstance;

                        DataBikes.init(ENDPOINT, BikeClassDetail.classInstance);
                    } else {
                        $('.remove-class').addClass('active');
                    }
                }

                $('.add-class').on('click', DataClass.addClass);
                $('.remove-class').on('click', DataClass.removeClass);
            },
            error: function (d) {
                debug('server error', d.responseJSON);
            }
        });
    };

    DataClass.addClass = function (e) {
        e.preventDefault();

        var ENDPOINT = APIEndpoint26 + '/me/calendar/' + BikeClassDetail.classInstance + '?isRecurring=false',
            loaderAndError,
            addToCalendar;

        loaderAndError = EQ.Helpers.loaderAndErrorHandler($(this), {
            type: 'button',
            color: 'white',
            errorTitle: 'Error'
        });

        var $genderFeedback = $('.gender-feedback');
        var validGender = new RegExp('male|female');
        var optStatus = $('.class-detail li.opt-status input').prop('checked');

        $genderFeedback.addClass('hidden');

        //In case the user opts in for games, the gender must be set
        if (!optStatus || (userProfileJson.Gender && validGender.test(userProfileJson.Gender.toLowerCase()))) {
            
            loaderAndError.showLoader();

            addToCalendar = $.ajax({
                type: 'POST',
                url: ENDPOINT,
                contentType: 'application/json',
                xhrFields: { 'withCredentials': true },
                dataType: 'json'
            });

            addToCalendar.done(function (data) {
                loaderAndError.hideLoader();
                debug('[ADDCLASS OK]', data);

                if (DataClass.jsonData.isCyclingClass === true) {
                    $('.remove-class, .export-to-calendar').addClass('active');
                    $('.add-class').removeClass('active');

                    if (DataClass.jsonData.status.isWithinBookingWindow === false) {
                        $('.see-bike, .book-bike').removeClass('active');
                        $('.overlay-box:not(.bike-overlay).add').addClass('active');
                        setTimeout(function () {
                            $('.overlay-box:not(.bike-overlay).add').removeClass('active');
                        }, 5000);
                    } else {
                        $('.bike-overlay.add, .book-bike').addClass('active');
                        setTimeout(function () {
                            $('.bike-overlay.add').removeClass('active');
                        }, 5000);
                    }
                } else {
                    $('.overlay-box.add, .export-to-calendar, .remove-class').addClass('active');
                    $('.add-class').removeClass('active').find('p').remove();
                    setTimeout(function () {
                        $('.overlay-box.add').removeClass('active');
                    }, 5000);
                }

                if (moment(DataClass.jsonData.endLocal).isBefore(DataClass.jsonData.facilityCurrentDateTime)) {
                    window.location.href = '/activity/workouts/' + data.result.id;
                }
                
            }).fail(function (d) {
                debug('server error', d.responseJSON);
                loaderAndError.showError();
            });

        } else {
            debug('gender missing', userProfileJson.Gender);
            $genderFeedback.removeClass('hidden');
        }
        
    };

    DataClass.removeClass = function (e) {
        e.preventDefault();
        var ENDPOINT = APIEndpoint + '/me/calendar/cancel/' + DataClass.jsonData.userEventId + '?removeRecurring=false',
            loaderAndError;

        loaderAndError = EQ.Helpers.loaderAndErrorHandler($(this), {
            type: 'button',
            color: 'black',
            errorTitle: 'Error'
        });
        loaderAndError.showLoader();

        $.ajax({
            type: 'DELETE',
            url: ENDPOINT,
            contentType: 'application/json',
            xhrFields: { 'withCredentials': true },
            dataType: 'json',
            success: function (data) {
                debug('[REMOVECLASS OK]', data);

                var currentDateTime = DataClass.jsonData.facilityCurrentDateTime;

                var timeOffset = moment(DataClass.jsonData.startDate).diff(currentDateTime, 'hours'),
                            timeOffsetMinutes = moment(DataClass.jsonData.startDate).diff(currentDateTime, 'minutes');

                if (timeOffset || timeOffsetMinutes) {

                    if (timeOffset > 0) {
                        timeOffset = Math.floor(timeOffset);
                    } else {
                        timeOffset = Math.ceil(timeOffset);
                    }

                    if (timeOffset === 0) {
                        if (timeOffsetMinutes > 0) {
                            timeOffset = 1;
                        } else {
                            timeOffset = -1;
                        }
                    }
                }
                window.tagData.classInstance = window.tagData.classInstance || {};
                window.tagData.classInstance = {
                    classId: DataClass.jsonData ? (DataClass.jsonData.classId !== '' && DataClass.jsonData.classId !== null ? DataClass.jsonData.classId.toString() : '') : '',
                    facilityId: DataClass.jsonData ? (DataClass.jsonData.facility.facilityId !== '' && DataClass.jsonData.facility.facilityId !== null ? DataClass.jsonData.facility.facilityId.toString() : '') : '',
                    classInstanceId: DataClass.jsonData ? (DataClass.jsonData.classInstanceId !== '' && DataClass.jsonData.classInstanceId !== null ? DataClass.jsonData.classInstanceId.toString() : '') : '',
                    categoryId: DataClass.jsonData ? (DataClass.jsonData.workoutCategoryId !== '' && DataClass.jsonData.workoutCategoryId !== null ? DataClass.jsonData.workoutCategoryId.toString() : '') : '',
                    timeOffset: timeOffset ? timeOffset.toString() : ''
                };
                window.track('classCalendarDelete', window.tagData.classInstance);

                loaderAndError.hideLoader();

                $('.overlay-box.remove, .add-class').addClass('active');
                $('.remove-class, .see-bike, .book-bike, .export-to-calendar').removeClass('active');

                if (DataClass.jsonData.isCyclingClass === true && DataClass.jsonData.isFinished === false || DataClass.jsonData.isHappeningNow === false) {
                    $('.book-bike').addClass('active');
                }

                setTimeout(function () {
                    $('.overlay-box.remove').removeClass('active');
                }, 5000);
            },
            error: function (d) {
                debug('server error', d.responseJSON);
                loaderAndError.showError();
            }
        });
    };

    ClassDetail.renderButtons = function () {
        BikeClassDetail.classInstance = $('nav.buttons').data('id');
        RegularClassDetail.classInstance = BikeClassDetail.classInstance;

        var CLASSENDPOINT = APIEndpoint26 + '/classes/' + RegularClassDetail.classInstance;

        DataClass.init(CLASSENDPOINT);
    };

    ClassDetail.updateOmniture = function () {

        if ($(document).find($('#classDetailsInfo'))) {
            window.tagData = window.tagData || {};
            var classDetails = JSON.parse($('#classDetailsInfo').attr('data-component-options')),
                timeOffset = window.moment(classDetails.startLocal).diff(classDetails.facilityCurrenttime, 'hours'),
                timeOffsetMinutes = window.moment(classDetails.startLocal).diff(classDetails.facilityCurrenttime, 'minutes');

            if (timeOffset) {

                if (timeOffset > 0) {
                    timeOffset = Math.floor(timeOffset);
                } else {
                    timeOffset = Math.ceil(timeOffset);
                }

                if (timeOffset === 0) {
                    if (timeOffsetMinutes > 0) {
                        timeOffset = 1;
                    } else {
                        timeOffset = -1;
                    }
                }
            }
            window.tagData.classInstance = {
                'classId': classDetails.classID,
                'facilityId': classDetails.facilityID,
                'classInstanceId': classDetails.classInstanceID,
                'categoryId': classDetails.categoryID,
                'timeOffset': timeOffset.toString()
            };
        }
    };

    ClassDetail.init = function (id) {

        console.log(id);

        EQ.Helpers.user.getFavorites(function (favoritesData) {
            var favoritesContainerView = new FavoritesContainerView({ favoritesData: favoritesData });
            favoritesContainerView.render();
        });

        if (user) {
            ClassDetail.renderButtons();
        }

        ClassDetail.updateOmniture();
		
        
    };

}(window.App));