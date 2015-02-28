(function (global, App) {
    'use strict';
    /* global APIEndpoint, debug */

    var Rewards = App.Pages.Rewards = {},
        TempResponce;

    Rewards.$view = {
        details: $('#rewardDetails'),
        history: $('#rewardHistory')
    };

    Rewards.printGiftCard = function ($el) {
        debug('[Rewards] print gift card', $el);
        // open in new window.
        window.open(APIEndpoint + $el.data('url'));

    };

    Rewards.activateGiftCard = function ($el) {
        debug('[Rewards] activate Gift Card', $el);

        if ($el.data('is-clicked')) {
            return;
        }

        $el.data('is-clicked', true);

        var options = {
            url: $el.data('url'),
            method: $el.data('method'),
            data: {
                id: $el.data('id')
            },
            el: $el,
            title: $el.html(),
            callback: function () {
                Rewards.reloadPage();
                if (TempResponce) {
                    window.open(APIEndpoint + '/me/rewards/giftcard/print?gcNumber=' + TempResponce.encryptGiftCardNumber, '_blank');
                    window.focus();
                }
            }
        };
        $el.html('Processing please wait...');
        this.ajaxManager(options);
    };

    Rewards.withdrawPass = function ($el) {
        debug('[Rewards] withdraw pass', $el);
        var options = {
            url: $el.data('url'),
            method: $el.data('method'),
            data: {
                id: $el.data('id')
            },
            callback: function () {
                Rewards.reloadPage();
            }
        };

        this.ajaxManager(options);
    };



    Rewards.ajaxManager = function (options) {
        options = options || {};
        $.ajax(this.ENDPOINT + options.url, {
            data: JSON.stringify(options.data),
            contentType: 'application/json',
            type: options.method,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true
        })
            .done(function (response) {
                TempResponce = response;
                options.callback(response);

            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                options.el.html(options.title);
                debug('[Rewards] Error', jqXHR, textStatus, errorThrown);
                Rewards.error(jqXHR, textStatus, errorThrown);
            });
    };

    Rewards.error = function (jqXHR, textStatus, errorThrown) {
        debug('[Rewards] error', jqXHR, textStatus, errorThrown);
        //window.location.href = '/error';
        var response = JSON.parse(jqXHR.responseText);

        console.log('message', response);
        Rewards.$view.details.html('<h2 class="title paragraph">' + response.error.message + '</h2>');
    };

    Rewards.reloadPage = function () {
        location.reload(true);
    };

    Rewards.bind = function () {
        this.$view.details.on('click', '.print', function (e) {
            e.preventDefault();
            Rewards.printGiftCard($(e.currentTarget));
        });

        this.$view.details.on('click', '.activate', function (e) {
            e.preventDefault();
            Rewards.activateGiftCard($(e.currentTarget));
        });

        this.$view.history.on('click', '.withdraw', function (e) {
            e.preventDefault();
            Rewards.withdrawPass($(e.currentTarget));
        });
    };

    Rewards.init = function () {
        Rewards.ENDPOINT = APIEndpoint;
        Rewards.bind();
    };
}(window, window.App));