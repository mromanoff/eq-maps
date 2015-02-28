(function (App) {
    'use strict';

    /* global EQ, moment, APIEndpoint26 */
    var AddCustomWorkout = App.Pages.AddCustomWorkout = {};
    var $dayField = $('[data-type="date"]');
    var $daylabel = $('.dropdown.date .option');
    var $monthField = $('[data-type="month"]');
    var $monthLabel = $('.dropdown.month .option');
    var $yearField = $('[data-type="year"]');
    var $yearLabel = $('.dropdown.year .option');
    var $minutesField = $('[data-type="minutes"]');
    var $hoursField = $('[data-type="hour"]');
    var $activitiesField = $('[data-type="activities"]');
    var $distanceUnitField = $('[data-type="unit"]');
    var $instructorField = $('#workoout-instructor');
    var $caloriesField = $('#workoout-calories');
    var $distanceField = $('#workoout-distance');
    var $hiddenFieldSet = $('.hidden-fields fieldset');
    var $notesField = $('#workoout-notes');
    
    //required input fileds
    var $workoutDuration = $('#workout-duration');
    var $workoutDurationMobileInput = $('#workout-duration-mobile');
    var $customNameField = $('#custom-name');
    var $cancelButton = $('#cancel-bttn');
    var $toggle = $('.toggle-am-pm');
    var $submit = $('#submit-bttn');
    var _collectedData = {};
    var errorHandler;
    var $errorArea = $('.error-area');
    var _workoutObjects;
    var _workoutID;
    var _isOcrWorkout = false;
    var _editMode = false;
    var $durationMobile = $('.duration-radio');

    AddCustomWorkout.init = function (id) {
        console.log(id);

        if (!_.isNull(id)) {
            _workoutID = id;
            _editMode = true;

            $('#page-title').html('EDIT ACTIVITY');
            $submit.html('SAVE CHANGES');

        }

        errorHandler = EQ.Helpers.loaderAndErrorHandler($errorArea, {
            type: 'button',
            color: 'black',
            errorTitle: 'ERROR'
        });

        if (!_editMode) {
            AddCustomWorkout.setDate();
            AddCustomWorkout.setTime();
        } else {
            AddCustomWorkout.getWorkouts();
        }

        $dayField.change(AddCustomWorkout.updateDropdown);
        $monthField.change(AddCustomWorkout.updateDropdown);
        $yearField.change(AddCustomWorkout.updateDropdown);
        $minutesField.change(AddCustomWorkout.updateDropdown);
        $hoursField.change(AddCustomWorkout.updateDropdown);
        $activitiesField.change(AddCustomWorkout.updateDropdown);
        $instructorField.change(AddCustomWorkout.updateDropdown);
        $toggle.click(AddCustomWorkout.toggleClick);
        $submit.click(AddCustomWorkout.validateData);
        $durationMobile.click(AddCustomWorkout.renderDurationMobile);
        $workoutDuration.keyup(AddCustomWorkout.onlyNums);
        $workoutDurationMobileInput.keyup(AddCustomWorkout.onlyNums);
        $caloriesField.keyup(AddCustomWorkout.onlyNums);
        $distanceField.keyup(AddCustomWorkout.onlyNums);
        $notesField.change(AddCustomWorkout.updateCountdown);
        $notesField.keyup(AddCustomWorkout.updateCountdown);
        $customNameField.change(AddCustomWorkout.updateDropdown);
        $distanceUnitField.change(AddCustomWorkout.updateDropdown);
        $cancelButton.on('click', AddCustomWorkout.cancel);
    };

    AddCustomWorkout.updateCountdown = function () {
        var remaining = 300 - $notesField.val().length;
        $('#countdown').text(remaining);
    };

    AddCustomWorkout.setDate = function () {
        var date = new Date().getDate();
        var month = new Date().getMonth();
        var year = new Date().getFullYear();
        var monthName = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        $dayField.val(date.toString());
        $daylabel.html(date);

        $monthField.val((month + 1).toString());
        $monthLabel.html(monthName[month]);
        $yearField.val(year.toString());
        $yearLabel.html(year);

        AddCustomWorkout.getWorkouts();

    };

    AddCustomWorkout.setTime = function () {
        var dt = moment().subtract(30, 'minutes');
        var hour = dt.hours();
        var min = dt.minutes();

        $toggle.removeClass('off').addClass('on'); // For AM

        if (hour >= 12) {
            hour = hour - 12;
            $toggle.removeClass('on').addClass('off'); // For PM
        }

        hour = (hour === 0) ? 12 : hour;
        hour = (hour < 10) ? '0' + hour : hour;

        $hoursField.find('option[value=' + hour + ']').prop('selected', true);
        $hoursField.parent().find('.option').text(hour);
        
        $minutesField.find('option[value=' + min + ']').prop('selected', true);
        $minutesField.parent().find('.option').text(min);
    };

    AddCustomWorkout.updateDropdown = function () {

        var value = $(this).val();
        console.log(value);
        var label = $(this).parent().find('.option');

        if ($(this).attr('data-type') === 'month') {
            value = $(this).find('option:selected').text();
        }

        if ($(this).attr('data-type') === 'unit') {
            value = $(this).find('option:selected').text();
        }

        if (value !== 'select activity') {
            if ($(this).attr('data-type') === 'activities') {
                $hiddenFieldSet.addClass('active');
                console.log('drop', $(this).find('option:selected'));
                AddCustomWorkout.setUpHiddenFields($(this).find('option:selected'));
            }

        } else {

            $hiddenFieldSet.removeClass('active');

        }

        label.html(value);


    };

    AddCustomWorkout.setUpHiddenFields = function ($option) {

        var showDistance = $option.data('distance'),
            showName = $option.data('name'),
            showNotes = $option.data('notes'),
            showTrainer = $option.data('trainer');

        // Reset hidden fields.
        $('#distance-holder').addClass('hidden');
        $('#distance-type-holder').addClass('hidden');
        $('#custom-nameHolder').addClass('hidden');
        $('#workout-notes').addClass('hidden');
        $('#instructor-holder').addClass('hidden');
        $('#calories-holder').removeClass('half').addClass('full');
        
        // Show accordingly based on pulled data.
        if (showDistance && showDistance === true) {
            $('#distance-holder').removeClass('hidden');
            $('#distance-type-holder').removeClass('hidden');
            $('#calories-holder').removeClass('full').addClass('half');
        }

        if (showName && showName === true) {
            $('#custom-nameHolder').removeClass('hidden');
        }

        if (showNotes && showNotes === true) {
            $('#workout-notes').removeClass('hidden');
        }

        if (showTrainer && showTrainer === true) {
            $('#instructor-holder').removeClass('hidden');
            $('#calories-holder').removeClass('full').addClass('half');
        }

    };

    AddCustomWorkout.onlyNums = function () {
        //prevent user from typing letters into numbers field
        //this.value = this.value.replace(/[^0-9\.]/g, '');
        if (this.id === 'workoout-distance') {
            this.value = this.value.replace(/[^0-9\.]/g, '');
            if (this.value === '.') {
                this.value = '';
            }
        } else {
            this.value = this.value.replace(/\D/g, '');
        }
    };

    AddCustomWorkout.toggleClick = function (e) {
        e.preventDefault();
        $toggle.toggleClass('on').toggleClass('off');
    };

    AddCustomWorkout.renderDurationMobile = function (e) {
        e.preventDefault();
        $(this).find('span').removeClass('active');
        $('.workout-duration-other').addClass('is-hidden');
        var val = $(e.target).attr('class');
        if (val !== 'duration-radio') {
            $(e.target).addClass('active');
        }
        if (val === 'other') {
            $('.workout-duration-other').removeClass('is-hidden');
        }
    };

    AddCustomWorkout.getDurationVal = function () {
        if ($('.duration-holder.is-desktop').is(':visible') && !$('.duration-holder.is-desktop').is(':hidden')) {
            return $workoutDuration.val() !== '' ? $workoutDuration.val() : false;
        } else if ($('.duration-holder.is-mobile').is(':visible') && !$('.duration-holder.is-mobile').is(':hidden')) {
            if ($('.duration-holder.is-mobile').find('span.minuteTab').hasClass('active')) {
                return $('.duration-holder.is-mobile').find('span.active').data('durationVal');
            } else if ($('.duration-holder.is-mobile').find('span.other').hasClass('active')) {
                return $('#workout-duration-mobile').val() !== '' ? $('#workout-duration-mobile').val() : false;
            } else {
                return false;
            }
        }
    };

    AddCustomWorkout.validateData = function () {
        console.log('VALIDATE');
        var failedFields = 0;

        if (AddCustomWorkout.getDurationVal() === false) {
            $('.duration-holder').addClass('error');
            failedFields++;
        } else {
            $('.duration-holder').removeClass('error');
        }

        if ($activitiesField.val() === 'select activity') {
            $activitiesField.parent().parent().addClass('error');
            failedFields++;
        } else {
            $activitiesField.parent().parent().removeClass('error');

        }
        
        if (failedFields === 0) {
            AddCustomWorkout.collectData();
        }
    };

    AddCustomWorkout.collectData = function () {
        var $option = $('[data-type="activities"]').find('option:selected'),
            showDistance = $option.data('distance'),
            showNotes = $option.data('notes'),
            showTrainer = $option.data('trainer');

        console.log('COLLECT DATA');
        _collectedData.workoutName = $activitiesField.val().toLowerCase() === 'custom' ? ($customNameField.val() !== '' ? $customNameField.val() : $activitiesField.val()) : $activitiesField.val();//$activitiesField.val();
        _collectedData.startDate = AddCustomWorkout.getDateString();
        _collectedData.endDate = AddCustomWorkout.getWorkoutEnd(_collectedData.startDate);
        _collectedData.workoutCategory = $activitiesField.val().replace(/,/g, '').replace(/ /g, '').toLowerCase() === 'custom' ? 'CustomEqCustomWorkout' : $activitiesField.val().replace(/,/g, '').replace(/ /g, '');//$activitiesField.val().replace(/,/g, '').replace(/ /g, '');
        _collectedData.calories = $caloriesField.val();

        if (showDistance) {
            _collectedData.distance = $distanceField.val();
        } else {
            _collectedData.distance = null;
        }

        if (!$('#distance-type-holder').hasClass('hidden')) {
            _collectedData.distanceUnit = $distanceUnitField.val();
        }
        if (showNotes) {
            _collectedData.notes = $notesField.val();
        } else {
            _collectedData.notes = null;
        }

        _collectedData.timezone = '';

        if (showTrainer) {
            _collectedData.trainerName = $instructorField.val();
        } else {
            _collectedData.trainerName = null;
        }

        AddCustomWorkout.saveData();

        console.log(_collectedData);

    };

    AddCustomWorkout.getDateString = function () {
        var day = $dayField.val();
        var month = $monthField.val();
        var year = $yearField.val();
        var hour = $hoursField.val();
        var minute = $minutesField.val();
        var isPM = $toggle.hasClass('off') ? true : false;

        hour = hour.replace(/^0+/, '');
        if (!isPM) {
            if (hour === '12') {
                hour = '0';
            }
        } else {
            if (parseInt(hour, 10) < 12) {

                hour = parseInt(hour, 10);
                hour = (hour + 12);
            }
        }

        function padzero(n) {
            return n < 10 ? '0' + n : n;
        }

        function toISOString() {
            return year + '-' + padzero(month) + '-' + padzero(day) + 'T' + padzero(hour) + ':' + minute + ':00:00';
        }

        return toISOString();

    };

    AddCustomWorkout.calculateDuration = function (start, end) {

        //lets calculate the duration of the loaded workout
        //we need to take the end and start date and return the
        //total minutes between the two

        //start = start.substring(0, start.length - 1);
        //end = end.substring(0, end.length - 1);
        var diffMins = moment(end).diff(start, 'minutes');
        console.log(start, end);

        return diffMins;

    };

    AddCustomWorkout.getWorkoutEnd = function (start) {
        //console.log(start + ':::' + start.substring(0, start.length - 3));

        //TODO: workout duration here -->
        var duration = parseInt(AddCustomWorkout.getDurationVal(), 10);
        start = start.substring(0, start.length - 3);
        start =  moment(start).add(duration, 'minutes').format();
        start = start.substring(0, start.length - 6) + ':00';
        //console.log('NEW ::', start);
        return start;

    };

    AddCustomWorkout.renderWorkouts = function () {
        var thisMany = _workoutObjects.length;
        var options = '';
        var i = 0;

        for (; i < thisMany; i += 1) {
            var thisObj = _workoutObjects[i];
            options += '<option data-is-ocr="' + !!thisObj.isOcrWorkout + '" data-is-custom-workout="' + !!thisObj.isCustomWorkout + '" data-distance="' + thisObj.displayDistanceInput + '" data-calories="' + thisObj.displayCaloriesInput + '" data-name="' + thisObj.displayNameInput + '" data-notes="' + thisObj.displayNotesInput + '" data-trainer="' + thisObj.displayTrainerInput + '" value="' + thisObj.name + '">' + thisObj.name + '</option>';
        }

        $activitiesField.append(options);

        if (_editMode) {
            AddCustomWorkout.getWorkoutObject();
        }

    };

    AddCustomWorkout.parseLoadedStartDate = function (start) {
        //console.log('ORIGINAL :: ', start);
        //start = '2013-02-05T01:59:00';
        //start = start.substring(0, start.length - 1);
        //console.log('NEW ::      ', start);

        function padzero(n) {
            return n < 10 ? '0' + n : n;
        }

        var correctHour =  moment(start).hours();
        var correctMinute = moment(start).minute();

        if (correctHour > 11) {
            console.log('correctHour :: ', correctHour);
            $toggle.toggleClass('on').toggleClass('off');
            correctHour = (correctHour - 12);

        }
        correctMinute = padzero(correctMinute);
        correctHour = padzero(correctHour);

        var dateObj = {
            day: moment(start).date(),
            month: moment(start).month() + 1,
            year: moment(start).year(),
            hour: correctHour,
            minute: correctMinute
        };

        console.log(dateObj);
        return dateObj;
    };

    AddCustomWorkout.populateWorkoutFields = function () {

        var duration = AddCustomWorkout.calculateDuration(_collectedData.startDate, _collectedData.endDate);
        var loadedStartDateObj = AddCustomWorkout.parseLoadedStartDate(_collectedData.startDate);

        // If it is a custom category, show "Custom" on the dropdown. Fixes DPLAT 4953
        if (_collectedData.workoutCategory === 204 && _collectedData.workoutSubCategoryId === 17) {
            _collectedData.workoutCustomName = _collectedData.workoutName;
            _collectedData.workoutName = 'Custom';
            $activitiesField.val(_collectedData.workoutName);
            $activitiesField.parent().find('.option').html(_collectedData.workoutName);
        } else {
            $activitiesField.val(_collectedData.workoutName);
            $activitiesField.parent().find('.option').html(_collectedData.workoutName);

            // for OCR, remove the options that are not ocr
            if (_collectedData.eventType === 'OCR') {
                _isOcrWorkout = true;
                $activitiesField.find('[data-is-ocr="false"]').remove();
            } else {
                $activitiesField.find('[data-is-custom-workout="false"]').remove();
            }
        }

        if (_collectedData.workoutCustomName) {
            $customNameField.val(_collectedData.workoutCustomName);
        }

        $hiddenFieldSet.addClass('active');
        AddCustomWorkout.setUpHiddenFields($activitiesField.find('option:selected'));
        $distanceField.val(_collectedData.distance);
        $distanceUnitField.find('[data-unit="' + _collectedData.distanceUnit + '"]').attr('selected', true);
        $distanceUnitField.trigger('change');

        if ($('.duration-holder.is-desktop').is(':visible') && !$('.duration-holder.is-desktop').is(':hidden')) {
            $workoutDuration.val(duration);
        } else if ($('.duration-holder.is-mobile').is(':visible') && !$('.duration-holder.is-mobile').is(':hidden')) {
            var checkClass = false;
            $('.duration-holder.is-mobile span.minuteTab').each(function () {
                if ($(this).data('durationVal') === duration) {
                    $(this).addClass('active');
                    checkClass = true;
                }
            });
            if (checkClass !== true) {
                $('.duration-holder.is-mobile span.other').addClass('active');
                $('.workout-duration-other').removeClass('is-hidden');
                $('.workout-duration-other input').val(duration);
            }
        }

        $notesField.val(_collectedData.notes);
        $dayField.val(loadedStartDateObj.day);
        $daylabel.html(loadedStartDateObj.day);
        $monthField.val(loadedStartDateObj.month);
        $monthLabel.html(loadedStartDateObj.month);
        $yearField.val(loadedStartDateObj.year);
        $yearLabel.html(loadedStartDateObj.year);
        $caloriesField.val(_collectedData.calories);
        $instructorField.val(_collectedData.trainerName);

        var hour = parseInt(loadedStartDateObj.hour, 10);

        console.log('HOUR :: ' + hour);

        if (hour === 0) {
            hour = '12';
        }

        if (hour < 10) {
            hour = '0' + hour;
        }

        $hoursField.val(hour);
        $hoursField.parent().find('.option').html(hour);
        $minutesField.val(loadedStartDateObj.minute);
        $minutesField.parent().find('.option').html(loadedStartDateObj.minute);

        AddCustomWorkout.updateCountdown();
    };


    AddCustomWorkout.saveData = function () {

        console.log('SAVE!');
        errorHandler.showLoader();
        var ENDPOINT;
        var METHOD;
        if (!_editMode) {
            ENDPOINT = APIEndpoint26 + '/me/workouts/custom-workout';
            METHOD = 'POST';
        } else {
            //pass the OcrWorkout 
            ENDPOINT = APIEndpoint26 + '/me/workouts/' + _workoutID + '/' + _isOcrWorkout + '/custom-workout';
            METHOD = 'PUT';
        }

        $.ajax({
            type: METHOD,
            url: ENDPOINT,
            contentType: 'application/json',
            dataType: 'json',
            xhrFields: { 'withCredentials': true },
            data : JSON.stringify(_collectedData)
        }).done(function (data) {
            console.log('saveData', data);

           // var id = data.workout.id;
            console.log('[ADD CUSTOM WORKOUT OK]', data.workout.id);
            errorHandler.hideLoader();

            //Once the workout has been saved we
            //need to move the user to the activity page
            //we tried to do this via the Router
            //unfortunately this app and the Activity app
            //do not share the same Router.
            //we had to use window.location instead. Multiple solutions were tried first
            //window.location.href = '/activity';

            //Maybe this should go back to the workouts page now?
            window.location.href = '/activity/workouts/' + data.workout.id;

            //Router does not take me there, just adds the url to the address bar.
            //App.Router.navigate('/activity', {trigger: true});

        }).fail(function (d) {
            console.log('server error', d.responseJSON);
            errorHandler.showError();
        }).always(function () {
            errorHandler.hideLoader();
        });

    };


    AddCustomWorkout.getWorkouts = function () {

        //This gets all the different types of
        //workouts option choices

        console.log('GETTING WORKOUTS!');
        errorHandler.showLoader();
        var ENDPOINT = APIEndpoint26 + '/workouts/categories',
            ENDPOINT_UOM = APIEndpoint26 + '/me/profile/unitofmeasure';

        $.when(
        $.ajax({
            type: 'GET',
            url: ENDPOINT_UOM,
            contentType: 'application/json',
            dataType: 'json',
            xhrFields: { 'withCredentials': true }
        }),
        $.ajax({
            type: 'GET',
            url: ENDPOINT,
            contentType: 'application/json',
            dataType: 'json',
            xhrFields: { 'withCredentials': true }
        })
        ).done(function (umodata, workoutdata) {
            console.log(umodata[0], workoutdata[0]);

            var data = [],
              distanceUnit = 'miles';

            workoutdata[0].forEach(function (category) {
                category.workoutSubCategories.forEach(function (subcat) {
                    subcat.id = subcat.subCategoryId;
                    subcat.name = subcat.subCategoryName;
                    data.push(subcat);
                });
            });

            if (umodata[0].unitOfMeasure === 'Metric') {
                distanceUnit = 'km';
            }

            $distanceUnitField.find('[data-unit="' + distanceUnit + '"]').attr('selected', true);
            $distanceUnitField.trigger('change');

            //console.log('[RECEIVED WORKOUTS]', data);
            _workoutObjects =  data;
            errorHandler.hideLoader();
            AddCustomWorkout.renderWorkouts();

        }).fail(function () {
            errorHandler.showError();
        }).always(function () {
            errorHandler.hideLoader();
        });

    };

    AddCustomWorkout.getWorkoutObject = function () {

        //Get the workout object. In Edit mode
        //using the workoutID param

        var ENDPOINT = APIEndpoint26 + '/me/workouts/' + _workoutID + '/detail';
        errorHandler.showLoader();

        $.ajax({
            type: 'GET',
            url: ENDPOINT,
            contentType: 'application/json',
            dataType: 'json',
            xhrFields: { 'withCredentials': true }
        }).done(function (data) {

            console.log('[RECEIVED WORKOUT]', data);
            errorHandler.hideLoader();
            var workout = data.workout;
            _collectedData.workoutName = workout.name;
            _collectedData.eventType = workout.eventType;
            _collectedData.startDate = workout.startLocal;
            _collectedData.endDate = workout.endLocal;
            _collectedData.workoutCategory = workout.workoutCategoryId;
            _collectedData.workoutSubCategoryId = workout.workoutSubCategoryId;
            _collectedData.calories = workout.totalCalories;
            _collectedData.distance = workout.totalDistance;
            _collectedData.distanceUnit = workout.distanceUnit;
            _collectedData.notes = workout.notes;
            _collectedData.timezone = workout.localTimeZone;
            _collectedData.trainerName = workout.trainerName;

            AddCustomWorkout.populateWorkoutFields();

        }).fail(function (d) {
            console.log('server error', d.responseJSON);
            errorHandler.showError();
        }).always(function () {
            errorHandler.hideLoader();
        });

    };

    AddCustomWorkout.cancel = function (e) {
        e.preventDefault();
        window.location.href = '/activity#WORKOUTS';
        // if (!_editMode) {
        //     window.location.href = '/activity#workouts';
        // } else {
        //     window.location.href = '/activity/workouts/' + _workoutID;
        // }
    };

}(window.App));