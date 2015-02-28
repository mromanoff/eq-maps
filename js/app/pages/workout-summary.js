(function (App) {
    'use strict';
    
    /* global EQ, debug, APIEndpoint, setTimeout, userProfileJson */

    // Variables
    var WorkoutSummary = App.Pages.WorkoutSummary = {},
        $page = $('section.page.class-summary'),
        $intensityContainer = $('.intensity-level-container'),
        $intensityMeasure = $('.intensity .measure'),
        $intensityRadioBtns = $intensityContainer.find('input'),
        $intensityLevel = $intensityContainer.find('.intensity-level'),
        $caloriesContainer = $('.calories-value-container'),
        $caloriesMeasure = $('.calories .measure'),
        $caloriesNumInput = $caloriesContainer.find('input'),
        $editButton = $('.edit-button'),
        $hiddenIntensity = $intensityContainer.parent('.inactive'), //For the custom workout instensity, which is not displayed normally.
        $duration = $('.duration'),
        $errorArea = $('.error-area'),
        $turnACCE = $('.turn-acce'),
        $overlayBox = $('.overlay-box'),
        $editAll,
        summaryData,
        acceOn = $page.data('hasacce') === 'True',
        isCustom = $page.data('custom') === 'True',
        isOcr = $page.data('ocr') === 'True',
        optedOut = $page.data('optedout') === 'True',
        workoutDate = $page.data('workoutdate'),
        workoutID,
        classInstanceID,
        categoryID,
        subcategoryID,
        errorHandler,
        originalUserSetCaloriesValue = $('.cycling-acce .calories .measure').text(),
        hasData = false;


    WorkoutSummary.init = function (id) {
        
        var rawModel = $('.raw-model').html();

        summaryData = JSON.parse(rawModel.substr(0, rawModel.length - 1)); //Gets rid of the comma at the end in order to parse the data
        debug('Summary Data', summaryData);

        workoutID = id;
        classInstanceID = summaryData.WorkoutEvent.ClassInstanceId;
        categoryID = summaryData.WorkoutEvent.CategoryId;
        subcategoryID = summaryData.WorkoutEvent.SubCategoryId;

        $('.time-location').text(function (i, text) {
            if ($(this).data('facilityid')) {
                var facility = EQ.Helpers.getFacilityById($(this).data('facilityid'));
                if (facility !== null) {
                    text = text + ', ' + facility.ClubName;
                }
            }
            return text;
        });

        errorHandler = EQ.Helpers.loaderAndErrorHandler($errorArea, {
            color: 'black'
        });

        // Load calories overlay
        var $caloriesOverlay = $('<div></div>'),
            infoSaved = false;

        $page.append($caloriesOverlay);

        App.loadComponent('automatic-calories-overlay', $caloriesOverlay);
        
        Backbone.Events.on('automatic-calories-overlay:save-info', function () {
            infoSaved = true;
        });

        Backbone.Events.on('automatic-calories-overlay:close', function () {
            if (infoSaved) {
                location.reload();
            }
        });

        // Event bindings
        $caloriesNumInput.on('keydown', WorkoutSummary.validate).on('keyup', WorkoutSummary.updateValue);
        $intensityRadioBtns.on('click', WorkoutSummary.radioButtonHighlight).on('click', WorkoutSummary.updateCaloriesText);
        $turnACCE.on('click', WorkoutSummary.switchACCE);
        $('.icon-left-arrow').on('click', WorkoutSummary.backButton);
        $('.remove-class').on('click', WorkoutSummary.removeClass);

        //Cycling Events
        if (categoryID === 6 && !isCustom && !isOcr) {

            $editAll = $editButton.add($caloriesContainer).add($caloriesMeasure);
            $editButton.on('click', WorkoutSummary.editCycling);
            
            //Shows the loader because cycling depends on API calls
            errorHandler.showLoader();

            //Builds up the class search link
            /*
            $('.take-it-again').attr('href', function () {
                return this.href + '?clubs=' + summaryData.Facility.FacilityId + '&categories=' + categoryID + '&instructors=' + summaryData.WorkoutEvent.Instructors[0].Instructor.Id + '&classes=' + summaryData.WorkoutEvent.ClassId;
            });
            */
            
            //Calls the API services for Cycling
            WorkoutSummary.loadCyclingStats().done(function () {

                errorHandler.hideLoader();
                debug('<------  HAS DATA  ------>', hasData);
                if (hasData) {
                    $caloriesMeasure = $('.calories:first .measure');
                    $('.cycling-acce').remove();
                    $('.notes-container').remove();
                    $turnACCE.remove();
                    $('.editable-info-container').removeClass('hidden');
                    $('.class-rank-container').removeClass('hidden');
                } else {
                    $('.five-items').remove();
                    $('.cycling-acce').removeClass('hidden');
                    $('.notes-container').removeClass('hidden');
                    $turnACCE.removeClass('hidden');

                    //I have to reset the caloriesNumInput field
                    $caloriesNumInput = $('.calories-value-container input');
                    WorkoutSummary.acceClassBehavior();

                }

                //Reload calories jquery object. 
                $caloriesMeasure = $('.calories .measure');

            }).fail(function () {
                errorHandler.showError();
            });

        } else {

            WorkoutSummary.acceClassBehavior();

        }
        
    };

    WorkoutSummary.acceClassBehavior = function () {
        if (acceOn) {
            //$caloriesNumInput.on('keyup', WorkoutSummary.updateIntensity);
            $intensityRadioBtns.on('click', WorkoutSummary.updateCalories);

            if (localStorage.getItem('acce-' + workoutID) === null && $intensityMeasure.text() !== '-') {
                WorkoutSummary.showMessage('acce', 4000);
                localStorage.setItem('acce-' + workoutID, 'true');
            }
        }

        $editAll = $intensityContainer.add($caloriesContainer).add($intensityMeasure).add($caloriesMeasure).add($editButton);
        $editButton.off().on('click', WorkoutSummary.edit);
    };

    WorkoutSummary.loadCyclingStats = function () {
        
        var defer = $.Deferred();

        var endpoint = {
            CLASS_STATS : '/v3/classes/' + classInstanceID + '/me/statistics',
            UNITS : '/v2.6/me/profile/unitofmeasure'
        };

        var xhrStats = EQ.Helpers.getService(endpoint.CLASS_STATS);

        var xhrUnits = EQ.Helpers.getService(endpoint.UNITS);

        EQ.Helpers.when(xhrStats, xhrUnits).done(function (data) {

            //Details Section
            WorkoutSummary.userStatsView(data[0], data[1].unitOfMeasure);

            //Opted out of games
            if (!optedOut) {
                WorkoutSummary.userRankView(data[0], userProfileJson.Gender);
            }

            defer.resolve();

        }).fail(function () {
            defer.reject();
        });

        return defer;
    };

    WorkoutSummary.userRankView = function (stats, gender) {
        //default to gender if gender is undefined
        gender = (gender ? gender : 'female');

        var $rank = $('.rank-result'),
            $firstrank = $rank.siblings('.first-position');

        if (stats.rank !== 0) {
            var ranknum = EQ.Helpers.ordinate(stats.rank);
            //Show the callout if the user is ranked first
            if (ranknum.num === '1') {
                $rank.addClass('hidden');
                $firstrank.removeClass('hidden');
                $firstrank.find('.' + gender.toLowerCase()).removeClass('hidden');
                $rank = $firstrank;
            }

            $rank.find('.rank-num').html(ranknum.num + '<sup>' + ranknum.ord + '</sup>');
            $rank.find('.rank-total').text(stats.userCount);
            $rank.find('.rank-gender').text(function () {
                return $(this).text().replace('[men/women]', (gender.toLowerCase() === 'female' ? 'women' : 'men'));
            });

        } else {
            $rank.hide();
        }
    };

    WorkoutSummary.userStatsView = function (stats, unitofmeasure) {

        //Class stats
        var $editableInfoItems = $('.editable-info-container').children().find('.measure'),
            distancevalue = '-',
            thevalue = '-';

        if (stats.metrics.length > 0) {
            _.each(stats.metrics, function (metric) {
                var $item = $editableInfoItems.filter('[data-type=' + metric.name + ']');
                thevalue = '-';
                if (metric.value) {
                    if (metric.metric === 'Power' || metric.metric === 'Calories' || metric.metric === 'Energy') {
                        thevalue = parseInt(metric.value, 10) + EQ.Helpers.shortUnit(metric.metric);

                        //Override calories with user set values
                        if (metric.metric === 'Calories' && originalUserSetCaloriesValue && originalUserSetCaloriesValue !== '-') {
                            thevalue = parseInt(originalUserSetCaloriesValue, 10) + EQ.Helpers.shortUnit(metric.metric);
                        }

                    } else {
                        if (metric.metric === 'Distance') {
                            distancevalue = EQ.Helpers.numbers.trimDecimals(metric.value) + ' ' + EQ.Helpers.longUnit(metric.metric + unitofmeasure);
                            thevalue = EQ.Helpers.numbers.trimDecimals(metric.value) + EQ.Helpers.shortUnit(metric.metric + unitofmeasure);
                        } else {
                            thevalue = EQ.Helpers.numbers.trimDecimals(metric.value) + EQ.Helpers.shortUnit(metric.metric + unitofmeasure);
                        }
                    }

                    //There is data
                    hasData = true;

                }

                $item.text(thevalue);
            });

        }

        //Load sharing component
        WorkoutSummary.SharingComponent(distancevalue);

    };

    WorkoutSummary.SharingComponent = function (distance) {
        
        var linkUrl = '/activity/' + userProfileJson.ShareId + '/classes/' + classInstanceID,
            title,
            picUrl,
            twCopy;

        switch (parseInt(subcategoryID, 10)) {
        case 1: //Studio
            title = summaryData.ClassSummary.OgTitle;
            twCopy = 'I just rode ' + distance + ' in an Equinox Cycling Class. ' + linkUrl + ' #EQSTUDIOCYCLING';
            picUrl = !summaryData.ClassSummary.OgImageUrl ? location.origin + '/assets/images/sharing/fb_bab.png' : summaryData.ClassSummary.OgImageUrl;
            break;
        case 2: //Build
            title = 'The Pursuit: Build';
            twCopy = 'I just went on the ultimate power trip in this new cycling class. It’s one wild ride. #EQXpursuit ' + linkUrl;
            picUrl = !summaryData.ClassSummary.OgImageUrl ? location.origin + '/assets/images/activity/sharing/EQ_FacebookPost_Build_1200x630.png' : summaryData.ClassSummary.OgImageUrl;
            break;
        case 3: //Burn
            title = 'The Pursuit: Burn';
            twCopy = 'I just set the bike on fire in this new cycling class. It’s one wild ride. #EQXpursuit ' + linkUrl;
            picUrl = !summaryData.ClassSummary.OgImageUrl ? location.origin + '/assets/images/activity/sharing/EQ_FacebookPost_Burn_1200x630.png' : summaryData.ClassSummary.OgImageUrl;
            break;
        default:
            title = summaryData.ClassSummary.OgTitle;
            twCopy = 'Twitter Share';
            picUrl = !summaryData.ClassSummary.OgImageUrl ? location.origin + '/assets/images/sharing/fb_bab.png' : summaryData.ClassSummary.OgImageUrl;
            break;
        }

        App.loadComponent('share', $('.social-icons'), {
            'type': 'share-summary',
            'fbMode': 'share-summary',
            'distance': distance,
            'linkurl': linkUrl,
            'picture': picUrl,
            'name': title,
            'twCopy': twCopy
        });
    };

    WorkoutSummary.editCycling = function (e) {
        e.preventDefault();

        var d = new $.Deferred(),
            intensityLevel = 'medium',
            caloriesInput = $caloriesNumInput.val();

        errorHandler.hideError();
        
        if ($(this).hasClass('save') && (caloriesInput !== '' && caloriesInput !== $caloriesMeasure.text())) {
            d = WorkoutSummary.save(caloriesInput, intensityLevel);
        } else {
            if (!caloriesInput.length) {
                $caloriesNumInput.val(parseInt($caloriesMeasure.text(), 10) || '');
            }
            d.resolve();
        }

        d.always(function () {
            $editAll.toggleClass('hidden');
        });
    };

    WorkoutSummary.edit = function (e) {
        e.preventDefault();

        if (isCustom || isOcr) {
            window.location.href = '/activity/workout/add-custom/' + workoutID;
        } else {
            e.preventDefault();
            var d = new $.Deferred(),
                validIntensity = new RegExp('low|medium|high'),
                intensityLevel = $intensityLevel.text().toLowerCase(),
                intensityMeasure = $intensityMeasure.text().toLowerCase(),
                caloriesInput = $caloriesNumInput.val();

            errorHandler.hideError();
            
            if ($(this).hasClass('save') && (caloriesInput !== $caloriesMeasure.text() || intensityLevel !== intensityMeasure) && (validIntensity.test(intensityLevel))) {
                d = WorkoutSummary.save(caloriesInput, intensityLevel);
            } else {
                if (!caloriesInput.length) {
                    $caloriesNumInput.val(parseInt($caloriesMeasure.text(), 10) || '');
                }
                $intensityLevel.text(validIntensity.test(intensityMeasure) ? intensityMeasure : 'HOW HARD DID YOU GO?');
                WorkoutSummary.radioButtonSetActive(intensityMeasure);
                d.resolve();
            }

            d.always(function () {
                $editAll.toggleClass('hidden');
                $hiddenIntensity.toggleClass('inactive');
                $duration.toggleClass('hidden');
            });
        }

    };

    WorkoutSummary.save = function (calories, intensityLevel) {
        
        errorHandler.showLoader();

        return EQ.Helpers.putService('/v2.6/me/workouts/' + workoutID + '/update-calories/' + calories + '/' + intensityLevel.toLowerCase()).done(function () {
            debug('calories', calories);
            $caloriesMeasure.text(calories);
            $intensityMeasure.text(intensityLevel);
        }).fail(function (d) {
            debug('server error', d.responseJSON);
            errorHandler.showError();
        }).always(function () {
            errorHandler.hideLoader();
        });
    };

    WorkoutSummary.validate = function (e) {
        return !(e.which > 57 && (e.which < 96 || e.which > 105));
    };

    WorkoutSummary.updateIntensity = function () {

        var num = parseInt($caloriesNumInput.val(), 10),
            $radioHi = $intensityRadioBtns.eq(2),
            $radioMed = $intensityRadioBtns.eq(1),
            $radioLow = $intensityRadioBtns.eq(0);

        if (num >= parseInt($radioHi.val(), 10)) {
            $radioHi.prop('checked', true);
            $intensityLevel.text($radioHi.attr('id').toLowerCase());
        } else if (num >= parseInt($radioMed.val(), 10)) {
            $radioMed.prop('checked', true);
            $intensityLevel.text($radioMed.attr('id').toLowerCase());
        } else {
            $radioLow.prop('checked', true);
            $intensityLevel.text($radioLow.attr('id').toLowerCase());
        }

    };

    WorkoutSummary.updateValue = function () {
        $(this).val(parseInt($(this).val().substr(0, 4), 10) || '');
    };

    WorkoutSummary.updateCalories = function () {
        $caloriesNumInput.val($(this).val());
    };

    WorkoutSummary.radioButtonHighlight = function () {
        WorkoutSummary.radioButtonSetActive($(this).attr('id'));
    };

    WorkoutSummary.radioButtonSetActive = function (text) {
        $intensityRadioBtns.prop('checked', false).parent().removeClass('active');
        $intensityRadioBtns.filter('#' + text).prop('checked', true).parent().addClass('active');
    };

    WorkoutSummary.updateCaloriesText = function () {
        $intensityLevel.text($(this).attr('id'));
    };

    WorkoutSummary.removeClass = function (e) {
        
        e.preventDefault();

        App.loadComponent('confirm-modal', $('#confirmModalTemplate'), {
            callback: function (confirm) {

                if (confirm) {
                    var ENDPOINT = APIEndpoint + '/me/calendar/cancel/' + workoutID + '?removeRecurring=false',
                        ev = e;

                    errorHandler.hideError();
                    errorHandler.showLoader();

                    $.ajax({
                        type: 'DELETE',
                        url: ENDPOINT,
                        contentType: 'application/json',
                        xhrFields: { 'withCredentials': true },
                        dataType: 'json'
                    }).done(function (data) {

                        debug('[REMOVECLASS OK]', data);

                        errorHandler.hideLoader();

                        WorkoutSummary.showMessage('remove', 4000, function () {
                            WorkoutSummary.backButton(ev);
                        });

                    }).fail(function (d) {
                        debug('server error', d.responseJSON);
                        errorHandler.showError();
                    }).always(function () {
                        errorHandler.hideLoader();
                    });
                }

            }
        });

    };

    WorkoutSummary.backButton = function (e) {
        e.preventDefault();

        if (!isCustom && history.length && !isOcr) {
            history.go(-1);
        } else {
            location.replace('/activity#WORKOUTS/' + workoutDate);
        }
    };

    WorkoutSummary.switchACCE = function () {
        Backbone.Events.trigger('automatic-calories-overlay:open');
    };

    WorkoutSummary.showMessage = function (type, timeout, cb) {
        
        switch (type) {
        case 'acce':
            $overlayBox.text('Class and calories have been added to your calendar and activity');
            break;
        case 'remove':
            $overlayBox.text('Workout Removed');
            break;
        }

        $overlayBox.addClass('active');
        setTimeout(function () {
            $overlayBox.removeClass('active');
            if (typeof cb === 'function') {
                cb();
            }
        }, timeout);
    };

}(window.App));
