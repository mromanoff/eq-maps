define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Marionette  = require('marionette');
    var BasicLayout = require('layouts/BasicLayout');
    
    var AppController = Marionette.Controller.extend({
        
        doSomething: function() {
            var model, view, layout;
            
            model  = new Backbone.Model({name: 'Account & Billing Section'}); 
            view   = new CreditCardFieldsView({ model: model });
            layout = new BasicLayout();
            
            App.addRegions({ mainRegion: "#main" });
            App.mainRegion.show(view);
        },
        
        initialize: function(options) {        
            console.log('controller initd');
        }
        
    });
    
    module.exports = AppController;
});