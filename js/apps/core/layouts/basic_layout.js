define(['marionette', 'text!core/templates/mainTemplate.tpl'], function (Marionette, mainTemplate) {
    
    BasicLayout = Backbone.Marionette.Layout.extend({
        
        template: mainTemplate,
        
        regions: {
            mainRegion: "#app-main"
        }
        
    });
    
    return BasicLayout;
});