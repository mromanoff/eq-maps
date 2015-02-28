(function (global, App) {
    'use strict';

    /* global APIEndpoint, debug, Crittercism */
    var SimpleForm = {};

    /**
    * Init Method for Simple Form Component.
    *
    * @param {Object} Form element. Cannot be null.
    * @methodOf SimpleForm
    * @return {Void}
    */
    SimpleForm.init = function ($el) {
        debug('[SimpleForm] ', SimpleForm);

        /**
        * Check preconditions
        */
        if (!$el) {
            throw new Error('Param missing ($el) on SimpleForm init method');
        }

        this.$el = $el;
        this.fields = {};

        // Bind public methods
        $el.data('publicMethods', this.publicMethods);

        console.log($._data($el, 'events'));

        $el.on('submit', function (e) {
            if ($el.data('publicMethods').isValid()) {
                // Submit the regular way.
                debug('SimpleForm] Valid Form!');
            } else {
                e.preventDefault();
            }
        });

        this.initFields();
    };

    /**
    * Init Method for Form Filds. It sets the validator object for each field.
    *
    * @methodOf SimpleForm
    * @return {Void}
    */
    SimpleForm.initFields = function () {
        var that = this;

        // Inputs + Selects
        this.$el.find('input, select').each(function () {
            that.fields[$(this).attr('name')] = new global.EQ.Validator($(this));
        });
    };

    /**
    * Exposed methods attached to the DOM data attributte. These can be 
    *   accessed globally.
    *
    * @fieldOf SimpleForm
    * @namespace
    */
    SimpleForm.publicMethods = {

        /**
        * Send Ajax request.
        *
        * @param {Object} dataMap. map between the data that must be sent 
        *   to the service and fields on the form. Cannot be null.
        * @param {Function} successCallback callback function executed when the data
        *   returns ok and don't have a 'data.error' field.
        * @methodOf SimpleForm
        */
        sendAjaxRequest: function (dataMap, successCallback) {
            var formData = this.getData(),
                formMethod = SimpleForm.$el.attr('method') || 'post',
                formAction = SimpleForm.$el.attr('action'),
                $submitButton = SimpleForm.$el.find(':submit'),
                $errorBox = SimpleForm.$el.find('.is-error'),
                buttonText = $submitButton.val(),
                buttonProccesingtext = 'Loading...',
                dataToSend = {};

            // Prepare data
            $.each(dataMap, function (name, fieldName) {
                dataToSend[name] = formData[fieldName];
            });

            // Button on processing state (disabled to avoid multiple submit triggerings)
            $submitButton.val(buttonProccesingtext)
                .attr('disabled', 'disabled');

            $.ajax(APIEndpoint + formAction, {
                data: dataToSend,
                type: formMethod,
                xhrFields: {
                    withCredentials: true
                }
            })
            .done(function (data, textStatus, jqXHR) {
                if (data.error || data.message) {
                    var errorMessage = data.error ? data.error.message : data.message;
                    debug('[FormSendAjaxRequest]' + errorMessage);
                    $submitButton.val(buttonText)
                        .removeAttr('disabled');
                    $errorBox.text(data.error.message).removeClass('hidden');
                } else {
                    debug('[FormSendAjaxRequest] OK');
                    $submitButton.val(buttonText)
                        .removeAttr('disabled');
                    $errorBox.text('').addClass('hidden');

                    // debug('[FormSendAjaxRequest CALLBACK]', successCallback);
                    if (successCallback) {
                        successCallback(data, textStatus, jqXHR);
                    }
                }
            })
            .fail(function (data) {
                try {
                    var response = data.responseJSON;
                    var errorMessage = response.error ? response.error.message : response.message;
                    $errorBox.text(errorMessage).removeClass('hidden');
                    $submitButton.val(buttonText)
                        .removeAttr('disabled');
                } catch (e) {
                    $submitButton.val(buttonText)
                        .removeAttr('disabled');
                    $errorBox.text('').addClass('hidden');
                    // Silently drop failure.
                    debug('[FormSendAjaxRequest] Error logged into Crittercism:', e, arguments);
                    Crittercism.logHandledException(e);

                }
            });
        },

        /**
        * Get all the form fields values in the following format: {name: value}
        *
        * @methodOf SimpleForm
        * @return {Object}
        */
        getData: function () {
            var values = {};

            $.each(SimpleForm.$el.serializeArray(), function (key, field) {
                values[field.name] = field.value;
            });

            return values;
        },

        /**
        * Check if the form is valid, looping through all the fields to check
        *   one by one.
        *
        * @methodOf SimpleForm
        * @return {Boolean}
        */
        isValid: function () {
            var isFormValid = true,
                fieldValidation = {},
                errorsList = [],
                $errorBox = SimpleForm.$el.find('.is-error');

            // First clear errors
            // TODO refactor error messages to use it as a component.
            $errorBox.text('').addClass('hidden');

            $.each(SimpleForm.fields, function (key, field) {
                fieldValidation = field.validate();
                if (!fieldValidation.isValid) {
                    isFormValid = false;
                    errorsList.push(fieldValidation.message);
                }
            });

            // If there is any errors, show them.
            if (errorsList.length > 0) {
                console.log(errorsList);
                $errorBox.html(errorsList.join('<br />')).removeClass('hidden');
                $('body, html').animate({scrollTop: $errorBox.offset().top - 130});
            }

            return isFormValid;
        }
    };

    App.Components['simple-form'] = function ($el) {
        SimpleForm.init($el);
    };

} (window, window.App));