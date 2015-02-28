(function (global, App) {
    'use strict';

    var Leads = App.Pages.Leads = {};
    var popupRef;

    Leads.POPUP_LEAD = 'POPUP LEAD';
    Leads.PAGE_LEAD = 'PAGE LEAD';
    Leads.ERROR = 'ERROR';

    /* 
        Common Function 
    */
    Leads.common = {
        scrollWindow: function (options) {
            switch (options.scrollFor) {
            case Leads.POPUP_LEAD:
                $('html, body').animate({
                    scrollTop: 0
                });
                break;
            case Leads.PAGE_LEAD:
                $('html, body').animate({
                    scrollTop: $('#schedule-a-visit').offset().top - $('[data-component="navigation"]').height() + 20
                });
                break;
            case Leads.ERROR:
                $('html, body').animate({
                    scrollTop: options.context.$('.error').offset().top - (options.whichLead === Leads.PAGE_LEAD ? $('[data-component="navigation"]').height() + 20 : 20)
                });
                break;
            }
        },

        fillRegionClubDropdown: function (options) {
            var regionDefaultText = 'Select a region',
                clubDefaultText1 = 'You must select a region first',
                clubDefaultText2 = 'Select a club',
                $regionDropdown = options.$region.find('select'),
                $clubDropdown = options.$club.find('select'),
                $regionsOption = '<option data-slug="">' + regionDefaultText + '</option>',
                club = {};

            $.each(global.allRegionsData, function (i, region) {
                if (region && region.SubRegions && region.SubRegions.length) {
                    var facilities = [];

                    $regionsOption += '<option data-slug="' + region.ShortName + '">' + region.Name + '</option>';

                    $.each(region.SubRegions, function (j, subregion) {
                        facilities = facilities.concat(subregion.Facilities);
                    });

                    club[region.Name] = facilities;

                } else {
                    $regionsOption += '<option data-slug="' + region.ShortName + '">' + region.Name + '</option>';
                    club[region.Name] = region.Facilities;
                }
            });

            //Populate the region select with the allRegionsData global variable.
            $regionDropdown.html($regionsOption);
            $clubDropdown.prepend('<option selected data-id="">' + clubDefaultText1 + '</option>');

            //On region change
            $regionDropdown.on('change', function () {
                var currentFacilities = club[$(this).val()],
                    $clubsOptions = '';

                if (currentFacilities) {
                    $.each(currentFacilities, function (i, facility) {
                        if (!(facility.IsAvailableOnline === false && facility.IsPresale === false)) {
                            $clubsOptions += '<option data-id="' + facility.Id + '">' + facility.ClubName + '</option>';
                        }
                    });

                    $clubDropdown.html($clubsOptions);
                    $clubDropdown.each(function () {
                        var options = $(this).children('option');
                        options.sort(function (optionA, optionB) {
                            return optionA.value.localeCompare(optionB.value);
                        });
                        $(this).empty().append(options);
                    });

                    $clubDropdown.prepend('<option selected data-id="">' + clubDefaultText2 + '</option>');
                    $clubDropdown.trigger('change');
                } else {
                    $clubDropdown.siblings('.option').html(clubDefaultText1);
                    $clubDropdown.html('<option selected data-id="">' + clubDefaultText1 + '</option>');
                }

            });

            //Trigger first change.
            $regionDropdown.trigger('change');
        },

        defaultRegionClubSelect: function (options) {
            var $regionDropdown = options.$region.find('select'),
                $clubDropdown = options.$club.find('select');

            if (window.currentClub) {
                //Check selectedRegion and default to that.
                if (window.selectedRegion) {
                    $regionDropdown.find('option').each(function (i, el) {
                        if ($(el).data('slug') === window.selectedRegion) {
                            $regionDropdown.prop('selectedIndex', i).trigger('change');
                        }
                    });
                }

                //Check if there is a currentClub
                if (window.currentClub) {
                    $clubDropdown.find('option').each(function (i, el) {
                        if ($(el).data('id') === +window.currentClub) {
                            $clubDropdown.prop('selectedIndex', i).trigger('change');
                        }
                    });
                }
            }
        },

        validateStep1: function (options) {

            //Validators
            var Validators = {
                email: function (value) {
                    return (/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i).test(value);
                },
                digits: function (value) {
                    return (/^\d+$/).test(value);
                },
                phone: function (value) {
                    return (/^[0-9\-()\s]*$/).test(value);
                },
                onlyAlphanumericAndSpaces: function (value) {
                    return (/^[a-zA-Z\s]+$/).test(value);
                }
            };

            //Remove all errors to-recheck.
            options.context.$('.error').removeClass('error');

            if (options.dom.$firstName.val().length < 1 || Validators.onlyAlphanumericAndSpaces(options.dom.$firstName.val()) === false) {
                options.dom.$firstName.addClass('error');
                options.dom.$firstName.closest('.control').siblings('.control-title').addClass('error');
            } else {
                options.dom.$firstName.removeClass('error');
                options.dom.$firstName.closest('.control').siblings('.control-title').removeClass('error');
            }

            if (options.dom.$lastName.val().length < 1 || Validators.onlyAlphanumericAndSpaces(options.dom.$lastName.val()) === false) {
                options.dom.$lastName.addClass('error');
                options.dom.$lastName.closest('.control').siblings('.control-title').addClass('error');
            } else {
                options.dom.$lastName.removeClass('error');
                options.dom.$lastName.closest('.control').siblings('.control-title').removeClass('error');
            }

            if (options.dom.$email.length === 1) {
                if (options.dom.$email.val().length < 3 || Validators.email(options.dom.$email.val()) === false) {
                    options.dom.$email.addClass('error');
                    options.dom.$email.closest('.control').siblings('.control-title').addClass('error');
                } else {
                    options.dom.$email.removeClass('error');
                    options.dom.$email.closest('.control').siblings('.control-title').removeClass('error');
                }
            }

            if (options.dom.$phone.val().length < 1) {
                options.dom.$phone.addClass('error');
                options.dom.$phone.closest('.control').siblings('.control-title').addClass('error');
            } else if (options.dom.$phone.val().length > 1 && Validators.phone(options.dom.$phone.val()) === true) {
                options.dom.$phone.removeClass('error');
                options.dom.$phone.closest('.control').siblings('.control-title').removeClass('error');
            } else {
                options.dom.$phone.removeClass('error');
                options.dom.$phone.closest('.control').siblings('.control-title').removeClass('error');
            }

            if (options.dom.$region.find('select option').filter(':selected').data('slug') === '') {
                options.dom.$region.addClass('error');
                options.dom.$region.closest('.control').siblings('.control-title').addClass('error');
            } else {
                options.dom.$region.removeClass('error');
                options.dom.$region.closest('.control').siblings('.control-title').removeClass('error');
            }

            if (options.dom.$club.find('select option').filter(':selected').data('id') === '') {
                options.dom.$club.addClass('error');
                options.dom.$club.closest('.control').siblings('.control-title').addClass('error');
            } else {
                options.dom.$club.removeClass('error');
                options.dom.$club.closest('.control').siblings('.control-title').removeClass('error');
            }
        },

        submitStep1: function (options) {
            options.e.preventDefault();

            var self = this;
            var $target = $(options.e.target);
            var ENDPOINT_URL = '/leads/step1';

            if ($target.hasClass('submitting')) {
                return;
            }

            this.validateStep1({
                context: options.context,
                dom: options.dom
            });

            if (options.context.$('.error').length === 0) {

                var data = {
                    'nameFirst': options.dom.$firstName.val(),
                    'nameLast': options.dom.$lastName.val(),
                    'transactionId': options.dom.$transationId.val(),
                    'activationCode': options.dom.$activationCode.val(),
                    'facilityKey': options.dom.$club.find('select option').filter(':selected').data('id'),
                    'emailAddress': options.dom.$email.val(),
                    'phoneNumber': options.dom.$phone.val(),
                    'userLocation': options.dom.$region.find('select').val() || 'NoRegion',
                    'qa': ''
                };

                this.step1Data = data;

                console.log('Step1 Data: ', data);

                $target.text('Loading...');
                $target.addClass('submitting');

                $.ajax({
                    type: 'POST',
                    url: ENDPOINT_URL,
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    headers: { 'Eqx-Version': '1' }
                }).success(function (response) {
                    self.scrollWindow({ scrollFor: options.scrollFor });
                    if (response.Success === 'false') {
                        options.dom.$step1ControlForm.hide();
                        options.dom.$step1ErrorWrapper.fadeIn('fast');
                    }
                    else {
                        self.step1Data.tokenId = response.TokenId;
                        self.renderStep2({
                            scrollFor: options.scrollFor,
                            dom: options.dom
                        });
                    }
                }).error(function () {
                    self.scrollWindow({ scrollFor: options.scrollFor });
                    self.replaceEl({
                        $el: options.dom.$step1ErrorTitle,
                        placeholder: '##NAME##',
                        value: self.step1Data.nameFirst
                    });

                    options.dom.$step1ControlForm.hide();
                    options.dom.$step1ErrorWrapper.fadeIn('fast');
                });
            } else {
                this.scrollWindow({
                    context: options.context,
                    whichLead: options.scrollFor,
                    scrollFor: Leads.ERROR
                });
            }
        },

        renderStep2: function (options) {
            this.scrollWindow({ scrollFor: options.scrollFor });
            options.dom.$step1.hide();
            options.dom.$step2.fadeIn('fast');

            this.replaceEl({
                $el: options.dom.$step2Description,
                placeholder: '##NAME##',
                value: this.step1Data.nameFirst
            });

            this.replaceEl({
                $el: options.dom.$step2ThanksTitle,
                placeholder: '##NAME##',
                value: this.step1Data.nameFirst
            });

            this.replaceEl({
                $el: options.dom.$step2ErrorTitle,
                placeholder: '##NAME##',
                value: this.step1Data.nameFirst
            });
        },

        replaceEl: function (options) {
            var txt = options.$el.text();

            if (txt) {
                options.$el.html(txt.replace(options.placeholder, options.value));
            }
        },

        toggleOtherInterests: function (options) {
            this.toggleEl({ $el: options.$otherInterests });
        },

        toggleOtherGoals: function (options) {
            this.toggleEl({ $el: options.$otherGoals });
        },

        toggleEl: function (options) {
            if (options.$el.is(':visible')) {
                options.$el.hide();
            } else {
                options.$el.show();
                options.$el.focus();
            }
        },

        submitStep2: function (options) {
            options.e.preventDefault();

            var self = this;
            var $target = $(options.e.target);
            var ENDPOINT_URL = '/leads/thank-you';

            if ($target.hasClass('submitting')) {
                return;
            }

            var notes = '';
            var question;
            var Arr = '';

            options.dom.$row.each(function () {
                var $this = $(this);
                var $answerOptions = $this.find('.answer-options');

                question = $this.find('.question-heading h3').text() === 'I\'m interested in' ? 'Interested in' : $this.find('.question-heading h3').text();

                var ansLen,
                    answer,
                    answerArr = '',
                    singleAnswer,
                    combinedSingleAns = '',
                    questionText,
                    qa;

                if ($answerOptions.find('input').is(':radio')) {
                    answer = $answerOptions.find(':checked').val();

                    if (answer) {
                        singleAnswer = '<Answer>';
                        singleAnswer += '<answerText>' + answer + '</answerText>';
                        singleAnswer += '<additionalInformation></additionalInformation>';
                        singleAnswer += '</Answer>';
                        combinedSingleAns += singleAnswer;

                        answerArr = '<answers>' + combinedSingleAns.split(',').join('') + '</answers>';
                        questionText = '<questionText>' + $this.find('.question').text() + '</questionText>';
                        qa = '<QuestionAnswers>' + questionText + answerArr + '</QuestionAnswers>';
                    } else {
                        return;
                    }

                } else if ($answerOptions.find('select').length) {
                    answer = $answerOptions.find('select').val();

                    if (answer) {
                        singleAnswer = '<Answer>';
                        singleAnswer += '<answerText>' + answer + '</answerText>';
                        singleAnswer += '<additionalInformation></additionalInformation>';
                        singleAnswer += '</Answer>';
                        combinedSingleAns += singleAnswer;

                        answerArr = '<answers>' + combinedSingleAns.split(',').join('') + '</answers>';
                        questionText = '<questionText>' + $this.find('.question').text() + '</questionText>';
                        qa = '<QuestionAnswers>' + questionText + answerArr + '</QuestionAnswers>';
                    } else {
                        return;
                    }

                } else if ($answerOptions.find('input').is(':checkbox')) {

                    ansLen = $answerOptions.find(':checked').length;
                    var chkBoxansArr = [];
                    if (ansLen > 0) {

                        for (var k = 0; k < ansLen; k++) {
                            answer = $answerOptions.find(':checked').eq(k).closest('.checkbox').find('.control-title').text();
                            if (answer.toLowerCase() !== 'other') {
                                singleAnswer = '<Answer>';
                                singleAnswer += '<answerText>' + answer + '</answerText>';
                                singleAnswer += '<additionalInformation></additionalInformation>';
                                singleAnswer += '</Answer>';
                                combinedSingleAns += singleAnswer;
                                chkBoxansArr.push(answer);
                            }
                        }

                        if (chkBoxansArr.length > -1) {
                            answer = chkBoxansArr.toString();
                        }
                    }

                    var $other = $answerOptions.find('.other');
                    var otherValue = $.trim($other.val());

                    if ($other.is(':visible') && otherValue !== '') {
                        if (answer) {
                            answer += ', other(' + otherValue + ')';
                        } else {
                            answer = 'other(' + otherValue + ')';
                        }

                        singleAnswer = '<Answer>';
                        singleAnswer += '<answerText>other</answerText>';
                        singleAnswer += '<additionalInformation>' + otherValue + '</additionalInformation>';
                        singleAnswer += '</Answer>';
                        combinedSingleAns += singleAnswer;
                    }

                    if (combinedSingleAns !== '') {
                        var chkQuestion = $this.find('.question').text() === 'I\'m interested in' ? 'Interested in' : $this.find('.question').text();

                        answerArr = '<answers>' + combinedSingleAns.split(',').join('') + '</answers>';
                        questionText = '<questionText>' + chkQuestion + '</questionText>';
                        qa = '<QuestionAnswers>' + questionText + answerArr + '</QuestionAnswers>';
                    } else {
                        return;
                    }
                }

                Arr += qa;
                if (answer) {
                    notes += '\n\n' + question + ': ' + answer;
                }
            });

            Arr = Arr.split(',').join('');
            var BigArr = Arr ? '<questionsAnswers>' + Arr + '</questionsAnswers>' : '';

            notes = notes.toUpperCase();

            var data = {
                'nameFirst': this.step1Data.nameFirst,
                'nameLast': this.step1Data.nameLast,
                'outreachCode': this.step1Data.activationCode,
                'facilityId': this.step1Data.facilityKey,
                'emailAddress': this.step1Data.emailAddress,
                'phone': this.step1Data.phoneNumber,
                'tokenId': this.step1Data.tokenId,
                'notes': notes,
                'qa': BigArr
            };

            console.log('Step2 Data: ', data);
            console.log('qa:', BigArr);
            console.log('notes:', notes);

            $target.text('Loading...');
            $target.addClass('submitting');

            $.ajax({
                type: 'POST',
                url: ENDPOINT_URL,
                data: JSON.stringify(data),
                contentType: 'application/json',
                headers: { 'Eqx-Version': '1' }
            }).success(function (response) {
                options.dom.$step2ControlForm.hide();
                self.scrollWindow({ scrollFor: options.scrollFor });

                if (response) {
                    //if (typeof window._satellite.track === 'function') {
                    //    window._satellite.track('leadSurveySubmit');
                    //}
                    options.dom.$step2SuccessWrapper.fadeIn('fast');
                } else {
                    options.dom.$step2ErrorWrapper.fadeIn('fast');
                }
            }).error(function () {
                self.scrollWindow({ scrollFor: options.scrollFor });
                options.dom.$step2ErrorWrapper.fadeIn('fast');
            });
        }
    };


    /* 
        Leads Popup 
    */
    Leads.Popup = Backbone.View.extend({
        id: 'lead-popup-wrapper',

        tpl: {
            overlay: '<div id="lead-popup-overlay"></div>',
            loader: '<div class="loader"><div class="loader-circles bounce1"></div><div class="loader-circles bounce2"></div><div class="loader-circles bounce3"></div></div>'
        },

        events: {
            'click .close-popup': 'closePopup',
            'change .otherInterestsOption': 'toggleOtherInterests',
            'change .otherGoalsOption': 'toggleOtherGoals',
            'click .submit-step1': 'submitStep1',
            'click .submit-step2': 'submitStep2'
        },

        initialize: function () {
            popupRef = this;
            this.dom = {};
        },

        render: function () {
            $('#lead-popup-wrapper').remove();

            this.$el.append(this.tpl.overlay);
            this.$el.append(this.tpl.loader);

            $('body').append(this.$el);

            Leads.common.scrollWindow({ scrollFor: Leads.POPUP_LEAD });
            this.getContent();
        },

        getContent: function () {
            $.ajax({
                url: '/leads/popuplead'
            })
            .done(this.renderPopup)
            .fail(function () {
                console.log('Unable to get lead form content');
            });
        },

        renderPopup: function (data) {
            popupRef.$('.loader').hide();
            popupRef.$el.append(data);

            popupRef.dom.$leadPopupContent = popupRef.$('#lead-popup-content');
            popupRef.dom.$step1 = popupRef.$('.step1');
            popupRef.dom.$step2 = popupRef.$('.step2');

            popupRef.dom.$step1ControlForm = popupRef.$('.step1 .control-form');
            popupRef.dom.$step1ErrorTitle = popupRef.$('.step1-error-title');
            popupRef.dom.$step1ErrorWrapper = popupRef.$('.step1 .error-wrapper');

            popupRef.dom.$step2ControlForm = popupRef.$('.step2 .control-form');
            popupRef.dom.$step2Description = popupRef.$('.step2-description');
            popupRef.dom.$step2ThanksTitle = popupRef.$('.step2-thanks-title');
            popupRef.dom.$step2ErrorTitle = popupRef.$('.step2-error-title');
            popupRef.dom.$step2SuccessWrapper = popupRef.$('.step2 .success-wrapper');
            popupRef.dom.$step2ErrorWrapper = popupRef.$('.step2 .error-wrapper');

            popupRef.dom.$row = popupRef.$('.row');

            popupRef.dom.$firstName = popupRef.$('.first-name');
            popupRef.dom.$lastName = popupRef.$('.last-name');
            popupRef.dom.$region = popupRef.$('.region');
            popupRef.dom.$club = popupRef.$('.club');
            popupRef.dom.$email = popupRef.$('.email');
            popupRef.dom.$phone = popupRef.$('.phone');
            popupRef.dom.$otherInterests = popupRef.$('.otherInterests');
            popupRef.dom.$otherGoals = popupRef.$('.otherGoals');
            popupRef.dom.$transationId = popupRef.$('.transation-id');
            popupRef.dom.$activationCode = popupRef.$('.activation-code');

            App.renderComponents(popupRef.dom.$leadPopupContent);

            Leads.common.fillRegionClubDropdown({
                $region: popupRef.dom.$region,
                $club: popupRef.dom.$club
            });

            Leads.common.defaultRegionClubSelect({
                $region: popupRef.dom.$region,
                $club: popupRef.dom.$club
            });

            popupRef.dom.$leadPopupContent.fadeIn('fast');

            if ($('.takeover-module').is(':visible')) {
                $('body').css('overflow', 'auto');
            }
        },

        closePopup: function (e) {
            e.preventDefault();

            $('#lead-popup-wrapper').fadeOut('fast', function () {
                $(this).remove();

                if ($('.takeover-module').is(':visible')) {
                    $('body').css('overflow', 'hidden');
                }
            });
        },

        toggleOtherInterests: function () {
            console.log('Popup Lead: Other Interests');

            Leads.common.toggleOtherInterests({
                $otherInterests: this.dom.$otherInterests
            });
        },

        toggleOtherGoals: function () {
            console.log('Popup Lead: Other Goals');

            Leads.common.toggleOtherGoals({
                $otherGoals: this.dom.$otherGoals
            });
        },

        submitStep1: function (e) {
            console.log('Popup Lead: Step 1 Submit');

            Leads.common.submitStep1({
                e: e,
                context: this,
                dom: this.dom,
                scrollFor: Leads.POPUP_LEAD
            });
        },

        submitStep2: function (e) {
            console.log('Popup Lead: Step 2 Submit');

            Leads.common.submitStep2({
                e: e,
                dom: this.dom,
                scrollFor: Leads.POPUP_LEAD
            });
        }
    });


    /* 
        Leads Page 
    */
    Leads.Page = Backbone.View.extend({
        el: '#lead-page-wrapper',

        events: {
            'change .otherInterestsOption': 'toggleOtherInterests',
            'change .otherGoalsOption': 'toggleOtherGoals',
            'click .submit-step1': 'submitStep1',
            'click .submit-step2': 'submitStep2'
        },

        initialize: function () {
            this.dom = {};
        },

        render: function () {

            // Cache dom selector
            this.dom.$leadPageWrapper = this.$('#lead-form-wrapper');
            this.dom.$step1 = this.$('.step1');
            this.dom.$step2 = this.$('.step2');

            this.dom.$step1ControlForm = this.$('.step1 .control-form');
            this.dom.$step1ErrorTitle = this.$('.step1-error-title');
            this.dom.$step1ErrorWrapper = this.$('.step1 .error-wrapper');

            this.dom.$step2ControlForm = this.$('.step2 .control-form');
            this.dom.$step2Description = this.$('.step2-description');
            this.dom.$step2ThanksTitle = this.$('.step2-thanks-title');
            this.dom.$step2ErrorTitle = this.$('.step2-error-title');
            this.dom.$step2SuccessWrapper = this.$('.step2 .success-wrapper');
            this.dom.$step2ErrorWrapper = this.$('.step2 .error-wrapper');

            this.dom.$row = this.$('.row');

            this.dom.$firstName = this.$('.first-name');
            this.dom.$lastName = this.$('.last-name');
            this.dom.$region = this.$('.region');
            this.dom.$club = this.$('.club');
            this.dom.$email = this.$('.email');
            this.dom.$phone = this.$('.phone');
            this.dom.$otherInterests = this.$('.otherInterests');
            this.dom.$otherGoals = this.$('.otherGoals');
            this.dom.$transationId = this.$('.transation-id');
            this.dom.$activationCode = this.$('.activation-code');

            App.renderComponents(this.dom.$leadPageWrapper);

            Leads.common.fillRegionClubDropdown({
                $region: this.dom.$region,
                $club: this.dom.$club
            });

            Leads.common.defaultRegionClubSelect({
                $region: this.dom.$region,
                $club: this.dom.$club
            });
        },

        toggleOtherInterests: function () {
            console.log('Page Lead: Other Interests');

            Leads.common.toggleOtherInterests({
                $otherInterests: this.dom.$otherInterests
            });
        },

        toggleOtherGoals: function () {
            console.log('Page Lead: Other Goals');

            Leads.common.toggleOtherGoals({
                $otherGoals: this.dom.$otherGoals
            });
        },

        submitStep1: function (e) {
            console.log('Page Lead: Step 1 Submit');

            Leads.common.submitStep1({
                e: e,
                context: this,
                dom: this.dom,
                scrollFor: Leads.PAGE_LEAD
            });
        },

        submitStep2: function (e) {
            console.log('Page Lead: Step 2 Submit');

            Leads.common.submitStep2({
                e: e,
                dom: this.dom,
                scrollFor: Leads.PAGE_LEAD
            });
        }
    });


    /*
        Lead Popup Init
    */
    Leads.PopupInit = function () {
        var leadPopup = new Leads.Popup();
        leadPopup.render();

        console.log('Lead Popup');
    };


    /*
        Lead Page Init
    */
    Leads.PageInit = function () {
        var leadPage = new Leads.Page();
        leadPage.render();

        console.log('Lead Page');
    };

}(window, window.App));
