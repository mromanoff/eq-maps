define(function (require, exports, module) {
    'use strict';

    var Marionette   = require('marionette');
    var BossView     = require('bossview');
    var HeadingView  = require('core/views/common/heading');
    var SettingsView = require('other_settings/views/common/settings');
    var ServicesView = require('other_settings/views/common/services');
    var OthersView = require('other_settings/views/common/others');

    /**
     * Account Homepage View
     *
     * This is the master view for the account homepage
     *
     * @name Page
     * @class PageView
     * @return view
     */
    var View = Marionette.BossView.extend({

        subViews: {
            heading: HeadingView,
            others: OthersView,
            settings: SettingsView,
            services: ServicesView
        }

    });

    module.exports = View;
});