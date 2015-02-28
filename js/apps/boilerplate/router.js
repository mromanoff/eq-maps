define(["marionette", "controllers/app"], function (Marionette, AppController) {
    
    var Router = Marionette.AppRouter.extend({
        
        controller: new AppController(),
        
        appRoutes: {
            'billing/overview':     'billingOverview', 
            'billing/edit':         'billingEdit',     
            'billing/confirmation': 'billingConfirmation' 
        },
        
        
    });
    
    return Router;
});