/* global define, Backbone, Marionette, App, consts */

define(function (require, exports, module) {
    'use strict';

    var Core            = require('core/app');
    var Marionette      = require('marionette');
    var Model           = require('other_settings/models/netpulse/home');
    var View            = require('other_settings/views/netpulse/home');

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
         * Init
         *
         * @name AccountHomeController#init
         * @function
         * @public
         */
        init: function(options) {
            var collection, model, view;

            if (options && options.success) {
                Model.prototype.defaults.title = 'Successfully Connected!';
            }

            if(options && options.error) {
                Model.prototype.defaults.title = 'Error';
                Model.prototype.defaults.copy = $('#Xid-Error').find('.error').html() + Model.prototype.defaults.copy;
            }

            var Collection = Backbone.Collection.extend({
                model: Model,
                url: Core.utils.getApi('/xid/linkstatus')
            });

            collection = new Collection();

            collection.fetch().then(function () {
                model = new Model();

                view  = new View({collection: collection, model: collection.models[0]});

                Core.addRegions({ mainRegion: Core.el });
                Core.mainRegion.show(view);
            });


        }

    });

    module.exports = Controller;
});