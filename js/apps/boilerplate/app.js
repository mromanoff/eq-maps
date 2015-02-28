define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Marionette = require('marionette');
    var Router     = require('boilerplate/router');
    
    var App        = new Marionette.Application();
    
    App.getCurrentRoute = function(){
        return Backbone.history.fragment;
    };
    
    App.navigate = function(route, options){
        options || (options = {});
        Backbone.history.navigate(route, options);
    };

    App.on("initialize:after", function () {
        App.Router = new Router();
        
        if(Backbone.history){
            Backbone.history.start({ pushState: false });

            if(this.getCurrentRoute() === ""){
                App.trigger("account:billing");
            }
        }
    });
    
    window.App     = App;
    module.exports = App;
});

