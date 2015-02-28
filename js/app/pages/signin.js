(function (global, App) {
    'use strict';

    /* global debug, APIEndpoint */

    var SignIn = App.Pages.SignIn = {},
        //TODO: Better way to do this? Cookies on session BE?
        $userInformation = $('.tpl-memberimagetextcallout div').data('template-data'),
        $eqxSignInButton = $('.eq-sign-in'),
        $signupfacebookwithoutemailForm = $('.signup-facebook-withoutemail');

    SignIn.FacebookWithOutEmail = {};

    SignIn.init = function () {
        debug('[SignIn] Init');
        console.log($userInformation);
        SignIn.bind();
    };

    SignIn.bind = function () {
        var that = SignIn;

        this.fbLogin.bind();

        $eqxSignInButton.on('click', function (e) {
            e.preventDefault();
            that.submit();
        });
    };

    /* global FB */
    SignIn.fbLogin = {
        bind: function () {
            $('.fb-login').on('click', SignIn.fbLogin.intent.bind(SignIn.fbLogin));
        },
        intent: function () {
            // TODO: show spinning wheel while requesting.
            window.track('regSignupWithFB');
            this.getToken(function (token) {
                debug('FBT:', token);

                var userInfo = {
                    barcodeId: $userInformation.BarcodeId,
                    fbAccessToken: token,
                    sourceSystem: $userInformation.SourceSystem,
                    lastName: $userInformation.LastName,
                    firstName: $userInformation.FirstName
                };

                $.ajax(APIEndpoint + '/registration/signupwithfacebook', {
                    data: JSON.stringify(userInfo),
                    contentType: 'application/json',
                    type: 'POST',
                    xhrFields: {
                        withCredentials: true
                    }
                })
                .done(function () {
                    debug('[FB SignUP] Success');

                    //window.tagData = window.tagData || {};
                    //window.tagData.registration = {
                    //    success: 'true',
                    //    type: 'fb'
                    //};
                    //window.track('registration', window.tagData.registration);

                    //TODO: We need to isolate this
                    $.ajax(APIEndpoint + '/authentication/fblogin', {
                        data: {
                            accessToken: userInfo.fbAccessToken
                        },
                        type: 'POST',
                        xhrFields: {
                            withCredentials: true
                        }
                    })
                    .done(function () {
                        debug('[FBLogin] Success');

                        // Set cookie for omniture tagging
                        var date = new Date();
                        date.setTime(date.getTime() + (20 * 60 * 1000)); // 20 minutes for cookie to expire
                        $.cookie('isMemberRegisteredFB', 'true', { expires: date, path: '/' });

                        // Redirect to homepage on success
                        global.location.href = '/'; //'/questionnaire/start';
                    })
                    .fail(function (jqXHR) {
                        var errorText = jqXHR.responseJSON && jqXHR.responseJSON.message;
                        debug('[FBLogin] Failed', errorText);
                        if (errorText) {
                            $('.is-error').removeClass('hidden')
                                .text(errorText);
                        }

                    });
                })
                .fail(function (jqXHR) {
                    if (jqXHR.responseJSON.messageId === 40021)
                    {
                        return SignIn.redirectToFacebookWithSigninEmail(userInfo);
                    }

                    var errorText = jqXHR.responseJSON && jqXHR.responseJSON.message;
                    debug('[FBLogin] Failed', errorText);
                    if (errorText) {
                        $('.is-error').removeClass('hidden')
                            .text(errorText);
                    }
                });
            });
        },
        getToken: function (cb) {
            FB.login(function (response) {
                if (response.status === 'connected') {
                    cb(response.authResponse.accessToken);
                }
            }, {
                scope: 'email,user_likes,user_friends'
            });
        }
    };

    SignIn.submit = function () {
      
        // Create DOM Form.
        var $form = $('<form></form>');

        // ACTION and METHOD
        $form.attr('action', '/activate/signin/equinox').attr('method', 'POST');

        //From Current Form
        var $country = $('<input type="hidden"/>').attr('name', 'LastName').val($userInformation.LastName);
        var $lastName = $('<input type="hidden"/>').attr('name', 'Country').val($userInformation.SourceSystem);
        var $barcode = $('<input type="hidden"/>').attr('name', 'Barcode').val($userInformation.BarcodeId);

        $form.append($country);
        $form.append($lastName);
        $form.append($barcode);

        // Submit
        $('body').append($form);
        $form.submit();
        
    };

    SignIn.redirectToFacebookWithSigninEmail = function (data) {

        // Create DOM Form.
        var $form = $('<form></form>');
            
        // ACTION and METHOD
        $form.attr('action', '/activate/signin/facebook/email').attr('method', 'POST');

        //From Current Form
        var $country = $('<input type="hidden"/>').attr('name', 'LastName').val(data.lastName);
        var $firstName = $('<input type="hidden"/>').attr('name', 'FirstName').val(data.firstName);
        var $lastName = $('<input type="hidden"/>').attr('name', 'Country').val(data.sourceSystem);
        var $barcode = $('<input type="hidden"/>').attr('name', 'Barcode').val(data.barcodeId);
        var $fbAccessToken = $('<input type="hidden"/>').attr('name', 'FbToken').val(data.fbAccessToken);

        $form.append($country);
        $form.append($lastName);
        $form.append($firstName);
        $form.append($barcode);
        $form.append($fbAccessToken);

        // Submit
        $('body').append($form);
        $form.submit();

    };



    SignIn.FacebookWithOutEmail.init = function () {
        debug('[FacebookWithOutEmail] Init');
        SignIn.FacebookWithOutEmail.bind();
    };

    SignIn.FacebookWithOutEmail.bind = function () {
        var that = SignIn.FacebookWithOutEmail;

        $signupfacebookwithoutemailForm.on('submit', function (e) {
            e.preventDefault();
            that.validateAndSubmit();
        });
    };

    SignIn.FacebookWithOutEmail.validateAndSubmit = function () {
        if ($signupfacebookwithoutemailForm.data('publicMethods').isValid()) {
            $signupfacebookwithoutemailForm.data('publicMethods').sendAjaxRequest({
                'sourceSystem': 'country',
                'barcodeId': 'barcode',
                'lastName': 'lastName',
                'FacebookAccessToken': 'fbAccessToken',
                'email': 'EmailForm.EmailLabel'
            },
                function () {
                    // Redirect to homepage on success or the ReturnUrl querystring
                    var $confirmationBox = $('.facebook-confirmation'),
                         mail = $signupfacebookwithoutemailForm.data('publicMethods').getData()['EmailForm.EmailLabel'];

                    $confirmationBox.removeClass('hidden');
                    $confirmationBox.find('.user-email').text(mail);

                    //Hide form, title and extras.
                    $signupfacebookwithoutemailForm
                        .add('.lost-credentials')
                        .add('.tpl-subtitleparagraphcallout.dtm-password-subtitleparagraphcallout')
                        .addClass('hidden');

                    $('body, html').animate({ scrollTop: 0 });
                });
        }
    };

} (window, window.App));