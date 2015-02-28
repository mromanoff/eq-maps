(function (global, App) {
    'use strict';

    /* global debug */
    var HELPERS = window.EQ.Helpers || {},
		Activate = App.Pages.Activate = {},
        $activateForm = $('.activate-user');

    Activate.init = function () {
        debug('[Activate] Init');
		Activate.setCookie();
        Activate.bind();
    };
	Activate.setCookie = function () {
		if (HELPERS.getQueryStringVariable('fromios') === 'true') {
			debug('[Activate] Cookie');
			HELPERS.createCookie('from_ios', true);
		}
		
	};
    Activate.bind = function () {
        var that = Activate;

        $activateForm.on('submit', function (e) {
            e.preventDefault();
            that.validateAndSubmit();
        });
    };

    Activate.validateAndSubmit = function () {
        if ($activateForm.data('publicMethods').isValid()) {
            $activateForm.data('publicMethods').sendAjaxRequest({
                'country': 'ActivateUser.Country',
                'barcode': 'ActivateUser.Barcode',
                'lastName': 'ActivateUser.LastName'
            },
            function (data) {
                // Create DOM Form.
                var $form = $('<form></form>');

                // ACTION and METHOD
                $form.attr('action', '/activate/signin').attr('method', 'POST');

                // From Service
                var $firstName = $('<input type="hidden"/>').attr('name', 'FirstName').val(data.firstName);
                var $email = $('<input type="hidden"/>').attr('name', 'Email').val(data.emailAddress);

                //From Current Form
                var $country = $('<input type="hidden"/>').attr('name', 'LastName').val($activateForm.find('input[name="ActivateUser.LastName"]').val());
                var $lastName = $('<input type="hidden"/>').attr('name', 'Country').val($activateForm.find('select[name="ActivateUser.Country"]').val());
                var $barcode = $('<input type="hidden"/>').attr('name', 'Barcode').val($activateForm.find('input[name="ActivateUser.Barcode"]').val());

                $form.append($country);
                $form.append($firstName);
                $form.append($lastName);
                $form.append($email);
                $form.append($barcode);

                // Fix for FF - form needs to be attached to the dom before submit()
                $form.css('display', 'none');
                $('body').append($form);

                //Submit
                
                $form.submit();

            });
        }
    };

} (window, window.App));