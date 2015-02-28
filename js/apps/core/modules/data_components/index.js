/**
 * Data Component Module
 *
 * These are the data-components dynamic widgets. For now, it links to the app folder data
 * components but maybe in the future those will be migrated here?
 */
define(function (require, exports, module) {
    'use strict';

    require('helpers');
    require('geo');

    // todo: move to modules
    require(['components'], function (Components) {
        App.components = Components;
    });

});

