(function (global, App) {
    'use strict';

    /* global debug */

    var CreateAccount = App.Pages.CreateAccount = {},
        $createAccountForm = $('.create-account');

  
    CreateAccount.init = function () {
        debug('[CreateAccount] Init');
        CreateAccount.bind();
    };

    CreateAccount.bind = function () {
        var that = CreateAccount;

        $createAccountForm.on('submit', function (e) {
            e.preventDefault();
            that.validateAndSubmit();
        });
    };

    CreateAccount.validateAndSubmit = function () {
        if ($createAccountForm.data('publicMethods').isValid()) {
            $createAccountForm.data('publicMethods').sendAjaxRequest({
                'email':  'Create.Email',
                'password': 'Create.Password',
                'sourceSystem': 'Create.Country',
                'lastName': 'Create.LastName',
                'firstName' : 'Create.FirstName',
                'barcodeId': 'Create.BarcodeId'
            },
            function () {
                console.log($createAccountForm.find('input[name="Create.Email"]').val());
                //TODO: What about errors?
                var userModel = {
                    'email': $createAccountForm.find('input[name="Create.Email"]').val()
                };
                debug('[CreateAccount] Callback');
                $('.user-recover-confirmation').removeClass('hidden');
                var $confirmationModule = $('.confirmation-message-module');
                $confirmationModule.data('templateData', userModel);
                $confirmationModule.data('publicMethods').render();
                window.track('regSignupVerifEmlSent');

                //Hide form, title and extras.
                $createAccountForm
                    .add('.tpl-subtitleparagraphcallout.dtm-user-subtitleparagraphcallout')
                    .add('.create-acount-mail-sent')
                    .addClass('hidden');

                $('body, html').animate({ scrollTop: 0 });
            });
            //TODO: omniture call for EQ account
            //window.tagData = window.tagData || {};
            //window.tagData.registration = {
            //    success: 'true',
            //    type: 'eq'
            //};
            //window.track('registration', window.tagData.registration);
        }
    };

} (window, window.App));