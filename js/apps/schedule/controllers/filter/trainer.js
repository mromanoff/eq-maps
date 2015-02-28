define(function (require, exports, module) {
    'use strict';

    var App = require('schedule/app');
    var Marionette = require('marionette');
    var View = require('views/filter/trainer');

    var Model = Backbone.Model.extend({
        defaults: {
            durations: null,
            trainers: null
        }
    });

    var model = new Model();
    var view = new View({
        model: model
    });

    module.exports = Marionette.Controller.extend({

        initialize: function () {
            model.set({
                trainers: App.scheduleCriteria.trainers,
                durations: App.scheduleCriteria.durations
            });
            App.layout.filter.show(view);
        }
    });
});