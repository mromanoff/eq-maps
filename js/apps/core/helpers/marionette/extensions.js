define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');

    /**
     * Marionette Region Open
     *
     * Override Marionette's Region.open() so we can add transitions
     * and scroll all the way to the top again
     *
     * @param view
     */
    Marionette.Region.prototype.open = function(view){
        var $el = this.$el;

        //tmp
        //$('#app-main').css('background-image', 'url(https://www.boardmakerachieve.com/App_Themes/Main2_0/images/loading.gif)');
        //$('#app-main').css('background-position', 'center center');
        //$('#app-main').css('background-repeat', 'no-repeat');

        $el.animate({ opacity: 0 }, 600, function(){
            $el.empty();
            $el.html(view.el);

            $('html, body').animate({ scrollTop: 0 }, 'slow', function(){


                //$('#app-main').css('background-image', 'none'); //tmp

                $el.animate({ opacity: 1 });
            });
        });
    };


    // this method is needed on all subapp controllers
    /*Marionette.Controller.prototype.default = function(o) {
     console.warn('default whatever', o);
     var protocol = window.location.protocol + '//';
     var host = window.location.host;
     var pathname = window.location.pathname;

     //window.location = protocol + host + pathname;
     }*/

});