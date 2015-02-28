define(function (require, exports, module) {
    'use strict';

    var Marionette     = require('marionette');
    var BossView       = require('bossview');
    var HeadingView    = require('core/views/common/heading');
    var MembershipView = require('account/views/common/membership');
    var MessageView    = require('account/views/common/message');
    var BalanceView    = require('account/views/common/balance');
    var PersonalView   = require('account/views/common/personal');

    /**
     * Account Homepage View
     *
     * This is the master view for the account homepage
     *
     * @name Account
     * @class AccountView
     * @return view
     */
    var View = Marionette.BossView.extend({

        subViews: {
            heading:    HeadingView,
            membership: MembershipView,
            message:    MessageView,
            balance:    BalanceView,
            personal:   PersonalView
        }

    });

    module.exports = View;
});