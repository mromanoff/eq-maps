(function (global, App) {
    'use strict';

    /* global debug, EQ*/

    var User = App.Pages.User = {},
        $forgotUserForm = $('.recover-username'),
        $changeusernameForm = $('.change-username'),
        $verifyUserNameForm = $('.verify-username'),
        $spaMemberUpgrade = $('.spa-member-upgrade');

    User.Forgot = {};
    User.ChangeUserName = {};
    User.VerifyUserName = {};
    User.SpaMemberUpgrade = {};

    User.Forgot.debug = function () {
        debug('[forgotUser] Init');
        User.Forgot.bind();
    };

    User.Forgot.bind = function () {
        var that = User.Forgot;

        $forgotUserForm.on('submit', function (e) {
            e.preventDefault();
            that.validateAndSubmit();
        });
    };

    User.Forgot.validateAndSubmit = function () {
        if ($forgotUserForm.data('publicMethods').isValid()) {
            $forgotUserForm.data('publicMethods').sendAjaxRequest({
                'country': 'country',
                'barcode': 'RecoverUserName.Barcode',
                'lastName': 'RecoverUserName.LastName'
            },
            function (data) {
                debug('[forgotUser] Callback');
                $('.user-recover-confirmation').removeClass('hidden');

                window.track('regForgotUsername');
                debug('[regForgotUsername] tracking event for regForgotUsername');

                $('.confirmation-message-module')
                    .data('templateData', { 'firstName': data.firstName, 'email': data.email })
                    .data('publicMethods').render();

                //Hide form, title and extras.
                $forgotUserForm
                    .add('.tpl-subtitleparagraphcallout.dtm-user-subtitleparagraphcallout')
                    .add('.lost-credentials')
                    .addClass('hidden');

                $('body, html').animate({ scrollTop: 0 });
            });
        }
    };

    User.ChangeUserName.init = function () {
        debug('[changeUserName] Init');
        User.ChangeUserName.bind();
    };

    User.ChangeUserName.bind = function () {
        var that = User.ChangeUserName;

        $changeusernameForm.on('submit', function (e) {
            e.preventDefault();
            that.validateAndSubmit();
        });
    };

    User.ChangeUserName.validateAndSubmit = function () {
        if ($changeusernameForm.data('publicMethods').isValid()) {
            $changeusernameForm.data('publicMethods').sendAjaxRequest({
                'email': 'LoginWithEmailForm.EmailLabel',
                'password': 'password',
                'username': 'username'
            },
            function () {
                var $confirmationBox = $('.change-username-confirmation'),
                    mail = $changeusernameForm.data('publicMethods').getData()['LoginWithEmailForm.EmailLabel'];

                $confirmationBox.removeClass('hidden');
                $confirmationBox.find('.user-email').text(mail);

                //Hide form, title and extras.
                $changeusernameForm
                    .add('.tpl-subtitleparagraphcallout.dtm-password-subtitleparagraphcallout')
                    .addClass('hidden');

                $('body, html').animate({ scrollTop: 0 });
            });
        }
    };


    User.VerifyUserName.init = function () {
        debug('[verifyUserName] Init');
        User.VerifyUserName.bind();
    };

    User.VerifyUserName.bind = function () {
        var that = User.VerifyUserName;

        $verifyUserNameForm.on('submit', function (e) {
            e.preventDefault();
            that.validateAndSubmit();
        });
    };

    User.VerifyUserName.validateAndSubmit = function () {
        if ($verifyUserNameForm.data('publicMethods').isValid()) {
            $verifyUserNameForm.data('publicMethods').sendAjaxRequest({
                'url': 'SumbitEmailModel.Token',
                'password': 'SumbitEmailModel.Password'
            },
            function () {
                if (window.EQ.Helpers.readCookie('from_ios') === 'true') {
                    window.EQ.Helpers.tryFastAppSwitch();
                }
                EQ.Helpers.refreshUserCacheData(function () { global.location.href = decodeURIComponent(EQ.Helpers.getQueryStringVariable('ReturnUrl') || '/'); });
            });
        }
    };

    User.SpaMemberUpgrade.init = function () {
        debug('[SpaMemberUpgrade] Init');
        User.SpaMemberUpgrade.bind();
    };

    User.SpaMemberUpgrade.bind = function () {
        var that = User.SpaMemberUpgrade;

        $spaMemberUpgrade.on('submit', function (e) {
            e.preventDefault();
            that.validateAndSubmit();
        });
    };

    User.SpaMemberUpgrade.validateAndSubmit = function () {
        if ($spaMemberUpgrade.data('publicMethods').isValid()) {
            $spaMemberUpgrade.data('publicMethods').sendAjaxRequest({
                'userId': 'userId',
                'country': 'country',
                'barcode': 'SpaForm.BarcodeLabel',
                'lastName': 'SpaForm.LastNameLabel'
            },
                function () {
                    // Redirect to homepage on success or the ReturnUrl querystring
                    global.location.href = decodeURIComponent(EQ.Helpers.getQueryStringVariable('ReturnUrl') || '/');
                });
        }
    };

}(window, window.App));