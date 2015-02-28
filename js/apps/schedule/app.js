define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var Layout = require('views/layout');
    var Utils = require('appHelpers/utils');
    var FilterCriteriaModel = require('entities/criteria');
    var Analytics = require('entities/analytics');

    var App = new Marionette.Application();
    App.layout = new Layout();
    App.utils = new Utils();
    App.filterCriteria = new FilterCriteriaModel();
    App.analytics = new Analytics();
    App.el = '#app-main';

    /** update App flow
     *  @param {string} create, update, cancel, detail
     */
    App.flow = null;

    /**
     *
     * @returns {Backbone.History.fragment|*}
     */
    App.getCurrentRoute = function () {
        return Backbone.history.fragment;
    };

    /**
     *
     * @param route
     * @param {object} options
     */
    App.navigate = function (route, options) {
        options = options || {};
        Backbone.history.navigate(route, options);
    };

    App.on('initialize:after', function () {
        // TODO: temp fix. if member don't have a trainer. don't start App. redirect
        if (_.isEmpty(App.scheduleCriteria.trainers)) {
            window.location.href = '/personal-training/schedule-equifit';
            return false;
        }

        // all the core meat goes here
        // create global App {} mimic legacy app.
        window.App = {
            Components: {}
        };

        require(['components']);
        require(['helpers']);

        App.filterCriteria.set({
            sessionTypeId: App.scheduleCriteria.durations[0].sessionTypeId, // first duration in the list is default session. 60 Min
            duration: App.scheduleCriteria.durations[0].duration,
            trainerId: App.scheduleCriteria.trainers[0].trainerId,  // first trainer in the list is default trainer
            trainerName: App.scheduleCriteria.trainers[0].trainerFirstName + ' ' + App.scheduleCriteria.trainers[0].trainerLastName
        }, {silent: true});

        App.analytics.set({
            trainerId: App.scheduleCriteria.trainers[0].trainerId  // first trainer in the list is default trainer
        });

        App.addRegions({
            mainRegion: App.el
        });

        App.mainRegion.show(App.layout);
    });

    module.exports = App;
});

