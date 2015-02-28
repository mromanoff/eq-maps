(function (global, App) {
    'use strict';

    /* global APIEndpoint, EQ, debug, _, transactionDetail */

    var Join = App.Pages.Join = {};

    Join.SelectClub = {};
    Join.SelectMembership = {};
    Join.MembershipPurchase = {};
    Join.ThankYouPage = {};

    // Step 1
    Join.SelectClub.FindByZip = function (cb, err) {
        var ENDPOINT = APIEndpoint + '/facilities',
            zipcode = $('input[name="SearchByZip.ZipCode"]').val();

        // Omniture call for join flow
        //window.tagData.join = window.tagData.join || {};
        $.get(ENDPOINT, { zip: zipcode, numberFacilities: 5, radius: 1000 }, function (d) {
            // Callback.
            if (cb && typeof cb === 'function') {
                if (d.facilities.length === 0) {
                    EQ.Geo.getLatLng(function () {
                        EQ.Geo.getNearestClub(function (club) {
                            if (club === null || club === undefined) {
                                cb(); // Show the map anyway
                                return false;
                            } else {
                                debug('[GetNearestClub] ', club);
                                $('.nearme').data('clubSelector').set(club);
                                cb();
                            }
                        });
                    }, err);
                } else {
                    // Set Map on that club.
                    var selectedClub = d.facilities[0];
                    $('.nearme').data('clubSelector').set(selectedClub);
                    cb();
                }
            }
        }).fail(function () {
            EQ.Geo.getLatLng(function () {
                EQ.Geo.getNearestClub(function (club) {
                    if (club === null || club === undefined) {
                        cb(); // Show the map anyway
                        return false;
                    } else {
                        debug('[GetNearestClub] ', club);
                        $('.nearme').data('clubSelector').set(club);
                        cb();
                    }
                });
            }, err);
        });
    };

    Join.SelectClub.bind = function () {
        $('.search').on('submit', function (e) {
            e.preventDefault();

            if ($(this).data('publicMethods').isValid()) {
                $('input[type="submit"]').data('original-text', $('input[type="submit"]').val()).val('Loading...').attr('disabled', true);

                Join.SelectClub.FindByZip(function () {
                    $('form').addClass('is-hidden');
                    $('.nearme-wrapper').removeClass('is-hidden');
                    $('.tpl-ctacallout a').css('display', 'block');

                    // Force the layout redraw for the next event loop.
                    setTimeout(function () {
                        EQ.Maps.fixLayout();
                    }, 16);

                }, function () {
                    $('input[type="submit"]').val($('input[type="submit"]').data('original-text')).attr('disabled', false);
                    $('form').find('.is-error').removeClass('hidden').text('Please try again later or enable Geolocation.');
                });

                $('.nearme select[name="facilities"]').on('change', function () {
                    var urlName = $('.nearme').data('clubSelector').get().URL;
                    var sectors = urlName.split('/');
                    // extra last end
                    $('.tpl-ctacallout a').attr('href', '/join/' + sectors[sectors.length - 1]);
                });
            }
        });
    };

    Join.SelectClub.init = function () {
        Join.SelectClub.bind();
    };

    Join.SelectMembership.bind = function () {
        console.log('Step2 Init!');
        // Trigger Step 3 Hidden Form Submit.
        $('a.join-now').on('click', function (e) {
            e.preventDefault();
            $(this).next('form').submit();
        });
    };

    Join.SelectMembership.promotions = function () {
        var tallestPromotion = 0;

        // Equalize Membership Promotions Height
        $('.membership-price-info').each(function () {
            console.log($(this).height());
            if ($(this).height() >= tallestPromotion) {
                tallestPromotion = $(this).height();
            }
        });

        $('.membership-price-info').height(tallestPromotion);
    };

    Join.SelectMembership.init = function () {
        Join.SelectMembership.bind();
        Join.SelectMembership.promotions();

        $(window).on('resize', _.throttle(function () {
            Join.SelectMembership.promotions();
        }, 400));
    };

    Join.MembershipPurchase.Submit = function () {
        var ENDPOINT = APIEndpoint + '/registration/residential';
        $('.personal-information .submit').attr('disabled', true);
        $('.personal-information .submit').val('Purchasing...');
        var $personalInformation = $('.personal-info'),
            $billingInformation = $('.billing-info'),
            $country = $personalInformation.find('input[name="Plan.CountryName"]').val();


        var PersonalData = {
            'firstName': $personalInformation.find('input[name="MemberInformation.FirstName"]').val(),
            'lastName': $personalInformation.find('input[name="MemberInformation.LastName"]').val(),
            'emailAddress': $personalInformation.find('input[name="MemberInformation.EmailAddress"]').val(),
            'phoneNumber': $personalInformation.find('input[name="MemberInformation.PhoneNumber"]').val(),
            'address': {
                'street': $personalInformation.find('input[name="MemberInformation.Address1"]').val(),
                'street-additional': $personalInformation.find('input[name="MemberInformation.Address2"]').val(),
                'city': $personalInformation.find('input[name="MemberInformation.City"]').val(),
                'state': !($country === 'UK' || $country === 'CA') ? $personalInformation.find('select[name="MemberInformation.State"]').val() : '',
                'province': '',
                'zip': $personalInformation.find('input[name="MemberInformation.ZipCode"]').val(),
                'country': $country,
                'stateProvince': !($country === 'US' || $country === 'CA') ? $personalInformation.find('input[name="MemberInformation.State"]').val() : $personalInformation.find('select[name="MemberInformation.State"]').val()
            }
        },
            BillingData = {
                'firstName': $billingInformation.find('input[name="BillingInformation.FirstName"]').val(),
                'lastName': $billingInformation.find('input[name="BillingInformation.LastName"]').val(),
                'emailAddress': $billingInformation.find('input[name="BillingInformation.EmailAddress"]').val(),
                'phoneNumber': $billingInformation.find('input[name="BillingInformation.PhoneNumber"]').val(),
                'address': {
                    'street': $billingInformation.find('input[name="BillingInformation.Address1"]').val(),
                    'street-additional': $billingInformation.find('input[name="BillingInformation.Address2"]').val(),
                    'city': $billingInformation.find('input[name="BillingInformation.City"]').val(),
                    'state': !($country === 'UK' || $country === 'CA') ? $billingInformation.find('select[name="BillingInformation.State"]').val() : '',
                    'province': '',
                    'zip': $billingInformation.find('input[name="BillingInformation.ZipCode"]').val(),
                    'country': $country,
                    'stateProvince': !($country === 'US' || $country === 'CA') ? $billingInformation.find('input[name="BillingInformation.State"]').val() : $billingInformation.find('select[name="BillingInformation.State"]').val()
                }
            },
            PostData = {
                'facilityId': $personalInformation.find('input[name="Plan.FacilityId"]').val(),
                'membershipPlanId': $personalInformation.find('input[name="Plan.PlanId"]').val(),
                'countryId': $personalInformation.find('input[name="sourceSystem"]').val(),
                'member': PersonalData,
                'billing': BillingData,
                'creditCard': {
                    'cardNumber': $billingInformation.find('input[name="BillingInformation.CreditCardNumber"]').val(),
                    'expirationMonth': $billingInformation.find('select[name="BillingInformation.ExpirationMonth"]').val(),
                    'expirationYear': $billingInformation.find('select[name="BillingInformation.ExpirationYear"]').val(),
                    'cvc': $billingInformation.find('input[name="BillingInformation.CreditCardSecurityCode"]').val()
                }
            };

        if ($('input[name="usepersonal"]').is(':checked')) {
            PostData.billing = PostData.member;
        }

        var purchaseError = function (err) {
            var $submit = $('.tpl-submitcallout input[type="submit"]');
            $submit.attr('disabled', false);
            $submit.val($submit.data('oldCopy'));

            $('.is-error').removeClass('hidden').text(err);
            $('body, html').animate({ scrollTop: $('.is-error').offset().top - 100 });
        };

        $.ajax({
            type: 'POST',
            url: ENDPOINT,
            contentType: 'application/json',
            data: JSON.stringify(PostData),
            dataType: 'json',
            success: function (data) {
                if (data.error) {
                    purchaseError(data.error.message);
                } else {
                    data = $.extend({
                        'facilityId': PostData.facilityId,
                        'emailAddress': $personalInformation.find('input[name="MemberInformation.EmailAddress"]').val(),
                        'facilityRegion': $personalInformation.find('input[name="Plan.Region"]').val(),
                        'membershipPlanId': PostData.membershipPlanId
                    }, data);
                    Join.MembershipPurchase.ThankYou(data);
                }
            },
            error: function (d) {
                purchaseError(d.responseJSON.error.message);
            }
        });
    };

    Join.MembershipPurchase.ThankYou = function (d) {
        if (!d.error) {
            var $personalInformation = $('.personal-info');

            // Create DOM Form.
            var $form = $('<form />');

            // ACTION and METHOD
            $form.attr('action', '/join/thank-you').attr('method', 'POST');

            var name = $personalInformation.find('input[name="MemberInformation.FirstName"]').val(),
                charge = $('div.total-due span.price strong').html();

            // DATA
            var $name = $('<input type="hidden"/>').attr('name', 'Name').val(name.charAt(0).toUpperCase() + name.slice(1));
            var $charge = $('<input type="hidden"/>').attr('name', 'Charge').val(charge);
            var $type = $('<input type="hidden"/>').attr('name', 'Card.Type').val(d.cardType);
            var $number = $('<input type="hidden"/>').attr('name', 'Card.Number').val(d.lastFour);
            var $barcode = $('<input type="hidden"/>').attr('name', 'Barcode').val(d.barcodeKey);
            var $facilityId = $('<input type="hidden"/>').attr('name', 'FacilityId').val(d.facilityId);
            var $emailAddress = $('<input type="hidden"/>').attr('name', 'EmailAddress').val(d.emailAddress);
            var $facilityRegion = $('<input type="hidden"/>').attr('name', 'FacilityRegion').val(d.facilityRegion);
            var $membershipPlanId = $('<input type="hidden"/>').attr('name', 'MembershipPlanId').val(d.membershipPlanId);
            var $lastName = $('<input type="hidden"/>').attr('name', 'lastName').val(d.lastName);
            var $country = $('<input type="hidden"/>').attr('name', 'country').val(d.country);

            $form.append($name);
            $form.append($charge);
            $form.append($type);
            $form.append($number);
            $form.append($barcode);
            $form.append($facilityId);
            $form.append($emailAddress);
            $form.append($facilityRegion);
            $form.append($membershipPlanId);
            $form.append($lastName);
            $form.append($country);

            // Submit
            $('body').append($form);
            $form.submit();
        }
    };

    Join.MembershipPurchase.bind = function () {

        // Same as billing checkbox.
        $('input[name="usepersonal"]').on('change', function () {
            var checked = $(this).is(':checked');

            console.log(checked);

            $('.billing-info .information').toggle(!checked);
            $('.billing-info .information input').attr('disabled', checked);
            $('.billing-info .information select').attr('disabled', checked);
        });

        // Check billing checkbox on initial load.
        $('input[name="usepersonal"]').trigger('change');

        // Submit
        $('.tpl-submitcallout input[type="submit"]').on('click', function () {
            var $submit = $('.tpl-submitcallout input[type="submit"]');

            if ($('form.personal-information').data('publicMethods').isValid()) {
                // Change this for a data-load-message or similar for i18n support.
                $submit.attr('disabled', true);
                $submit.data('oldCopy', $submit.val());
                $submit.val('Loading...');

                $('form.personal-information').submit();
            }
        });

        // Form
        $('form.personal-information').on('submit', function (e) {
            e.preventDefault();
            Join.MembershipPurchase.Submit();
        });
    };

    Join.MembershipPurchase.init = function () {
        Join.MembershipPurchase.bind();
    };

    Join.ThankYouPage.ActivateAccount = function (user, loaderAndError) {
        debug('activate]', user);
        var ENDPOINT = APIEndpoint + '/registration/validateuser';

        $.ajax({
            type: 'POST',
            url: ENDPOINT,
            contentType: 'application/json',
            data: JSON.stringify(user),
            dataType: 'json',
            success: function (data) {
                if (data.error) {
                    loaderAndError.hideLoader();
                    $('.tpl-ctacallout a').show();
                    $('.tpl-ctacallout .message').hide();
                } else {
                    // Post to activate page.
                    // Create DOM Form.
                    var $form = $('<form />');

                    // ACTION and METHOD
                    $form.attr('action', '/activate/signin').attr('method', 'POST');

                    console.log(data);

                    // DATA
                    var $lastname = $('<input type="hidden"/>').attr('name', 'LastName').val(data.lastName);
                    var $firstname = $('<input type="hidden"/>').attr('name', 'FirstName').val(data.firstName);
                    var $country = $('<input type="hidden"/>').attr('name', 'Country').val(user.country);
                    var $barcode = $('<input type="hidden"/>').attr('name', 'Barcode').val(data.barcodeId);
                    var $email = $('<input type="hidden"/>').attr('name', 'Email').val(data.emailAddress);

                    $form.append($lastname);
                    $form.append($firstname);
                    $form.append($country);
                    $form.append($barcode);
                    $form.append($email);

                    // Submit
                    $('body').append($form);
                    $form.submit();

                }
            },
            error: function () {
                loaderAndError.hideLoader();
                $('.tpl-ctacallout .message').hide();
                $('.tpl-ctacallout a').show();
            }
        });
    };

    Join.ThankYouPage.init = function () {
        var user = {
            'barcode': transactionDetail.Barcode,
            'country': transactionDetail.Country,
            'lastName': transactionDetail.LastName
        };

        $('.tpl-ctacallout a').hide();

        $('.tpl-ctacallout').append('<p class="message"><strong>Please wait while we set up your online account</strong></p>');

        var loaderAndError = EQ.Helpers.loaderAndErrorHandler($('.tpl-ctacallout'), {
            type: 'popup'
        });

        loaderAndError.showLoader();

        setTimeout(function () {
            Join.ThankYouPage.ActivateAccount(user, loaderAndError);
        }, 10000); // Timeout to compensate for resgistration async web service
    };

}(window, window.App));
