// full-bleed ScheduleEquifit
(function (global, App) {
    'use strict';

    /* global debug, APIEndpoint */

    var ScheduleEquifit = App.Pages.ScheduleEquifit = {},
        $container = $('.page'),
        self;

    ScheduleEquifit.Form = {
        bind: function () {
            debug('[ScheduleEquifit] binding events');

            var that = this;
            $('#ContactOptions option[value="Twitter"]').remove();

            this.form.on('submit', function (e) {
                e.preventDefault();
                that.saveForm();
                window.track('regScheduleEquifitSubmit');
                debug('[regScheduleEquifitSubmit] regScheduleEquifitSubmit event');
            });

            $(document).find('.highlight').on('click', function () {
                window.track('regScheduleEquifitCancel');
                debug('[regScheduleEquifitCancel] regScheduleEquifitCancel event');
            });

            $('.question #anytime', this.form).on('change', function () {
                var dateTimeCheckbox = $('.question .datetime-select', this.form);
                if ($(this).is(':checked')) {
                    dateTimeCheckbox.addClass('hidden');
                } else {
                    dateTimeCheckbox.removeClass('hidden');
                }
            });
        },
        saveForm: function () {
            var phoneNumber = $('input[type=tel]', this.form),
                email = $('input[type=email]', this.form),
                Validators = {
                    email: function (value) {
                        return (/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i).test(value);
                    },
                    usPhoneNumber: function (value) {
                        return (/[01]?[- .]?(\([2-9]\d{2}\)|[2-9]\d{2})[- .]?\d{3}[- .]?\d{4}/).test(value);
                    },
                    ukPhoneNumber: function (value) {
                        return (/\(?(?:(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?\(?(?:0\)?[\s-]?\(?)?|0)(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}|\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4}|\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3})|\d{5}\)?[\s-]?\d{4,5}|8(?:00[\s-]?11[\s-]?11|45[\s-]?46[\s-]?4\d))(?:(?:[\s-]?(?:x|ext\.?\s?|\#)\d+)?)/).test(value);
                    }
                },
                error = '';

            var isPhoneNumber = (window.user.SourceSystem === 1 || window.user.SourceSystem === 5) ? Validators.usPhoneNumber(phoneNumber.val()) : Validators.ukPhoneNumber(phoneNumber.val());
            
            if (email.length > 0) {
                if (email.val() === '' || !Validators.email(email.val())) {
                    email.addClass('error');
                    error = 'Please check your email.';
                } else {
                    email.removeClass('error');
                }
            } else if (phoneNumber.length > 0) {
                if (phoneNumber.val() === '' || !isPhoneNumber) {
                    phoneNumber.addClass('error');
                    error = 'Please check your Phone number.';
                } else {
                    phoneNumber.removeClass('error');
                }
            }

            if (this.form.find('.error').length > 0) {
                ScheduleEquifit.dispayError(error);
                return;
            }
            
            $('form .is-error').addClass('hidden');

            var data = {
                facilityId: $('.club select option:selected', this.form).data('facility-id'),
                email: email.length > 0 ? email.val() : '',
                phoneNumber: phoneNumber.length > 0 ? phoneNumber.val() : '',
                comments: $('textarea[id=message]', this.form).val(),
                isAnytime: false,
                preferredDay: '',
                preferredTime: '',
                refreshCache: true
            };
            
            var anytime = $('input[id=anytime]', this.form).prop('checked');
            
            if (anytime) {
                data.isAnytime = true;
            } else {
                data.preferredDay = $('select[id=DayOptions]', this.form).val();
                data.preferredTime = $('select[id=TimeOptions]', this.form).val();
            }

            var $input = $('form').find('input[type="submit"]');

            $input.val('Loading...').attr('disabled', true);

            var endPoint = APIEndpoint + '/personal-training/schedule-equifit-assessment';
            $.ajax({
                url: endPoint,
                contentType: 'application/json',
                data: JSON.stringify(data),
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                }
            })
            .done(function (response) {
                debug('ScheduleEquifit RESPONSE', response);

                self.form.hide();
                self.$thankContainer.removeClass('hidden');
                
                $('html, body').animate({
                    scrollTop: self.$thankContainer.offset().top - 150
                }, 500);
            })
            .fail(function () {
                debug('Server Error');
                
                self.form.hide();
                self.$errorContainer.removeClass('hidden');
                
                $('html, body').animate({
                    scrollTop: self.$errorContainer.offset().top - 150
                }, 500);
            });
        },
        init: function () {
            self = this;
            this.form = $('form.join-schedule-form');
            this.$thankContainer = $('.schedule-equifit-thanks');
            this.$errorContainer = $('.schedule-equifit-error');
            this.bind();
        }
    };

    ScheduleEquifit.dispayError = function (error) {
        var errorEl = $('form .is-error');
        /*
        var errorList = {
            'max'
        };
        */
        errorEl.text(error).removeClass('hidden');
        $('html, body').animate({
            scrollTop: errorEl.offset().top - 150
        }, 500);
    };

    ScheduleEquifit.init = function () {
        debug('[ScheduleEquifit] Init');
        $container.addClass('full-bleed schedule-equifit');
        ScheduleEquifit.Form.init();
    };

}(window, window.App));
