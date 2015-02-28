define(function (require, exports, module) {
    'use strict';

    var Forms = require('backbone.forms');

    // Alias the module for easier identification.
    var SelectPackage = module.exports;

//    var ListModel = Backbone.Model.extend({
//        defaults: {
//            name: '',
//            value: ''
//        },
//
//        toString: function () {
//            return this.get('name');
//        }
//    });


//TODO: great technics to use collection for option
//http://stackoverflow.com/questions/22903857/backbone-forms-use-backbone-collection-and-an-options-for-select-editor
//    var Collection = Backbone.Collection.extend({
//        model: ListModel
//    });
//
//    var collection = new Collection([
//        {name: 'test1', value: '1'},
//        {name: 'test2', value: '2'},
//        {name: 'test3', value: '3'}
//    ]);
//
//    var User = Backbone.Model.extend({
//        schema: {
//            field1: { type: 'Select', options: collection },
//            field2: { type: 'Select', options: ['Select 2']},
//            field3: { type: 'Select', options: ['Select 3']}
//        }
//    });
//TODO: great technics to use collection for option

    // Form Templates
    SelectPackage.Templates = {};

    SelectPackage.Templates.form = '\
        <form class="large white forms-spa">\
            <span data-fieldsets></span>\
        </form>';

    SelectPackage.Templates.select = _.template('<div><span data-editor class="disabled dropdown block white"><span class="option"><%= title %></span></span></div>');

    SelectPackage.Form = Backbone.Form.extend({
        template: _.template(SelectPackage.Templates.form),
        schema: {
            tier: {
                type: 'Select',
                title: 'Tier',
                fieldClass: 'third',
                template: SelectPackage.Templates.select,
                options: [
                    { val: '', label: 'Tier' }
                ]
            },
            duration: {
                type: 'Select',
                title: 'Duration',
                fieldClass: 'third',
                editorAttrs: {disabled: 'disabled'},
                template: SelectPackage.Templates.select,
                options: [
                    { val: '', label: 'Duration'}
                ]
            },
            pkg: {
                type: 'Select',
                title: 'Package',
                fieldClass: 'third',
                editorAttrs: {disabled: 'disabled'},
                template: SelectPackage.Templates.select,
                options: [
                    { val: '', label: 'Package'}
                ]
            }
        },

        idPrefix: 'select-',
        fieldsets: {
            fields: ['tier', 'duration', 'pkg']
        },

//        unableEditor: function () {
//            console.log('this', this);
//        },

        initialize: function (options) {
            Forms.prototype.initialize.call(this, options);

//            this.on('tier:change', function (form, name) {
//                //console.log('tier change in constractor');
//                //App.trigger('setup:tier', form, name, {});
//
//                form.model.setSelectedTier(name);
//                form.model.updateDuration();
//
//                App.trigger('update:editor', name);
//                App.trigger('unable:field', 'select-duration');
//                App.trigger('disable:field', 'select-pkg');
//                App.trigger('disable:next');
//
//
//            });
//
//            this.on('duration:change', function (form, name) {
//                console.log('duration change in constractor');
//                //App.trigger('setup:duration', form, name, {});
//
//                form.model.setSelectedDuration(name);
//                // update model:pkg
//                form.model.updatePkg();
//                // unable pkg field
//                App.trigger('update:editor', name);
//                App.trigger('unable:field', 'select-pkg');
//                App.trigger('disable:next');
//            });
//
//            this.on('pkg:change', function (form, name) {
//                console.log('pkg change in constractor');
//                //App.trigger('setup:pkg', form, name, {});
//                form.model.setSelectedPkg(name);
//                // update base view: unable next button
//                App.trigger('update:editor', name);
//                App.trigger('unable:next');
//            });
        }

    });
});