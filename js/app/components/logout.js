(function (App) {
    'use strict';

    /* global debug, APIEndpoint, EQ*/
    // TODO: WHY THE LOCAL COOKIES? check after logout is done. (Martin comment)

    App.logout = function () {
        // Invalidate favs localStorage cache
        EQ.Helpers.user.invalidateFavoritesCache();
        debug('logout starts');
        $.ajax(APIEndpoint + '/authentication/logout', {
            type: 'POST',
            xhrFields: {
                withCredentials: true
            }
        })
        .done(function () {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var equals = cookies[i].indexOf('=');
                var name = equals > -1 ? cookies[i].substr(0, equals) : cookies[i];
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
            EQ.Helpers.createCookie('IsFBLogin', '', -1);
            window.location.href = '/';
        })
        .fail(function (jqXHR) {
            debug('[Login] Logging out failed!');
            if (jqXHR.status === 401) {
                // If the state is unauthorized it means that the session is already expired, so we redirect to the home.
                window.location.href = '/';
            }
            else {
                console.log(JSON.stringify(jqXHR));
                //window.location.href = '/';
            }
        });
    };

    /**
     * Logout link
     */
    App.Components.logout = function ($el) {
        if ($el.length) {
            debug('[Logout] Link binded');

            $el.on('click', function (evt) {
                evt.preventDefault();
                App.logout();
            });
        }
    };

}(window.App));