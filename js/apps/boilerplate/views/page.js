define(function (require, exports, module) {
    'use strict';

    var Marionette   = require('marionette');
    var BossView     = require('bossview');
    var PartialView1 = require('views/partial1');
    var PartialView2 = require('views/partial2');

    /**
     * Sample Page "Master" View
     *
     * This is the master view that can load other partials/subviews
     *
     * @name Page
     * @class PageView
     * @return view
     */
    var PageView = Marionette.BossView.extend({

        // template for this view
        template: function() {
            return '<div class="page-view"></div><form class="large white"></form>'
        },

        subViews: {

            // pass view straight
            partial1: PartialView1,

            // assign something to the view before rendering it
            partial2: function(){
                return new PartialView2({  model: this.model });
            }
        },

        /**
         * subViewContainers
         *
         * Dump the subviews in the following areas of this view's template
         */
        subViewContainers: {
            partial1: '.page-view',
            partial2: '.page-view'
        }

    });

    module.exports = PageView;
});