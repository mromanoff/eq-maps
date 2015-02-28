(function (global, App) {
    'use strict';

    /* global APIEndpoint, debug, FB, EQ */

    var ConnnectAccounts = App.Pages.ConnnectAccounts = {},
        $loginForm = $('form.login');

    ConnnectAccounts.validateAndSubmit = function () {
        if ($loginForm.data('publicMethods').isValid()) {
            App.Pages.ConnnectAccounts.getToken(function (token) {
                $loginForm.data('publicMethods').sendAjaxRequest({
                    'username': 'email',
                    'password': 'password',
                    'persistLogin': true
                },
                function (data, textStatus, jqXHR) {
                    // Redirect to homepage on success or the ReturnUrl querystring
                    if (jqXHR.status === 202) {
                        //data.code === 0 for legacy User and data.code === 1 for SPA user
                        if (data.code === 'LegacyUser') {
                            ConnnectAccounts.ChangeLegacyUserName(data);
                            return;
                        }
                        if (data.code === 'SpaOnlyUser') {
                            $('.is-error').removeClass('hidden')
                                .html(data.reasonPhrase.replace('{signin}', '<a href="/login">sign in</a>'));
                            return;
                        }
                    }
                    var facebookToken = {
                        'facebookAccessToken': token
                    };
                    $.ajax(APIEndpoint + '/registration/linkwithfacebook', {
                        data: JSON.stringify(facebookToken),
                        contentType: 'application/json',
                        type: 'POST',
                        xhrFields: {
                            withCredentials: true
                        }
                    })
                    .done(function () {
                        //TODO :  omniture calls for connect FB account to EQ account.
                        if (typeof (window.track) === 'function') {
                            window.track('regConnectedWithFB');
                        }
                        debug('[Connect] Ready');

                        //Hack to refresh user cached data.
                        EQ.Helpers.refreshUserCacheData(function () {
                            var returnUrl = window.returnUrl || '/';
                            global.location.href = returnUrl;
                        });

                        

                    }).fail(function (jqXHR) {
                        var errorText = jqXHR.responseJSON && jqXHR.responseJSON.message;
                        debug('[FBLogin] Failed', errorText);
                        if (errorText) {
                            $('.is-error').removeClass('hidden')
                                .text(errorText);
                        }
                    });
                });
            });
        }
    };
    ConnnectAccounts.getToken = function (cb) {
        FB.login(function (response) {
            if (response.status === 'connected') {
                cb(response.authResponse.accessToken);
            }
        }, {
            scope: 'email,user_likes,user_friends'
        });
    };
    ConnnectAccounts.init = function () {
        debug('[Connect] Init');

        //// global.user goes null if not loggedin.
        //if (typeof global.user !== 'undefined' && !!global.user) {
        //    global.location.href = '/';
        //}

        $loginForm.on('submit', function (e) {
            e.preventDefault();
            ConnnectAccounts.validateAndSubmit();
        });

        $loginForm.on('click', '#changeUsername', function (e) {
            e.preventDefault();
            ConnnectAccounts.ChangeLegacyUserName($(this).data());
        });

    };

    ConnnectAccounts.ChangeLegacyUserName = function (data) {
        // Create DOM Form.
        var $form = $('<form />');

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

}(window, window.App));
