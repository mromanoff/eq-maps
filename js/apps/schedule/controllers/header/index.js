define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var App = require('schedule/app');
    var Model = require('entities/header');
    var View = require('views/header');

    var model = new Model();
    var view = new View({
        model: model
    });

    module.exports = Marionette.Controller.extend({

        initialize: function (options) {
            model.set(options);
            App.layout.header.show(view);
        }
    });
});