(function(global, App) {
    "use strict";
    var Twitter = {};
    Twitter.init = function($el) {
        var $dom = $el.find(".twitter-message"), url = APIEndpoint + "/social/twitter/tweets?maxTweets=20";
        $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function(tweets) {
                tweets.some(function(tweet) {
                    if (tweet.text && tweet.text.indexOf("@") === -1) {
                        var tweetTime = moment(tweet.dateCreatedLocal), diff = moment().diff(tweetTime);
                        var links = tweet.text.match(/(http:\/\/t.co\/[a-zA-Z0-9\-\.]*)/gi);
                        if (links && links.length > 0) {
                            links.forEach(function(link) {
                                tweet.text = tweet.text.replace(link, '<a target="_blank" href="' + link + '">' + link + "</a>");
                            });
                        }
                        $dom.prepend("<p>" + tweet.text + "</p>" + '<p class="date">' + moment.duration(-diff, "milliseconds").humanize(true) + "</p>");
                        return true;
                    }
                });
            }
        });
    };
    App.Components.twitter = function($el) {
        Twitter.init($el);
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
