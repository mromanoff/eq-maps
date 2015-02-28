(function(global, App) {
    "use strict";
    var LocalCurrency = {};
    LocalCurrency.init = function($el) {
        var currencySymbol = "$", contentText;
        $el.addClass("hidden");
        switch (EQ.Helpers.user.getUserCountry()) {
          case "UK":
            currencySymbol = "&pound;";
            break;

          case "CA":
            currencySymbol = "C$";
            break;
        }
        $el.each(function(index, element) {
            contentText = $(element).text();
            if (currencySymbol !== "$") {
                $el.html(contentText.replace("$", currencySymbol));
            }
            $(element).removeClass("hidden");
        });
    };
    App.Components["local-currency"] = function($el) {
        LocalCurrency.init($el);
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
