define(function (require, exports, module) {
    'use strict';

    var Core       = require('core/app');
    var Marionette = require('marionette');
    var PageModel  = require('models/renewals');
    var PageView   = require('views/renewals');

    /**
     * Sample Page Controller
     *
     * This is a sample PageController for a page. This controller should be called
     * from within the AppController. The reason behind this controller being called
     * from within the AppController is to allow for onDemand file loading of individual
     * pages.
     *
     * @augments Backbone.Model
     * @name PageController
     * @class PageController
     * @return model
     */
    var PageController = Marionette.Controller.extend({

        /**
         * Init
         *
         * @name PageController#init
         * @function
         * @public
         */
        init: function() {
            var model, view;

            model = new PageModel();
            view  = new PageView({ model: model });

            Core.addRegions({ mainRegion: Core.el });
            Core.mainRegion.show(view);
        }

    });

    module.exports = PageController;
});