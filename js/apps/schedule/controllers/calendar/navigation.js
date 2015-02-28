/**
 * @module controller/navigation
 */

define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var App = require('schedule/app');
    var moment = require('moment');
    var View = require('views/calendar/navigation');

    var Model = Backbone.Model.extend({});
    var collection = new Backbone.Collection();

    var createCollection = function (startDate) {
        var i = 0;
        var date = moment(startDate);
        var model;

        for (i; i < 7; i++) {
            model = new Model({
                dataDate: date.format('YYYY-MM-DD'),
                date: date.format('ddd'),
                dateShort: date.format('dd'),
                month: date.format('MMM'),
                day: date.format('DD'),
                current: (i === 0) ? 'mobile-current current' : ''
            });
            collection.add(model);
            date.add('days', 1);
        }
        return collection;
    };

    module.exports = Marionette.Controller.extend({
        index: function (options) {

            // update url just for debugging
            //App.navigate(App.flow + '/' + options.startDate);

            // reset collection
            collection.reset();
            collection = createCollection(options.startDate);

            App.layout.navigation.show(new View({
                collection: collection
            }));
        }
    });
});