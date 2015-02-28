define(function (require, exports, module) {
    'use strict';

    var Core       = require('core/app');
    var Marionette = require('marionette');
    var Template   = require('text!account/templates/common/balance.tpl');

    /**
     * Balance View Sample
     *
     * Regular Marionette ItemView Partial for the balance widget seen in account homepage
     *
     * @name Balance
     * @class BalanceView
     * @return view
     */
    var View = Marionette.ItemView.extend({

        template: _.template(''),

        ui: {
            toggle: '.toggle'
        },

        events: {
            'click .toggle': 'autoPayToggle'
        },

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
                that.create();
            });

            Core.vent.on('account:billing:data:fail', function() {
                that.destroy();
            });
        },

        autoPayToggle: function(e) {
            e.preventDefault();

            var that = this;
            var isBillingOptOut = this.model.get('isBillingOptOut') === true ? false : true;
            var toggleClass = isBillingOptOut ? 'off' : 'on';

            this.model.set('isBillingOptOut', isBillingOptOut);
            this.ui.toggle.removeClass('on off').addClass(toggleClass);

            $.ajax({
                type: 'POST',
                url: Core.utils.getApi('/billing/updateoptout'),
                data: { isBillingOptOut: isBillingOptOut }
            }).fail(function(){
                    // if it fails, then reset it
                    isBillingOptOut = that.model.get('fbShare') === true ? false : true;
                    toggleClass = isBillingOptOut ? 'off' : 'on';

                    that.model.set('isBillingOptOut', isBillingOptOut);
                    that.ui.toggle.removeClass('on off').addClass(toggleClass);
                });


        },

        onRender: function() {
            var toggleClass = this.model.get('isBillingOptOut') ? 'off' : 'on';

            this.ui.toggle.removeClass('on off').addClass(toggleClass);

            if (Core.store.get('billing') && Core.store.get('billing.paymentType')) {
                this.model.set('paymentType', Core.store.get('billing.paymentType'));
            }

        },

        templateHelpers: {

            /**
             * displayBalance
             *
             * The balance displayed to the user can be different from the currentBalance
             * for various reasons like, if autopayment is on and the card is still valid, etc.
             *
             * @returns {number}
             */
            displayBalance: function() {
                return this.currentBalance;
            },

            /**
             * autoPurchase
             *
             * autopay is the opposite of `isBillingOptOut` which is the most confusing
             * attribute in the history.
             *
             * @returns {string}
             */
            autoPurchase: function () {
                var autopay = this.isBillingOptOut ? 'OFF' : 'ON';
                return autopay;
            },

            /**
             * packageStatus
             *
             * Auto renew sentence
             *
             * @param time
             * @returns {string}
             */
            packageStatus: function (time) {
                if (_.isUndefined(this.packages)) return;
                
                var packages = this.packages;
                var totalSize = (packages[time] > 0) ? ('X' + packages[time] + ' SESSIONS: ') : '';
                var currPkg   = (packages[time] > 0) ? 'ON' : 'OFF';
                var sentence  = 'AUTO PT RENEW (' + time + 'MIN) ' + totalSize + ' <strong>' + currPkg + '</strong>';

                return sentence;
            },

            /**
             * cardEnding
             *
             * Card ending sentence
             *
             * @returns {string}
             */
            cardEnding: function () {
                var cardNumber = this.creditCardNumber ? this.creditCardNumber : null;
                var lastFour   = this.cardLastFourDigits ? this.cardLastFourDigits : Core.utils.getLastFourDigits(cardNumber);
                var cardType   = this.cardType ? this.cardType : Core.utils.getCardType(creditCardNumber);

                return cardType + ' ending in - ' + lastFour;
            }

        }

    });

    module.exports = View;
});