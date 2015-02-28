define(function (require, exports, module) {
    'use strict';

    var self;
    var feedBackTypesJson = {};

    var Feedback = Backbone.View.extend({
        el: $('.feedback'),
        events: {
            'submit #frmFeedback': 'submitFeedback'
        },

        initialize: function () {
            self = this;
        },

        buildLoader: function () {
            var loaderAndError;

            if (this.loaderAndError) {
                return this.loaderAndError;
            } else {
                loaderAndError = EQ.Helpers.loaderAndErrorHandler(this.$el.find('.loaderAnim'), {
                    color: 'black'
                });

                this.loaderAndError = loaderAndError;
                return loaderAndError;
            }
        },

        render: function () {
            var loaderAndError = this.buildLoader();

            loaderAndError.showLoader();
            loaderAndError.$el.find('.loader').css({ 'top': '35%' });

            this.renderDropDown();
            $("body").removeClass("v2");
            
        },

        islocalStorageEnabled: function () {
            try {
                localStorage.setItem('mod', 'mod');
                localStorage.removeItem('mod');
                return true;
            } catch (e) {
                return false;
            }
        },
        submitFeedback: function (e) {
            var ENDPOINT_FEEDBACK_URL_ACCOUNT = APIEndpoint + '/feedback/account',
                ENDPOINT_FEEDBACK_URL_WEBSITE = APIEndpoint + '/feedback/website',
                ENDPOINT_FEEDBACK_URL_CLUB = APIEndpoint + '/feedback/club';
            var $category = self.$el.find('.category .option'),
                $doNotContactMe = self.$el.find('.doNotContactMeChkbox').val();

            this.validate();

            // Send data to the specific location according to the category selection
            if ($category.text() === 'MY ACCOUNT') {
                if (self.$el.find('.error').length === 0) {
                    var data = {
                        'cookiesEnabled': window.cookiesEnabled,
                        'serverMachineName': window.serverMachineName,
                        'userAgent': window.userAgent,
                        'siteVersion': window.siteVersion,
                        'isLocalStorage': this.islocalStorageEnabled(),
                        'description': self.$el.find('.description').val(),
                        'doNotContactMe': $doNotContactMe,
                        'topic': self.$el.find('.topic .option').text(),
                        'isEmailRequired': self.$el.find('.topic select option').filter(':selected').data('emailrequired'),
                        'emailAddress': self.$el.find('.topic select option').filter(':selected').data('email')
                    };
                    if (self.$el.find('.error').length === 0) {
                        $(":submit").prop("disabled", true);
                        $(":submit").text("LOADING...");

                        $.ajax({
                            type: 'POST',
                            url: ENDPOINT_FEEDBACK_URL_ACCOUNT,
                            data: JSON.stringify(data),
                            contentType: 'application/json',
                            headers: { 'Eqx-Version': '1' },
                            xhrFields: { withCredentials: true }
                        }).success(function (response) {

                            self.$el.find('.title').hide();
                            self.$el.find('.sub-title').hide();
                            self.$el.find('.feedback-dropdown').hide();
                            self.$el.find('.feedback-form').addClass('hidden');
                            self.$el.find('.feedback-thanks .thanks-title').text('Thank you, ' + response.nameFirst + '!');
                            if ($doNotContactMe === 'false') {
                                self.$el.find('.doContactMe').removeClass('hidden');
                            } else {
                                self.$el.find('.doNotContactMe').removeClass('hidden');
                            }
                            self.$el.find('.feedback-thanks').removeClass('hidden');
                            $('#faqSection').hide();
                            self.$el.find('#frmFeedback + hr').hide();

                            $('html, body').animate({
                                scrollTop: self.$el.find('.feedback-thanks').offset().top - 100
                            }, 500);
                        }).error(function (xhr) {
                            self.$el.find('.feedback-form').addClass('hidden');
                            self.$el.find('.feedback-error').removeClass('hidden');

                            $('html, body').animate({
                                scrollTop: self.$el.find('.feedback-error').offset().top - 100
                            }, 500);
                        });
                    }
                }
                return false;
            } else if ($category.text() === 'THE CLUB') {
                if (self.$el.find('.error').length === 0) {
                    var data = {
                        'cookiesEnabled': window.cookiesEnabled,
                        'serverMachineName': window.serverMachineName,
                        'userAgent': window.userAgent,
                        'siteVersion': window.siteVersion,
                        'isLocalStorage': this.islocalStorageEnabled(),
                        'doNotContactMe': $doNotContactMe,
                        'description': self.$el.find('.description').val(),
                        'topic': self.$el.find('.topic .option').text(),
                        'clubName': self.$el.find('.club select option').filter(':selected').val(),
                        'regionName': self.$el.find('.region select option').filter(':selected').val(),
                        'facilityId': self.$el.find('.club select option').filter(':selected').data('id'),
                        'isEmailRequired': self.$el.find('.topic select option').filter(':selected').data('emailrequired'),
                        'emailAddress': self.$el.find('.topic select option').filter(':selected').data('email')
                    };

                    if (self.$el.find('.error').length === 0) {
                        $(":submit").prop("disabled", true);
                        $(":submit").text("LOADING...");

                        $.ajax({
                            type: 'POST',
                            url: ENDPOINT_FEEDBACK_URL_CLUB,
                            data: JSON.stringify(data),
                            contentType: 'application/json',
                            headers: { 'Eqx-Version': '1' },
                            xhrFields: { withCredentials: true }
                        }).success(function (response) {

                            self.$el.find('.title').hide();
                            self.$el.find('.sub-title').hide();
                            self.$el.find('.feedback-dropdown').hide();
                            self.$el.find('.feedback-form').addClass('hidden');
                            self.$el.find('.feedback-thanks .thanks-title').text('Thank you, ' + response.nameFirst + '!');
                            if ($doNotContactMe === 'false') {
                                self.$el.find('.doContactMe').removeClass('hidden');
                            } else {
                                self.$el.find('.doNotContactMe').removeClass('hidden');
                            }
                            self.$el.find('.feedback-thanks').removeClass('hidden');
                            $('#faqSection').hide();
                            self.$el.find('#frmFeedback + hr').hide();

                            $('html, body').animate({
                                scrollTop: self.$el.find('.feedback-thanks').offset().top - 100
                            }, 500);
                        }).error(function (xhr) {
                            self.$el.find('.feedback-form').addClass('hidden');
                            self.$el.find('.feedback-error').removeClass('hidden');

                            $('html, body').animate({
                                scrollTop: self.$el.find('.feedback-error').offset().top - 100
                            }, 500);
                        });
                    }
                }
                return false;
            } else if ($category.text() === 'THE WEBSITE / IPHONE APP') {
                if (self.$el.find('.error').length === 0) {

                    var checkboxval = $('.feedback-website input[type=checkbox]:checked').map(function () { return this.id; }).get().join(', ');

                    var data = {
                        'cookiesEnabled': window.cookiesEnabled,
                        'serverMachineName': window.serverMachineName,
                        'userAgent': window.userAgent,
                        'siteVersion': window.siteVersion,
                        'isLocalStorage': this.islocalStorageEnabled(),
                        'description': self.$el.find('.description').val(),
                        'doNotContactMe': $doNotContactMe,
                        'topic': self.$el.find('.topic .option').text(),
                        'isEmailRequired': self.$el.find('.topic select option').filter(':selected').data('emailrequired'),
                        'emailAddress': self.$el.find('.topic select option').filter(':selected').data('email'),
                        'subCategory': checkboxval !== '' ? checkboxval : ''
                    };

                    if (self.$el.find('.error').length === 0) {
                        $(":submit").prop("disabled", true);
                        $(":submit").text("LOADING...");

                        $.ajax({
                            type: 'POST',
                            url: ENDPOINT_FEEDBACK_URL_WEBSITE,
                            data: JSON.stringify(data),
                            contentType: 'application/json',
                            headers: { 'Eqx-Version': '1' },
                            xhrFields: { withCredentials: true }
                        }).success(function (response) {

                            self.$el.find('.title').hide();
                            self.$el.find('.sub-title').hide();
                            self.$el.find('.feedback-dropdown').hide();
                            self.$el.find('.feedback-form').addClass('hidden');
                            self.$el.find('.feedback-thanks .thanks-title').text('Thank you, ' + response.nameFirst + '!');
                            if ($doNotContactMe === 'false') {
                                self.$el.find('.doContactMe').removeClass('hidden');
                            } else {
                                self.$el.find('.doNotContactMe').removeClass('hidden');
                            }
                            self.$el.find('.feedback-thanks').removeClass('hidden');
                            $('#faqSection').hide();
                            self.$el.find('#frmFeedback + hr').hide();

                            $('html, body').animate({
                                scrollTop: self.$el.find('.feedback-thanks').offset().top - 100
                            }, 500);
                        }).error(function (xhr) {
                            self.$el.find('.feedback-form').addClass('hidden');
                            self.$el.find('.feedback-error').removeClass('hidden');

                            $('html, body').animate({
                                scrollTop: self.$el.find('.feedback-error').offset().top - 100
                            }, 500);
                        });
                    }
                }
                return false;
            }
            return false;
        },
        renderDropDown: function () {
            var FDK = {};

            FDK.CreateJsonObj = function () {
                var loaderAndError = self.buildLoader();
                var ENDPOINT_FEEDBACK_URL = APIEndpoint + '/feedback/topics';

                $.ajax({
                    type: 'GET',
                    url: ENDPOINT_FEEDBACK_URL,
                    contentType: 'application/json',
                    headers: { 'Eqx-Version': '1' },
                    xhrFields: { withCredentials: true }
                }).success(function (response) {

                    feedBackTypesJson = response;
                    FDK.BindDropdowns();
                    FDK.DefaultSelects();

                    
                    loaderAndError.hideLoader();
                    $('.feedback-wrapper').removeClass("hidden");
                }).error(function (xhr) {
                    console.log(xhr);
                    loaderAndError.showError();
                });

            };

            FDK.BindDropdowns = function () {
                var $regions = '',
                    $clubs = {},
                    $topics = {},
                    $feedbackTypes = '';

                $.each(feedBackTypesJson, function (i, feedbackType) {
                    if (feedbackType.topics && feedbackType.topics.length) {
                        $feedbackTypes += '<option data-id="' + i + '">' + feedbackType.title + '</option>';
                        var topicArr = [];
                        $.each(feedbackType.topics, function (i, topic) {
                            //topicArr = topicArr.concat(topic.title);
                            topicArr = topicArr.concat(topic);
                        });
                        $topics[feedbackType.title] = topicArr;
                    }
                });

                self.$el.find('.category select').html($feedbackTypes);

                //On Title Change render respective topics:
                self.$el.find('.category select').on('change', function () {

                    var currentCategory = $topics[$(this).val()],
                        $topicOptions = '';

                    if ($(this).val() === "MY ACCOUNT") {
                        $('.feedback-club').hide();
                        $('.feedback-website').hide();
                    } else if ($(this).val() === "THE CLUB") {
                        $('.feedback-club').show();
                        $('.feedback-website').hide();
                    } else if ($(this).val() === "THE WEBSITE / IPHONE APP") {
                        $('.feedback-website').show();
                        $('.feedback-club').hide();
                    }

                    // Default selected club.
                    var $topicOptions// = '<option selected data-id="" data-emailrequired="" data-email="">SELECT THE TOPIC</option>';

                    $.each(currentCategory, function (i, topic) {
                        $topicOptions += '<option data-id="' + i + '" data-emailrequired="' + topic.isEmailRequired + '" data-email="' + topic.emailAddress + '">' + topic.title + '</option>';
                    });
                    self.$el.find('.topic select').html($topicOptions);
                    self.$el.find('.topic select').each(function () {
                        var options = self.$el.find('.topic select').children('option');
                        options.sort(function (optionA, optionB) {
                            return optionA.value.localeCompare(optionB.value);
                        });
                        $(this).empty().append(options);
                    });
                    self.$el.find('.topic select').prepend('<option selected data-id="" data-emailrequired="" data-email="">SELECT THE TOPIC</option>');
                    self.$el.find('.topic select').trigger('change');

                });

                $.each(window.allRegionsData, function (i, region) {
                    if (region.SubRegions && region.SubRegions.length) {
                        $regions += '<option data-slug="' + region.ShortName + '">' + region.Name + '</option>';

                        var facilities = [];
                        $.each(region.SubRegions, function (j, subregion) {
                            facilities = facilities.concat(subregion.Facilities);
                        });
                        $clubs[region.Name] = facilities;

                    } else {
                        $regions += '<option data-slug="' + region.ShortName + '">' + region.Name + '</option>';
                        $clubs[region.Name] = region.Facilities;
                    }
                });

                //Populate the region select with the allRegionsData window variable.
                self.$el.find('.region select').html($regions);

                //On region change
                self.$el.find('.region select').on('change', function () {

                    var currentFacilities = $clubs[$(this).val()],
                        $clubsOptions = '';

                    // Default selected club.
                    $clubsOptions = '';//'<option selected data-id="">SELECT A CLUB</option>';

                    $.each(currentFacilities, function (i, facility) {
                        $clubsOptions += '<option data-id="' + facility.Id + '">' + facility.ClubName + '</option>';
                    });

                    self.$el.find('.club select').html($clubsOptions);
                    self.$el.find('.club select').each(function () {
                        var options = self.$el.find('.club select').children('option');
                        options.sort(function (optionA, optionB) {
                            return optionA.value.localeCompare(optionB.value);
                        });
                        $(this).empty().append(options);
                    });
                    self.$el.find('.club select').prepend('<option selected data-id="">SELECT A CLUB</option>');
                    self.$el.find('.club select').trigger('change');

                });

                //Trigger first change.
                self.$el.find('.region select').trigger('change');
                self.$el.find('.category select').trigger('change');
            };

            FDK.DefaultSelects = function () {


                var defaultCategory = 'THE CLUB';
                if (defaultCategory) {
                    self.$el.find('.category select option').each(function (i, el) {
                        if ($(el).text() === defaultCategory) {
                            self.$el.find('.category select').prop('selectedIndex', i).trigger('change');
                        }
                    });
                }

                var clubID = EQ.Helpers.getClubIdFromFacilityId(userProfileJson.FacilityId),
                    userDefaultRegion = EQ.Helpers.getUserDefaultRegion().value;
                if (clubID) {
                    if (userDefaultRegion) {
                        self.$el.find('.region select option').each(function (i, el) {
                            if ($(el).data('slug') === userDefaultRegion) {
                                self.$el.find('.region select').prop('selectedIndex', i).trigger('change');
                            }
                        });
                    }
                    //Check if there is a currentClub
                    if (userProfileJson.FacilityId) {
                        self.$el.find('.club select option').each(function (i, el) {
                            if ($(el).data('id') === +userProfileJson.FacilityId) {
                                self.$el.find('.club select').prop('selectedIndex', i).trigger('change');
                            }
                        });
                    }
                } else {
                    //Ask for GEO
                    window.EQ.Geo.getLatLng(function () {
                        window.EQ.Geo.getNearestClub(function (club) {
                            var clubId = club.Id,
                                region = club.Region.replace(/ /g, '-');

                            //Check selectedRegion and default to that.
                            if (region) {
                                self.$el.find('.region select option').each(function (i, el) {
                                    if ($(el).data('slug') === region) {
                                        self.$el.find('.region select').prop('selectedIndex', i).trigger('change');
                                    }
                                });
                            }
                            //Check if there is a currentClub
                            if (clubId) {
                                self.$el.find('.club select option').each(function (i, el) {
                                    if ($(el).data('id') === +clubId) {
                                        self.$el.find('.club select').prop('selectedIndex', i).trigger('change');
                                    }
                                });
                            }
                        });
                    }, function () {
                        // If GEO Denied or failed.
                        self.$el.find('.region select option').each(function (i, el) {
                            if ($(el).data('slug') === 'New-York') {
                                self.$el.find('.region select').prop('selectedIndex', i).trigger('change');
                            }
                        });
                    });
                }
            };

            FDK.init = function () {
                FDK.CreateJsonObj();
                //FDK.BindDropdowns();
                //FDK.DefaultSelects();
            };

            //Init the module
            FDK.init();
        },
        validate: function () {
            var $category = self.$el.find('.category .option'),
                $topicDD = self.$el.find('.topic .option'),
                $region = self.$el.find('.region .option'),
                $club = self.$el.find('.club .option'),
                $description = self.$el.find('.description');

            //$isError = self.$el.find(".is-error");

            //Remove all errors to-recheck.
            self.$el.find('.error').removeClass('error');

            // validation according to the feedback category --
            if ($category.text() === 'THE CLUB') {

                if ($region.text() !== ' ') {
                    $region.removeClass('error');
                    //$isError.addClass("hidden");
                } else {
                    $region.addClass('error');
                    //$isError.removeClass("hidden");
                }

                if ($club.text() !== ' ') {
                    $club.removeClass('error');
                    //$isError.addClass("hidden");
                } else {
                    $club.addClass('error');
                    //$isError.removeClass("hidden");
                }

            }

            if ($topicDD.text() !== '' && $topicDD.text() !== 'SELECT THE TOPIC') {
                $topicDD.removeClass('error');
            } else {
                $topicDD.addClass('error');
            }

            if ($description.val().length < 1 || $description.val() === ' ') {
                $description.addClass('error');
            } else {
                $description.removeClass('error');
            }
        },
        showClubFeedback: function () {
            $('.region-dropdown').show();
            $('.club-dropdown').show();
        },
        showWebsiteFeedback: function () {
            $('.region-dropdown').hide();
            $('.club-dropdown').hide();
        }
    });

    return new Feedback();
});
