/* global define, moment, Marionette, _ */

define(function (require, exports, module) {
    'use strict';

    require('momentjs');

    var Core       = require('core/app');
    var Template   = require('text!templates/common/membership.tpl');

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

            Core.vent.on('account:membership:data:success', function() {
                that.create();
            });

            Core.vent.on('account:membership:data:fail', function() {
                that.destroy();
            });
        },

        templateHelpers: {

            /**
             * membershipDuration
             *
             * expiration date is a bit more messy since it can be based off of expirationDate or
             * obligationDate. In this case, expirationDate takes precedence, and when using
             * obligationDate, we assume is an on going contract with possibly no end.
             *
             * @returns {string}
             */
            membershipDuration: function () {
                var startDate, endDate, expirationDate, obligationDate;

                startDate = moment(this.startDate).format('MMM D. YYYY');

                if (this.expirationDate !== null) {
                    expirationDate = moment(this.expirationDate).format('MMM D. YYYY');
                    obligationDate = moment(this.obligationDate).format('MMM D. YYYY');

                    if(this.obligationDate === null) {
                        endDate = moment(this.expirationDate).format('MMM D. YYYY');
                    } else if (expirationDate < obligationDate) {
                        endDate = moment(this.expirationDate).format('MMM D. YYYY');
                    } else {
                        endDate = moment(this.obligationDate).format('MMM D. YYYY');
                    }
                } else {
                    endDate = moment(this.obligationDate).format('MMM D. YYYY');
                }

                return startDate + ' - ' + endDate;
            },

            /**
             * contractInfo
             *
             * Membership status sentence
             *
             * @returns {string}
             */
            contractInfo: function () {
                var str = '';

                if (this.obligationDate !== null) {
                    str = 'Current rate applies until ' + moment(this.obligationDate).format('MMM D. YYYY');
                } else {
                    var expirationDate = moment(this.expirationDate);

                    if ( this.membershipStatus !== 'Expired' ) {
                        str = moment(expirationDate, "YYYYMMDD").fromNow() + ' contract until ' + moment(this.expirationDate).format('MMM D. YYYY');
                    } else {
                        str = '<span class="error">Your Membership has expired!</span>'
                    }
                }

                return str;
            }
        }

    });

    module.exports = View;
});