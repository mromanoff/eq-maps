(function (App) {
    /* global APIEndpoint, debug, EQ */
    'use strict';
   
    App.Components['plan-terms'] = function ($el, options) {

        // Loader init
        
        var loaderAndError = EQ.Helpers.loaderAndErrorHandler($el.find('.terms-detail'));
        loaderAndError.showLoader();
       
        debug('[TERMS LOADING]', options);
        $.ajax({
            type: 'GET',
            url: APIEndpoint + '/registration/residential/terms/' + options.facilityId + '?culture=' + options.culture,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                debug('[TERMS OK]', data);
                loaderAndError.hideLoader();
                if (data.result.result === null) {
                    loaderAndError.showError();
                }
                else {
                    $('.terms-detail').html(data.result.result);
                }
            },
            error: function (d) {
                debug('server error', d.responseJSON);
                loaderAndError.showError();
            }
        });
    };


}(window.App));