/* global define, Backbone, Marionette, App, consts */

define(function (require, exports, module) {
    'use strict';

    var Core            = require('core/app');
    var Marionette      = require('marionette');
    var Model           = require('other_settings/models/netpulse/login');
    var View            = require('other_settings/views/netpulse/login');

    /**
     * Other Settings Netpulse Signin Controller
     *
     * Controller used to manage everything for the /othersettings homepage
     *
     * @augments Backbone.Model
     * @name OtherSettingsHome
     * @class OtherSettingsHomeController
     * @return model
     */
    var Controller = Marionette.Controller.extend({

        /**
         * Access
         *
         * Only allow access to this page if the user does not have
         * already have a netpulse account
         *
         * @name OtherSettingsNetpulseRegisterController#init
         * @function
         * @public
         */
         access: function() {
             var deferred = new $.Deferred();

             var NetpulseStatus = Backbone.Model.extend({
                 url: Core.utils.getApi('/xid/account')
             });

             var netpulseStatus = new NetpulseStatus();

             netpulseStatus.fetch().then(function(data){
                 if (data.isLinked) {
                     deferred.reject('User already has a Netpulse account');
                 } else {
                     deferred.resolve();
                 }
             });

             return deferred.promise();
         },

        /**
         * Init
         *
         * @name AccountHomeController#init
         * @function
         * @public
         */
        init: function() {
            var model, view;

            $.when(this.access()).then(function(){
                model = new Model();
                view  = new View({ model: model });

                Core.addRegions({ mainRegion: Core.el });
                Core.mainRegion.show(view);

            }, function(){
                Core.other_settings.router.navigate('xid', {trigger: true});
            });

        }

    });

    module.exports = Controller;
});