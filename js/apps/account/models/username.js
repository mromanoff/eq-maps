define(function (require, exports, module) {
    'use strict';

    var Core     = require('core/app');
    var Backbone = require('backbone');

    /**
     * Username Edit Model
     *
     * Stores membership information prefetch from the server
     * and submits to the server new username
     *
     * @augments Backbone.Model
     * @name Username
     * @class UsernameModel
     * @return model
     */
    var Model = Backbone.Model.extend({

        url: Core.utils.getApi('/account/username/update'),

        defaults: {
            title: 'Change Username',
            narrow: true, // we pass this to static fieldsets view to make narrow form
            fieldsets: null // static fieldsets will be stored here
        }

    });

    module.exports = Model;
});
