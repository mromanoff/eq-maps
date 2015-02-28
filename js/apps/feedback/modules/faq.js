define(function (require, exports, module) {
    'use strict';

    var App = require('app');

    var FAQ = Backbone.View.extend({
        el: $('#faqSection'),

        events: {
            'click #browse': 'browseFAQ'
        },
        
        browseFAQ: function (e) {
            var $faq = $('.html-callout');
            var $browseSign = $('#browseSign');
            var sign;
            
            if ($faq.is(":visible")) {
                $faq.hide();
                sign = "+";
            } else {
                $faq.show();
                sign = "&mdash;";
            }
            
            $browseSign.html(sign);
        }
    });

    return FAQ;
});
