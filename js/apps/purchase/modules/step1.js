define(function (require, exports, module) {
    'use strict';

    var App = require('app');
    // predefined module in config file
    var Analytics = require('analytics');
    var Inventory = require('inventory');

    var Step1 = module.exports;
    var packages;  // collection of packages data loaded from the server
    var inventory; // inventory object loaded from the server
    var transaction = App.store.transaction; // Alias the model for easier identification.

    var submitOmnitureTags = function () {
        var omniture = new Analytics.Model.Omniture();
        var pageVars = {
            step: 'choose'
        };
        omniture.set(pageVars);
    };

    App.on('setup:tier', function () {
        var data = createUniqueArray(transaction.attributes.packages.toJSON(), 'tier');

        tierOptionModel.set({
            options: createObject(data),
            disabled: false
        });
    });

    App.on('setup:duration', function () {
        // default duration is 60 min, render only after member selected a tier
        var data = createUniqueArray(transaction.attributes.packages.toJSON(), 'duration');

        durationOptionModel.set({
            options: createObject(data),
            disabled: false,
            selected: '60 min'
        });

        // update selectedPackage model with selected duration of 60 min.
        App.trigger('update:selected:package', ['duration', '60 min']);

        setSelectedDuration('60');
    });

    App.on('setup:package', function () {
        var filtered = query(packages.toJSON(), {
            tier: transaction.get('selectedPackage').tier,
            duration: transaction.get('selectedPackage').duration
        });

        var items = [];
        _.each(filtered, function (item) {
            // item is sku: '0001048', quantity: 48, priceBeforeTax: 4032, priceAfterTax: 4032, unitPrice: 8 should be x24 ($2,328)
            var key = item.id;
            var label = 'x' + item.quantity + ' ($' + item.priceAfterTax + ')';
            items.push({val: key, label: label});
        });

        packageOptionModel.set({
            options: items,
            disabled: false
        });
        // always reset label, after user changed tier or duration.
        transaction.attributes.selectedPackage.label = 'Select';
    });

    App.on('update:selected:package', function (data) {
        transaction.attributes.selectedPackage[data[0]] = data[1];
    });

    /// helper private functions
    var query = function (list, criteria) {
        return _.where(list, criteria);
    };

    var createUniqueArray = function (list, criteria) {
        var items = [];
        _.each(list, function (key) {
            if (!_.isUndefined(key[criteria])) {
                items.push(key[criteria]);
            }
            else {
                console.error('there is no such criteria property name ', criteria);
            }
        }, this);

        return _.uniq(items);
    };

    var createObject = function (data) {
        return _.map(data, function (item) {
            return {
                val: item,
                label: item
            };
        });
    };


    // Models
    Step1.Models = {};
    // Collections
    Step1.Collections = {};
    // Views
    Step1.Views = {};

    Step1.Models.Option = Backbone.Model.extend({
        defaults: {
            options: [],
            disabled: true,
            name: null,
            selected: 'Select'
        }
    });

    var tierOptionModel = new Step1.Models.Option({
        name: 'tier'
    });

    var durationOptionModel = new Step1.Models.Option({
        name: 'duration'
    });

    var packageOptionModel = new Step1.Models.Option({
        name: 'package'
    });

    Step1.Views.Option = Backbone.View.extend({
        manage: true,
        template: 'step1/option',

        events: {
            'change select': function () {
                this.selected();
                this.triggerEvents();
            }
        },

        selected: function () {
            // update ui label
            this.$('.option').text(this.$('option:selected').text());
        }
    });

    // selected tier is later used on step3 dropdown
    var setSelectedTier = function (str) {
        var newStr = str.replace(/[^\d]/g, ''); //return only number and if passed, the "+" symbol

        transaction.set('selectedTier', newStr);
    };

    // selected duration is later used on step3 dropdown
    var setSelectedDuration = function (str) {
        var newStr = str.replace(/[^\d]/g, ''); // return the number only

        transaction.set('selectedDuration', newStr);
    };

    var tierOptionView = new Step1.Views.Option({
        model: tierOptionModel,

        triggerEvents: function () {
            // update selectedPackage with selected tier
            App.trigger('update:selected:package', ['tier', this.$('option:selected').val()]);
            // Set up duration dropdown editor
            App.trigger('setup:duration');
            // Set up packages dropdown editor. at this point we have Tier and Duration (60 min).
            App.trigger('setup:package');
            // Dissable next button
            App.trigger('disable:next');

           setSelectedTier(this.$('option:selected').val());
        },

        afterRender: function () {
            this.$('.option').text(transaction.get('selectedPackage').tier);
        }
    });

    var durationOptionView = new Step1.Views.Option({
        model: durationOptionModel,

        triggerEvents: function () {
            var selectedValue = this.$('option:selected').val();

            App.trigger('update:selected:package', ['duration', selectedValue]);
            App.trigger('setup:package');
            // Dissable next button
            App.trigger('disable:next');

            setSelectedDuration(selectedValue);
        },

        afterRender: function () {
            this.$('.option').text(transaction.get('selectedPackage').duration);
        }
    });

    var packageOptionView = new Step1.Views.Option({
        model: packageOptionModel,

        triggerEvents: function () {
            App.trigger('update:selected:package', ['packageId', this.$('option:selected').val()]);
            App.trigger('update:selected:package', ['label', this.$('option:selected').text()]);
            App.trigger('unable:next');
        },

        afterRender: function () {
            this.$('.option').text(transaction.get('selectedPackage').label);
        }
    });


    Step1.Models.Pkg = Backbone.Model.extend({
        defaults: {
            id: null,
            duration: null,
            messages: null,
            tier: null,
            priceAfterTax: null,
            priceBeforeTax: null,
            quantity: null,
            sku: null,
            unitPrice: null
        }
    });

    Step1.Collections.Packages = Backbone.Collection.extend({
        model: Step1.Models.Pkg,
        url: App.envConfig.tiersUrl
    });

    Step1.Views.Base = Backbone.View.extend({
        manage: true,
        className: 'step1',
        id: 'step1',
        template: 'step1/index',
        events: {
            'click .navigate': 'navigate'
        },

        initialize: function () {
            this.listenTo(App, 'unable:next', this.unableButton);
            this.listenTo(App, 'disable:next', this.disableButton);
            this.listenTo(App, 'setup:tier', this.updateTier);
            this.listenTo(App, 'setup:duration', this.updateDuration);
            this.listenTo(App, 'setup:package', this.updatePackage);
        },

        updateTier: function () {
            this.setView('#tierOption', tierOptionView).render();
        },

        updateDuration: function () {
            this.setView('#durationOption', durationOptionView).render();
        },

        updatePackage: function () {
            this.setView('#packageOption', packageOptionView).render();
        },

        unableButton: function () {
            this.$('.next').removeAttr('disabled');
        },

        disableButton: function () {
            this.$('.next').attr({disabled: 'disabled'});
        },

        navigate: function () {
            if (this.validateData()) {
                App.utils.Spinner(this.el);

                App.router.navigate(this.$('.next').data('url'), {trigger: true});
            }
        },

        //TODO: useless function
        validateData: function () {
            var errors = '';
            return _.isEmpty(errors);
        },

        afterRender: function () {
            // trigger setup tier
            App.trigger('setup:tier');

            // show Equifit message if it is true.
            if (transaction.attributes.inventory.get('isEquifitEligible')) {
                this.setView('#equifit', new Inventory.Views.Equifit()).render();
            }

            // unable next button if user selected the package
            if (!_.isNull(transaction.get('selectedPackage').packageId)) {
                App.trigger('unable:next');
            }
        }
    });

    var renderLayout = function () {
        // Use the main layout.
        App.useLayout('layouts/main').setViews({
            // Attach the root content View to the layout.
            '.pt-purchase': new Step1.Views.Base({
                views: {
                    '#inventory': new Inventory.Views.Inventory(),
                    '#tierOption': tierOptionView,
                    '#durationOption': durationOptionView,
                    '#packageOption': packageOptionView
                }
            })
        }).render();
    };

    // init layout
    Step1.init = function () {
        submitOmnitureTags();

        if (transaction.has('packages') && transaction.has('inventory')) {
            renderLayout();
        }
        else {
            // Fetch the data
            packages = new Step1.Collections.Packages();
            inventory = new Inventory.Model();

            packages.fetch().then(function () {
                inventory.fetch().then(function () {
                    // cache packages collection
                    transaction.set({packages: packages});
                    // cache inventory model
                    transaction.set({inventory: inventory});
                    renderLayout();
                });
            });
        }
    };
});