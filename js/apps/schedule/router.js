/**
 * @module schedule/router
 */
define(function (require, exports, module) {
    'use strict';

    var AppController = require('controllers/app_controller');

    module.exports = Marionette.AppRouter.extend({

        controller: new AppController(),

        appRoutes: {
            '': 'create',
            'create/:date': 'create',
            'cancel/:id': 'cancel',
            'update/:id': 'update',
            'detail/:id': 'detail',
            'error': 'error',
            '*allOthers': 'defaultPage'
        }
    });
});