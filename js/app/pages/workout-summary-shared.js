(function (App) {
    'use strict';
    
    /* global EQ, user */
    
    App.Pages.WorkoutSummaryShared = {
        init : function (shareID) {
            $('.rank-num sup').text(function () {
                return EQ.Helpers.ordinate(parseInt($(this).parent().text(), 10)).ord;
            });

            if (user !== null) {
                $('.member').removeClass('hidden');
            } else {
                $('.non-member').removeClass('hidden');
                if (user.ShareId === shareID) {
                    $('.g-pronoun').text('You');
                }
            }
        }
    };

}(window.App));