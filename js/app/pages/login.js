(function (global, App) {
    'use strict';

    /* global APIEndpoint, debug, EQ, FB */

    var Login = App.Pages.Login = {},
        $loginForm = $('form.login');

    Login.validateAndSubmit = function () {
        if ($loginForm.data('publicMethods').isValid()) {

            $loginForm.data('publicMethods').sendAjaxRequest({
                'username': 'email',
                'password': 'password',
                'persistLogin': 'Login.RememberMe'
            },
            function (data, textStatus, jqXHR) {
                // Redirect to homepage on success or the ReturnUrl querystring
                if (jqXHR.status === 202) {
                    if (data.code === 'LegacyUser') {//check for legacy user
                        Login.ChangeLegacyUserName(data);
                        return;
                    }
                    if (data.code === 'SpaOnlyUser') {//check for SpaOnlyUser
                        Login.RedirectToSpaPage(data);
                        return;
                    }

                }
                
                //if returnUrl present then bypass onboarding
                var returnUrl = decodeURIComponent(EQ.Helpers.getQueryStringVariable('ReturnUrl'));
                if (returnUrl === 'false') {
                    //if hasn't answered onboarding questions yet, redirect them to questionnaire
                    var obFlag = data.hasAnsweredOnboardingQuestions || false;
                    if (!obFlag) {
                        global.location.href = '/questionnaire/start';
                    } else {
                        global.location.href = '/';
                    }
                } else {
                    global.location.href = returnUrl;
                }

            });
        }
    };

    Login.ChangeLegacyUserName = function (data) {
        // Create DOM Form.
        var $form = $('<form></form>');

        // ACTION and METHOD
        $form.attr('action', '/help/change/username').attr('method', 'POST');

        // DATA
        var $email = $('<input type="hidden"/>').attr('name', 'email').val(data.email);
        var $userName = $('<input type="hidden"/>').attr('name', 'userName').val(data.userName);


        $form.append($email);
        $form.append($userName);

        // Submit
        $('body').append($form);
        $form.submit();
    };

    Login.RedirectToSpaPage = function (data) {
        // Create DOM Form.
        var $form = $('<form />');

        // ACTION and METHOD
        $form.attr('action', '/help/upgrade/spa-member').attr('method', 'POST');

        // DATA
        var $firstName = $('<input type="hidden"/>').attr('name', 'firstName').val(data.firstName);
        var $userId = $('<input type="hidden"/>').attr('name', 'userId').val(data.userId);
        var $lastName = $('<input type="hidden"/>').attr('name', 'lastName').val(data.lastName);


        $form.append($firstName);
        $form.append($userId);
        $form.append($lastName);

        // Submit
        $('body').append($form);
        $form.submit();
    };

    /* global FB */
    Login.Facebook = {
        bind: function () {
            $('.login-facebook').on('click', Login.Facebook.intent.bind(Login.Facebook));
        },
        intent: function () {
            // TODO: show spinning wheel while requesting.

            // DTM tag for FB login click event
            window.track('regLoginWithFB');

            this.getToken(function (response) {
                debug('FBT:', response.accessToken);
                $.ajax(APIEndpoint + '/authentication/fblogin', {
                    data: {
                        accessToken: response.accessToken
                    },
                    type: 'POST',
                    xhrFields: {
                        withCredentials: true
                    }
                })
                .done(function (data, textStatus, jqXHR) {
                    //debug('[FBLogin] Success');
                    // Redirect to homepage or returnUrl on 
                    EQ.Helpers.createCookie('IsFBLogin', true, 1);
                    if (jqXHR.status === 202) {
                        if (data.code === 'LegacyUser') {//check for legacy user
                            Login.ChangeLegacyUserName(data);
                            return;
                        }
                        if (data.code === 'SpaOnlyUser') {//check for SpaOnlyUser
                            Login.RedirectToSpaPage(data);
                            return;
                        }

                    }

                    //if returnUrl present then bypass onboarding
                    var returnUrl = decodeURIComponent(EQ.Helpers.getQueryStringVariable('ReturnUrl'));
                    if (returnUrl === 'false') {
                        //if hasn't answered onboarding questions yet, redirect them to questionnaire
                        var obFlag = data.hasAnsweredOnboardingQuestions === true; //can be null
                        if (!obFlag) {
                            global.location.href = '/questionnaire/start';
                        } else {
                            global.location.href = '/';
                        }
                    } else {
                        global.location.href = returnUrl;
                    }

                })
                .fail(function (data) {
                    try {
                        var failedResponse = data.responseJSON;
                        var errorMessage = failedResponse.error ? failedResponse.error.message : failedResponse.message;
                        if (failedResponse.error.messageId === 50019) {
                            //console.log('fb failed');
                            //// Create DOM Form.
                            //var $form = $('<form></form>');

                            //// ACTION and METHOD
                            //$form.attr('action', '/login/connect').attr('method', 'POST');

                            ////From Current Form
                            ////TODO: Get Name / Last from FB
                            FB.api('/me', function (profileResponse) { // this line throws error
                            //    var $email = $('<input type="hidden"/>').attr('name', 'Email').val(profileResponse.email);
                            //    /* jshint camelcase:false */
                            //    var $firstName = $('<input type="hidden"/>').attr('name', 'FirstName').val(profileResponse.first_name);
                            //    var $lastName = $('<input type="hidden"/>').attr('name', 'LastName').val(profileResponse.last_name);
                            //    /* jshint camelcase:true */
                            //    var $fbId = $('<input type="hidden"/>').attr('name', 'FbId').val(response.userId);
                            //    var $token = $('<input type="hidden"/>').attr('name', 'Token').val(response.accessToken);

                            //    $form.append($email);
                            //    $form.append($firstName);
                            //    $form.append($lastName);
                            //    $form.append($fbId);
                            //    $form.append($token);

                            //    // Submit
                            //    $('body').append($form);
                            //    $form.submit();
                                //    //alert('success: ' + response.name);
                                /* jshint camelcase:false */
                                global.location.href = '/login/connect?firstName=' + profileResponse.first_name + '&lastName=' + profileResponse.last_name;
                                /* jshint camelcase:true */
                            });
                            
                        } else {
                            $('.is-error').text(errorMessage).removeClass('hidden');
                        }
                    } catch (e) {
                        $('.is-error').text('').addClass('hidden');
                        // Silently drop failure.
                        debug('[FormSendAjaxRequest] Error logged into Crittercism:', e, arguments);
                    }
                });
            });
        },
        getToken: function (cb) {
            FB.login(function (response) {
                if (response.status === 'connected') {
                    cb(response.authResponse);
                }
            }, {
                scope: 'email,user_likes,user_friends'
            });
        }
    };

    Login.init = function () {
        debug('[Login] Init');

        // global.user goes null if not loggedin.
        if (typeof global.user !== 'undefined' && !!global.user) {
            global.location.href = '/';
        }

        $loginForm.on('submit', function (e) {
            e.preventDefault();
            Login.validateAndSubmit();
        });

        App.Events.on('fbsdk:loaded', function () {
            Login.Facebook.bind();
        });
    };


}(window, window.App));
