define(function (require, exports, module) {
    'use strict';

    var App = require('app');
    var transaction = App.store.transaction; // Alias the model for easier identification.
    require('jquery.cookie');
    var Repurchase = module.exports;

    // Models
    Repurchase.Models = {};
    // Collections
    Repurchase.Collections = {};
    // Views
    Repurchase.Views = {};

    Repurchase.Views.Option = Backbone.View.extend({
        manage: true,
        el: false,
        template: 'step3/option',

        serialize: function () {
            return this.model.toJSON();
        }
    });

    Repurchase.Views.Base = Backbone.View.extend({
        manage: true,
        template: 'repurchase',

        initialize: function () {
            console.info('getSelectedPackage', transaction.getSelectedPackage());
            this.selectedPackage = transaction.getSelectedPackage();
            this.autoRenewPackSize = 0;
            this.autoRenewDuration = this.selectedPackage.duration.split(' ')[0];
        },

        events: {
            'click .toggle-sessions-dropdown': 'toggleSessionsDropDown',
            'change .repurchase-dropdown select': 'onSessionsDropdownChange'
        },

        onSessionsDropdownChange: function () {
            this.$('.option').text(this.$('option:selected').text());
            transaction.set({
                autoRenewPackSize: this.$('option:selected').val()}
            );
        },

        toggleSessionsDropDown: function (e) {
            e.preventDefault();
            var $repurchaseDropdown = $('.repurchase-dropdown');
            if ($repurchaseDropdown.hasClass('expanded')) {
                $repurchaseDropdown.slideUp().removeClass('expanded');
            } else {
                $repurchaseDropdown.slideDown().addClass('expanded');
            }
        },

        beforeRender: function () {
            this.collection.each(function (model) {
                // set autoRenewPackSize returning from server
                if (model.get('selected')) {
                    this.autoRenewPackSize = model.get('val');
                }

                this.insertView('.select-repurchase', new Repurchase.Views.Option({
                    model: model
                }));
            }, this);

            console.log('isAutoRenewOn', transaction.get('isAutoRenewOn'));
            if (transaction.get('isAutoRenewOn')) {
                console.info('a');
                //TODO select value from dropdown with selected value.
                transaction.set({
                    autoRenewPackSize: this.selectedPackage.quantity,
                    autoRenewDuration: this.autoRenewDuration
                });
            }
            else {
                if (!$.cookie('renewalMsgOff')) {
                    console.info('b');
                    // TODO label should say "no repurchase"  and drop down "no repurchase"
                    transaction.set({
                        autoRenewPackSize: 0,
                        autoRenewDuration: this.autoRenewDuration
                    });
                }
                else {
                    console.info('c');
                    // TODO: reflect currently selected packsize into AutoRepurchasePackSize prop
                    transaction.set({
                        autoRenewPackSize: this.autoRenewPackSize,  //TODO: member selected quantity from step one
                        autoRenewDuration: this.autoRenewDuration
                        //TODO:  update drop down with autoRenewPackSize selected from step 1
                    });
                }
            }
        },

        updateDropdown: function (value) {
            var $repurchaseDropdown = $('#select-repurchase');
            _.each($('option', $repurchaseDropdown), function(el){
                if(Number($(el).val()) ===  Number(value)){
                    $(el).attr('selected', 'selected');
                } else {
                    $(el).removeAttr('selected');
                }
            }, this);
        },

        updateLabel: function () {
            var $repurchaseDropdown = $('#select-repurchase');
            var label = $repurchaseDropdown.find('option:selected').text();
            $repurchaseDropdown.next('.option').text(label);
        },

        //afterRender: function () {
        //    if (transaction.get('isAutoRenewOn')) {
        //        this.updateDropdown(this.selectedPackage.quantity);
        //    }
        //    this.updateLabel();
        //},

        serialize: function () {
            return transaction.toJSON();
        }
    });
});


