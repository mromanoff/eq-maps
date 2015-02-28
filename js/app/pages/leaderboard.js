(function (global, App) {
    'use strict';

    var Leaderboard = App.Pages.Leaderboard = {};

    Leaderboard.init = function (id) {
        App.loadComponent('cycling-leaderboard', id, Leaderboard.getGender('gender'));
    };

    Leaderboard.getGender = function (name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

}(window, window.App));