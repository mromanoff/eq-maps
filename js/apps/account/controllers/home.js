/* global define, Backbone, Marionette, App, consts */

define(function (require, exports, module) {
    'use strict';

    var Marionette      = require('marionette');
    var BillingModel    = require('account/models/billing');
    var MembershipModel = require('account/models/membership');
    var Model           = require('account/models/home');
    var View            = require('account/views/home');
    var Core            = require('core/app');

    /**
     * Account Homepage Controller
     *
     * Controller used to manage everything for the account homepage
     *
     * @augments Backbone.Controller
     * @name HomeController
     * @module HomeController
     * @namespace Account.AppController.HomeController
     */
    var Controller = Marionette.Controller.extend({

        /**
         * Init
         *
         * @name AccountHomeController#init
         * @function
         * @public
         */
        init: function(id) {
            var model, view;

            var billingModel = new BillingModel();
            var membershipModel = new MembershipModel();
            var isUS = window.userProfileJson.SourceSystem === 1;

            if (id) {
                billingModel.url = consts.MOCKS + '/billing/' + id + '.json';
            }

            model = new Model();
            view  = new View({ model: model });

            membershipModel.fetch()
                .done(function(data){
                    model.set(data);
                    Core.vent.trigger('account:membership:data:success');
                })
                .fail(function(){
                    Core.vent.trigger('account:membership:data:fail');
                });

            if(isUS) {
                billingModel.fetch()
                    .done(function (data) {
                        model.set(data);
                        Core.vent.trigger('account:billing:data:success');
                    })
                    .fail(function(obj){
                        model.set({errorMessage: obj.responseJSON.message});
                        Core.vent.trigger('account:billing:data:fail');
                    });
            } else {
                Core.vent.trigger('account:billing:data:fail');
            }

            Core.addRegions({ mainRegion: Core.el });
            Core.mainRegion.show(view);

        }

    });

    module.exports = Controller;
});