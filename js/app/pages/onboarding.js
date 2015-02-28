// full-bleed onboarding
(function (global, App) {
    'use strict';

    /* global debug, APIEndpoint, _ */

    var OnBoarding = App.Pages.OnBoarding = {},
        $container = $('.page');

    OnBoarding.Q1 = {
        bind: function () {
            debug('[onboarding] binding Q1 events');
            var that = this;
            $('#ContactOptions option[value="Twitter"]').remove();
            this.form.on('submit', function (e) {
                e.preventDefault();
                that.saveForm();
                window.track('regOnboardSubmit');
                debug('[regOnboardSubmit] regOnboardSubmit event');
            });
            $(document).find('.highlight').on('click', function () {
                window.track('regOnboardCancel');
                debug('[regOnboardCancel] regOnboardCancel event');
            });
            $(document).find('#onboard-skipQuestion').on('click', function () {
                window.track('regOnboardSkip');
                debug('[regOnboardSkip] regOnboardSkip event');
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
                OnBoarding.dispayError(error);
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
                data.preferredDay =  $('select[id=DayOptions]', this.form).val();
                data.preferredTime = $('select[id=TimeOptions]', this.form).val();
            }

            var $input = $('form').find('input[type="submit"]');

            $input.data('old-copy', $input.val());
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
                debug('ONBOARDING RESPONSE', response);
                OnBoarding.redirect();
            })
            .fail(function () {
                debug('Server Error');
                var $input = $('form').find('input[type="submit"]');
                $input.val($input.data('old-copy')).attr('disabled', false);
            });
        },
        init: function () {
            this.form = $('form.join-schedule-form');
            this.bind();
        }
    };

    OnBoarding.Q2 = {
        bind: function () {
            debug('[onboarding] binding Q2 events');
            var that = this;
            this.form.on('submit', function (e) {
                e.preventDefault();
                that.saveForm();
                window.track('regOnboardSubmit');
                debug('[regOnboardSubmit] regOnboardSubmit event');
            });
            $(document).find('.highlight').on('click', function () {
                window.track('regOnboardCancel');
                debug('[regOnboardCancel] regOnboardCancel event');
            });
            $(document).find('#onboard-skipQuestion').on('click', function () {
                window.track('regOnboardSkip');
                debug('[regOnboardSkip] regOnboardSkip event');
            });
        },
        saveForm: function () {
            var qId = $('input[name=questionId]', this.form).val(),
                aId = $('input[name=answer]', this.form).val(),
                data;

            data = {
                questionId: qId,
                answerId: aId,
                answerText: '',
                isSelected: true
            };

            OnBoarding.updateAnswers(data, OnBoarding.redirect, true);
        },
        init: function () {
            this.form = $('form');
            this.bind();
        }
    };

    OnBoarding.Q3 = {
        bind: function () {
            debug('[onboarding] binding Q3_Q4 events');
            var self = this,
                otherAnswer = $('textarea[name=otherAnswerText]', self.form);

            $(document).find('.highlight').on('click', function () {
                window.track('regOnboardCancel');
                debug('[regOnboardCancel] regOnboardCancel event');
            });
            $(document).find('#onboard-skipQuestion').on('click', function () {
                window.track('regOnboardSkip');
                debug('[regOnboardSkip] regOnboardSkip event');
            });

            self.form.on('submit', function (e) {
                e.preventDefault();
                self.saveForm();
                window.track('regOnboardSubmit');
                debug('[regOnboardSubmit] regOnboardSubmit event');
            });

            $('label.check-selector', self.form).on('click', function () {
                self.toggleCheck($(this));
            });

            if (otherAnswer.length) {
                otherAnswer.on('change', function () {
                    self.toggleAnswer(otherAnswer);
                });
            }
        },
        toggleAnswer: function (el) {
            if (el.val() !== '') {
                if (this.checkCount < this.maxSelections) {
                    this.checkCount++;
                }
            } else {
                if (this.checkCount > 0) {
                    this.checkCount--;
                }
            }

            this.toggleSelections();
        },
        toggleCheck: function (el) {
            var check = el.find('input[type=checkbox]');

            if (this.maxSelections === 1) {
                $('label.check-selector input[type=checkbox]').each(function () {
                    if ($(this).val() !== check.val()) {
                        $(this).prop('checked', false);
                        $(this).parents('label.check-selector').removeClass('checked');
                    }
                });
                if (check.not(':checked')) {
                    el.removeClass('checked');
                    if (this.checkCount > 0) {
                        this.checkCount--;
                    }
                }
            }

            if (check.is(':checked') && this.checkCount < this.maxSelections && !el.hasClass('checked')) {
                el.addClass('checked');
                this.checkCount++;
            } else if (el.hasClass('checked')) {
                el.removeClass('checked');
                if (this.checkCount > 0) {
                    this.checkCount--;
                }
            }

            this.toggleSelections();
        },
        toggleSelections: function () {
            if (this.checkCount === this.maxSelections) {
                if (this.maxSelections !== 1) {
                    $('label.check-selector input[type=checkbox]').not(':checked').each(function () {
                        $(this).prop('disabled', true);
                    });
                }
                if ($('textarea[name=otherAnswerText]', this.form).val() === '') {
                    $('textarea[name=otherAnswerText]', this.form).prop('disabled', true);
                }
            } else if (this.checkCount < this.maxSelections) {
                $('label.check-selector input[type=checkbox][disabled]').each(function () {
                    $(this).prop('disabled', false);
                });
                if ($('textarea[name=otherAnswerText]', this.form).val() === '') {
                    $('textarea[name=otherAnswerText]', this.form).prop('disabled', false);
                }
            }
        },
        loadForm: function () {
            var qId = parseInt($('input[name=questionId]', this.form).val(), 10),
                answers = OnBoarding.getAnswerByQID(qId),
                answersId = [],
                self = this;


            if (answers) {
                answersId = _.uniq(_.flatten(answers, 'answerId'));
                $.each(answersId, function (index, answer) {
                    if (self.checkCount < self.maxSelections) {
                        var checkbox = $('input[value=' + answer + ']', self.form);
                        checkbox.prop('checked', true);
                        checkbox.parent('label.check-selector').addClass('checked');
                        self.checkCount++;
                        debug('LOADED FORM', answers[index]);
                    }
                });
            }

            this.toggleSelections();
        },
        saveForm: function () {
            var qId = parseInt($('input[name=questionId]', this.form).val(), 10),
                answers = $('input[name=answers]:checked', this.form),
                otherAnswer = {
                    id: $('input[name=otherAnswerId]', this.form).val(),
                    text: $('textarea[name=otherAnswerText]', this.form).val(),
                    isDefault: false
                },
                totalAnswersCount = answers.length,
                data = {
                    questions: []
                },
                dataQuestion = {
                    questionId: qId,
                    answers: []
                },
                sendData = true,
                error;

            if (otherAnswer.id !== '' && otherAnswer.text !== '') {
                totalAnswersCount++;
            }

            if (totalAnswersCount !== 0 && totalAnswersCount <= this.maxSelections) {
                if (answers.length === 0 && otherAnswer.id && otherAnswer.text !== '') {
                    dataQuestion.answers.push({
                        answerId: otherAnswer.id,
                        answerText: otherAnswer.text,
                        isSelected: true
                    });
                } else if (answers.length === 1) {
                    dataQuestion.answers.push({
                        answerId: answers.val(),
                        isSelected: true
                    });
                } else if (answers.length > 1) {
                    $.each(answers, function (index, answer) {
                        dataQuestion.answers.push({
                            answerId: $(answer).val(),
                            isSelected: true
                        });
                    });

                    if (!otherAnswer.isDefault && otherAnswer.id) {
                        dataQuestion.answers.push({
                            answerId: otherAnswer.id,
                            answerText: otherAnswer.text,
                            isSelected: true
                        });
                    }
                } else {
                    sendData = false;
                    error = 'You need to select at least one option.';
                    OnBoarding.dispayError(error);
                    debug('VALIDATION ERROR', totalAnswersCount, this.maxSelections);
                }

                if (sendData) {
                    data.questions.push(dataQuestion);

                    $('form .is-error').addClass('hidden');
                    OnBoarding.updateAnswers(data, OnBoarding.redirect);
                }

            } else if (totalAnswersCount === 0) {
                error = 'You need to select at least one option.';
                OnBoarding.dispayError(error);
                debug('VALIDATION ERROR', totalAnswersCount, this.maxSelections);
            } else {
                error = this.maxSelections === 1 ? 'option' : 'options';
                error = 'You can\'t select more than ' + this.maxSelections + ' ' + error + '.';
                OnBoarding.dispayError(error);
                debug('VALIDATION ERROR', totalAnswersCount, this.maxSelections);
            }
        },
        init: function () {
            this.form = $('form');
            this.maxSelections = parseInt($('input[name=maxSelections]', this.form).val(), 10);
            this.checkCount = 0;
            this.loadForm();
            this.bind();
        }
    };

    OnBoarding.Q4 = OnBoarding.Q3;

    OnBoarding.Q5 = {
        bind: function () {
            debug('[onboarding] binding Q5 events');
            var that = this;
            this.form.on('submit', function (e) {
                e.preventDefault();
                that.saveForm();
                window.track('regOnboardSubmit');
                debug('[regOnboardSubmit] regOnboardSubmit event');
            });
            $(document).find('.highlight').on('click', function () {
                window.track('regOnboardCancel');
                debug('[regOnboardCancel] regOnboardCancel event');
            });
            $(document).find('#onboard-skipQuestion').on('click', function () {
                window.track('regOnboardSkip');
                debug('[regOnboardSkip] regOnboardSkip event');
            });
        },
        loadForm: function () {
            // For each fieldset (question)
            this.form.find('fieldset').each(function () {

                // If no radio inside fieldset, break out.
                if ($(this).find('input[type="radio"]').length === 0) {
                    return;
                }

                // Prepopulate based on old answers
                var qId = $(this).find('input[type="radio"]').attr('name').match(/\d$/)[0];

                var answers = OnBoarding.getAnswerByQID(qId);

                if (answers) {
                    answers.forEach(function (answer) {
                        $('input[value=' + answer.answerId + ']').prop('checked', answer.isSelected).trigger('change');
                    });
                }

            });
        },
        saveForm: function () {
            var data = {
                    questions: []
                },
                submit = true,
                error;

            // For each fieldset (question)
            this.form.find('fieldset').each(function () {

                // If no radio inside fieldset, break out.
                if ($(this).find('input[type="radio"]').length === 0) {
                    return;
                }

                var answers = [];

                // Get Radio status
                $(this).find('input[type="radio"]:checked').each(function () {
                    answers.push({
                        answerId: $(this).val(),
                        isSelected: $(this).is(':checked')
                    });
                });

                data.questions.push({
                    questionId: $(this).find('input[type="radio"]').attr('name').match(/\d$/)[0],
                    answers: answers
                });

                if (answers.length === 0) {
                    submit = false;
                }

            });

            if (submit) {
                OnBoarding.updateAnswers(data, OnBoarding.redirect);
            } else {
                error = 'You need to answer all the questions.';
                OnBoarding.dispayError(error);
            }

        },
        init: function () {
            this.form = $('form');
            this.bind();
            this.loadForm();
        }
    };
    OnBoarding.Q6 = {
        init: function () {
            $(document).find('.highlight').on('click', function () {
                window.track('regOnboardCancel');
                debug('[regOnboardCancel] regOnboardCancel event');
            });
        }
    };

    OnBoarding.updateAnswers = function (data, callback, singleAnswer) {
        var endPoint;

        if (singleAnswer) {
            endPoint = APIEndpoint + '/personalization/onboarding/questions/me/updateanswer';
        } else {
            endPoint = APIEndpoint + '/personalization/onboarding/questions/me/update';
        }
        debug('SENDING DATA', data);

        var $input = $('form').find('input[type="submit"]');

        $input.data('old-copy', $input.val());
        $input.val('Loading...').attr('disabled', true);

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
            debug('ONBOARDING RESPONSE', response);
            callback();
        })
        .fail(function () {
            debug('Server Error');
            var $input = $('form').find('input[type="submit"]');
            $input.val($input.data('old-copy')).attr('disabled', false);
        });
    };

    OnBoarding.getAnswerByQID = function (aID) {
        var response = false;
        if (OnBoarding.data) {
            $.each(OnBoarding.data, function (index, question) {
                if (question.questionId === aID) {
                    response = question.answers;
                }
            });
        }
        return response;
    };

    OnBoarding.dispayError = function (error) {
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

    OnBoarding.redirect = function () {
        // Grab the next page from the current form.
        var url = $('form input[name=nextPage]').val();

        // Redirect if any.
        if (url) {
            window.location = url;
        }
    };
    //this will start the onboarding flow
    OnBoarding.start = function (guid) {
        // To Do perhaps pass in access token if possible from this call
        debug('[OnBoarding] guid', guid);
        if (window.EQ.Helpers.readCookie('from_ios') === 'true') {
            window.EQ.Helpers.tryFastAppSwitch();
        }
    };
    OnBoarding.init = function (step) {
        debug('[OnBoarding] Init at step', step);
        $container.addClass('full-bleed onboarding');
        $.ajax({
            url: APIEndpoint + '/personalization/onboarding/questions/me',
            contentType: 'application/json',
            data: { 'questionTypes': 'OnBoarding' },
            type: 'GET',
            xhrFields: {
                withCredentials: true
            }
        })
        .done(function (answers) {
            debug('ONBOARDING RESPONSE', answers);
            OnBoarding.data = answers.answeredQuestions;

            // Dynamic initialization of questions.
            if (step && OnBoarding['Q' + step]) {
                OnBoarding['Q' + step].init();
            }

            if (step === 'start') {
                $(document).find('#onboard-startBtn').on('click', function () {
                    window.track('regOnboardSubmit');
                });
                $(document).find('.highlight').on('click', function () {
                    window.track('regOnboardCancel');
                });
            }

        })
        .fail(function () {
            debug('Server Error');
        });
    };

}(window, window.App));
