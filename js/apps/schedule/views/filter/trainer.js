define(function (require, exports, module) {
    'use strict';

    var App = require('schedule/app');
    var Marionette = require('marionette');
    var template = require('text!templates/filter/trainer.tpl');

    module.exports = Marionette.ItemView.extend({
        template: _.template(template),

        events: {
            'change .select-duration': 'selectDuration',
            'change .select-trainer': 'selectTrainer'
        },

        onBeforeRender: function () {
            this.model.set({defaultTrainer: App.filterCriteria.get('trainerName')});
            this.model.set({defaultDuration: App.filterCriteria.get('duration')});
        },

        onRender: function () {
            // hide selectTrainer if only one trainer
            if (_.isEqual(1, _.size(this.model.get('trainers')))) {
                this.ui.selectTrainer.closest('div').hide();
                this.ui.selectDuration.closest('div').css({'float': 'none', 'margin': '0 auto'});
            }
        },

        ui: {
            selectDuration: 'select.select-duration',
            selectTrainer: 'select.select-trainer'
        },

        selectTrainer: function () {
            this.ui.selectTrainer.prev('.option').text($('option:selected', this.ui.selectTrainer).text());
            App.filterCriteria.set({trainerId: $('option:selected', this.ui.selectTrainer).val()});
        },

        selectDuration: function () {
            this.ui.selectDuration.prev('.option').text($('option:selected', this.ui.selectDuration).text());
            App.filterCriteria.set({sessionTypeId: $('option:selected', this.ui.selectDuration).val()});
        }
    });
});