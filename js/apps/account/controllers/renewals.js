define(function (require, exports, module) {
    'use strict';

    var Core            = require('core/app');
    var Marionette      = require('marionette');
    var PTRenewalsModel = require('models/renewals');
    var PTRenewalsView  = require('views/renewals');

    /**
     * PT Renewals Controller
     *
     * Controller used to manage everything for the pt renewal page
     *
     * @augments Backbone.Model
     * @name PTRenewals
     * @class PTRenewalsController
     * @return model
     */
    var PTRenewalsController = Marionette.Controller.extend({

        /**
         * Init
         *
         * @name PTRenewalsController#init
         * @function
         * @public
         */
        init: function() {
            var model, view;

            model = new PTRenewalsModel();
            view  = new PTRenewalsView({ model: model });

            Core.addRegions({ mainRegion: Core.el });
            Core.mainRegion.show(view);
        }

    });

    module.exports = PTRenewalsController;
});