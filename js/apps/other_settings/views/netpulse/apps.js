/* global, define, _ */
define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var Template1  = require('text!other_settings/templates/netpulse/home.tpl');
    var Template2  = require('text!other_settings/templates/netpulse/apps.tpl');

    var ItemView = Backbone.Marionette.ItemView.extend({

        /**
         * events
         *
         * all dom events are stored in here
         */
        events: {
            'click .lnk-unlink': 'unlink',
            'click .lnk-link': 'link'
        },

        /**
         * link
         *
         * Linking a netpulse app is really strange. First, we get some info on
         * the specific service name, then if successfull we jump to the url
         * given back by the API call which takes you to the third party service
         * where you log in or whatnot. After that, you are sent back to this page
         * again as a hard refresh to which point the link will show as active
         * from getting the api for all service status again
         *
         * @param e
         * @returns {boolean}
         */
        link: function(e) {
            e.preventDefault();

            $.ajax({
                url: APIEndpoint + '/xid/providerurl/' + this.model.get('serviceName')
            }).done(function(data) {
                var providedUrl = data.url;
                var returnUrl = encodeURIComponent(window.location.origin + '/othersettings/');

                window.location = providedUrl + returnUrl;
            });

            return false;
        },

        /**
         * unlink
         *
         * unlink service. Unlink is far more straightforward than linking as it only deals
         * with our database and no third party needs to be invoked.
         *
         * @param e
         * @returns {boolean}
         */
        unlink: function(e) {
            e.preventDefault();

            var $el = $(e.target);

            $.ajax({
                type: 'POST',
                url: APIEndpoint + '/xid/unlink/' + this.model.get('serviceName')
            }).done(function() {
                $el.removeClass('lnk-unlink white').addClass('lnk-link black').text('Link');
            });
            return false;
        },

        template: _.template(Template2),

        tagName: 'li'
    });

    /**
     * Partial View Sample
     *
     * Regular Marionette ItemView Partial. Maybe we should have this in its own file
     * for consistency and to keep things clean.
     *
     * @name Partial1
     * @class PartialView1
     * @return view
     */
    var View = Marionette.CompositeView.extend({
        template: _.template(Template1),
        itemView: ItemView,
        itemViewContainer: 'ul'

    });

    module.exports = View;
});