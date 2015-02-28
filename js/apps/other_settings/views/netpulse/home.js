define(function (require, exports, module) {
    'use strict';

    var Marionette   = require('marionette');
    var BossView     = require('bossview');
    var HeadingView  = require('core/views/common/heading');
    var CopyView     = require('core/views/common/copy');
    var AppsView     = require('other_settings/views/netpulse/apps');

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

        template: function() {
          return '<div class="heading-region"></div><div class="limit-width"></div>'
        },

        subViews: {
            heading: HeadingView,
            copy: CopyView,
            apps: AppsView
        },

        subViewContainers: {
            heading: '.heading-region',
            copy: '.limit-width',
            apps: '.limit-width'
        }

    });

    module.exports = View;
});