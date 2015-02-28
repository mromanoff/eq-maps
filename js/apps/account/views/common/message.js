/* global define, moment, Marionette, _ */

define(function (require, exports, module) {
    'use strict';

    require('momentjs');

    var Core       = require('core/app');
    var Template   = require('text!templates/common/message.tpl');

    /**
     * Partial View Sample
     *
     * Regular Marionette ItemView Partial
     *
     * @name Partial1
     * @class PartialView1
     * @return view
     */
    var View = Marionette.ItemView.extend({

        template: _.template(''),

        /**
         * create
         *
         * If API succeeds, then show this view
         */
        create: function() {
            this.template = _.template(Template);
            this.render();
        },

        /**
         * destroy
         *
         * If for whatever reason the API fails, destroy this view and show nothing
         */
        destroy: function() {
            this.remove();
        },

        /**
         * initialize
         *
         * First thing we do is listen for changes and based on that we either populate
         * the view with an actual template and show to the user. If for whatever reason
         * it fails, then destroy this view and show nothing
         */
        initialize: function() {
            var that = this;

            Core.vent.on('account:billing:data:success', function() {
                that.destroy();
            });

            Core.vent.on('account:billing:data:fail', function() {
                that.create();
            });
        }

    });

    module.exports = View;
});