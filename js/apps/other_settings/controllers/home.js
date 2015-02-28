/* global define, Backbone, Marionette, App, consts */

define(function (require, exports, module) {
    'use strict';

    var Core            = require('core/app');
    var Marionette      = require('marionette');
    var Model           = require('other_settings/models/home');
    var View            = require('other_settings/views/home');
    var NPStatusModel   = require('other_settings/models/netpulse/status');

    /**
     * Other Settings Homepage Controller
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
        init: function() {
            var model, view, npStatusModel;

            model = new Model();
            view  = new View({ model: model });

            Core.addRegions({ mainRegion: Core.el });
            Core.mainRegion.show(view);

        }

    });

    module.exports = Controller;
});