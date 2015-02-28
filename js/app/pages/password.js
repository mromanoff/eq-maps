(function (global, App) {
    'use strict';

    /* global debug */

    var Password = App.Pages.Password = {},
        $forgotPasswordForm = $('.recover-password'),
        $resetPasswordForm = $('.reset-password');

    Password.Forgot = {};
    Password.Reset = {};

    /**
    * FORGOT Password Screen
    */

    Password.Forgot.init = function () {
        debug('[forgotPassword] Init');
        Password.Forgot.bind();
    };

    Password.Forgot.bind = function () {
        var that = Password.Forgot;

        $forgotPasswordForm.on('submit', function (e) {
            e.preventDefault();
            that.validateAndSubmit();
        });
    };

    /**
    * Validate the fields and make the request if everything is ok.
    */
    Password.Forgot.validateAndSubmit = function () {
        if ($forgotPasswordForm.data('publicMethods').isValid()) {
            $forgotPasswordForm.data('publicMethods').sendAjaxRequest(
                {'email': 'RecoverPassword.UserName'},
                function () {
                    var $confirmationBox = $('.password-recover-confirmation'),
                        mail = $forgotPasswordForm.data('publicMethods').getData()['RecoverPassword.UserName'];

                    $confirmationBox.removeClass('hidden');
                    debug('[regForgotPWEmlSent] Success fully retrived');
                    window.track('regForgotPWEmlSent');

                    $confirmationBox.find('.user-email').text(mail);

                    //Hide form, title and extras.
                    $forgotPasswordForm
                        .add('.lost-credentials')
                        .add('.tpl-subtitleparagraphcallout.dtm-password-subtitleparagraphcallout')
                        .addClass('hidden');

                    $('body, html').animate({scrollTop: 0});
                });
        }
    };

    /**
    * RESET Password Screen
    */

    Password.Reset.init = function () {
        debug('[resetPassword] Init');
        Password.Reset.bind();
    };

    Password.Reset.bind = function () {
        var that = Password.Reset;

        $resetPasswordForm.on('submit', function (e) {
            e.preventDefault();
            that.validateAndSubmit();
            debug('[validateAndSubmit] called');
        });
    };

    /**
    * Validate the fields and make the request if everything is ok.
    */
    Password.Reset.validateAndSubmit = function () {
        if ($resetPasswordForm.data('publicMethods').isValid()) {
            $resetPasswordForm.data('publicMethods').sendAjaxRequest({
                'url': 'ResetPassword.url',
                'lastName': 'ResetPassword.LastName',
                'password': 'ResetPassword.NewPassword'
            },
            function () {
                // Redirect to homepage on success
                global.location.href = '/';
            });
        }
    };

} (window, window.App));