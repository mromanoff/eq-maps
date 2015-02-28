(function(App) {
    "use strict";
    App.Components["plan-terms"] = function($el, options) {
        var loaderAndError = EQ.Helpers.loaderAndErrorHandler($el.find(".terms-detail"));
        loaderAndError.showLoader();
        debug("[TERMS LOADING]", options);
        $.ajax({
            type: "GET",
            url: APIEndpoint + "/registration/residential/terms/" + options.facilityId + "?culture=" + options.culture,
            contentType: "application/json",
            dataType: "json",
            success: function(data) {
                debug("[TERMS OK]", data);
                loaderAndError.hideLoader();
                if (data.result.result === null) {
                    loaderAndError.showError();
                } else {
                    $(".terms-detail").html(data.result.result);
                }
            },
            error: function(d) {
                debug("server error", d.responseJSON);
                loaderAndError.showError();
            }
        });
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
