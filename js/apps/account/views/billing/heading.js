define(function (require, exports, module) {
    'use strict';

    var Core            = require('core/app');
    var Marionette      = require('marionette');
    var HeadingTemplate = require('text!templates/common/heading.tpl');
    var FormsModel      = require('core/models/form_utils');
    
    var utils = new FormsModel();

    var HeadingView   = Marionette.ItemView.extend({
        template: _.template(HeadingTemplate),

        events: {
            'click .empty-fields': 'emptyAllFields',
            'click .toggle-form': 'toggleForm',
            'click .lnk-edit': 'toggleEditLink'
        },

        toggleForm: function(e) {
            e.preventDefault();

            var $btn = this.$el.find('.btn-form-toggle');
            //var str  = $btn.text() === 'Empty all fields'  ? 'Add New Card' : 'Empty all fields';

            $btn.toggleClass('toggle-form empty-fields').text();

            Core.vent.trigger('billing:form:toggle');
        },

        emptyAllFields: function(e) {
            e.preventDefault();

            Core.vent.trigger('billing:form:empty');
        },

        toggleEditLink: function(e) {
            e.preventDefault();

            var str = $(e.target).text() === 'Edit' ? 'Cancel' : 'Edit';

            $(e.target).text(str);
        },

        templateHelpers: {
            haveNewCard: function() {
                return this.isCardExpired || !this.cardLastFourDigits ? true : false; // todo: refactor
            },

            friendlyExpDate: function() {
                //todo: move to helper lib
                var months = utils.get('monthNames');
                var arr    = this.expirationDate.split('/');
                var date   = new Date(arr[1], arr[0]);
                var str    = months[date.getMonth()] + ' ' + date.getFullYear();

                return str;
            }
        }
    });

    module.exports = HeadingView;
});