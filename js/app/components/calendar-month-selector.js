(function (global, App) {
    'use strict';

    /* global debug, EQ */

    /**
    * Component Init.
    */

    var CalendarMonthSelector = {};

    CalendarMonthSelector.init = function ($el) {
        var $mainCalendar = $('.main-calendar.is-desktop');

        $el.find('.next').on('click', function (e) {
            e.preventDefault();
            $mainCalendar.data('mainCalendar').goToNextMonth();
        });

        $el.find('.prev').on('click', function (e) {
            e.preventDefault();
            $mainCalendar.data('mainCalendar').goToPrevMonth();
        });

        // Set initial month and year
		App.Events.on('dateRangeUpdated', function () {
            updateHeaderWithCurrentDate();
        });
        
        
    };
	var updateHeaderWithCurrentDate = function () {
		var $mainCalendar = $('.main-calendar.is-desktop');
		if ($mainCalendar.data('mainCalendar')) {
			var fromDate = $mainCalendar.data('mainCalendar').getCurrentDataRange().fromDate,
				toDate = $mainCalendar.data('mainCalendar').getCurrentDataRange().toDate,
                dateStr;
				
            if (EQ.Helpers.user.getUserCountry() === 'US') {
                dateStr = fromDate.format('MMM DD') + ' - ' + toDate.format('MMM DD');
            } else {
                dateStr = fromDate.format('DD MMM') + ' - ' + toDate.format('DD MMM');
            }

			$('.main-calendar-header h3').text(dateStr);
		} else {
			setTimeout(updateHeaderWithCurrentDate, 500);
		}
	};

    App.Components['calendar-month-selector'] = function ($el) {
        debug('calendar-month-selector COMPONENT', $el);
        CalendarMonthSelector.init($el);
    };

} (window, window.App));
