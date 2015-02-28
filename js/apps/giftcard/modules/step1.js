define(function (require, exports, module) {
    'use strict';

    require('backbone.forms');

    var App = require('app');
    var RecipientInfoForm = require('./forms/recipient_info');

    var Step1 = module.exports;
    var catalogCollection, catalogView, recipientInfoForm, giftCardRecipientInfo = {};

    var CatalogModel = Backbone.Model.extend({
        defaults: {
            name: null,
            itemNumber: null
        }
    });


    var CatalogCollection = Backbone.Collection.extend({
        model: CatalogModel,
        url: App.envConfig.catalogUrl
    });


    var CatalogView = Backbone.View.extend({
        template: _.template($('#tplCatalogOption').html()),

        events: {
            'change select': 'selected'
        },

        render: function () {
            var collection = this.collection.toJSON();
            var sortedCollection = collection.sort(function (a, b) { return parseInt(a.name.split('$')[1], 10) - parseInt(b.name.split('$')[1], 10); });
            this.$el.append(this.template({ 'options': sortedCollection }));

            if (!_.isEmpty(giftCardRecipientInfo)) {
                this.$('.option').text(giftCardRecipientInfo.price.length ? giftCardRecipientInfo.price : this.$('option:selected').text());
                this.$('#select-catalog').val(giftCardRecipientInfo.itemNumber.length ? giftCardRecipientInfo.itemNumber : this.$('option:selected').val());
            } else {
                //this.$('.option').text(this.$('option:selected').text());
                //this.$('#select-catalog').val(this.$('option:selected').val());
                this.$('.option').text('$100');
                this.$('#select-catalog').val('GC056');
            }

            return this;
        },

        selected: function () {
            var $selectedOption = this.$('option:selected');
            this.$('.option').text($selectedOption.text());
        }
    });

    var BaseView = Backbone.View.extend({
        id: 'step1',

        template: $('#tplStep1').html(),

        events: {
            'click .navigate': 'navigate'
        },
        
        initialize: function(){
            this.dom = {};
        },

        render: function () {
            this.$el.append(this.template);
            this.dom.$catalogOption = this.$('#catalogOption');
            this.dom.$recipientInfo = this.$('#recipientInfo');

            catalogView = new CatalogView({ collection: catalogCollection });
            recipientInfoForm = new RecipientInfoForm.Form({ model: App.store.recipientInfoModel }).render();

            this.dom.$catalogOption.append(catalogView.render().$el);
            this.dom.$recipientInfo.append(recipientInfoForm.el);

            this.dom.$selectCatalog = this.$('#select-catalog');

            /* Text area word count starts here*/
            var textMax = 150;
            var existLength = this.$('#c1_message').val().length;
            var remainText = textMax - existLength;

            this.$('#textarea_feedback').html(remainText + ' CHARACTERS');

            this.$('#c1_message').keyup(function () {
                var textLength = $('#c1_message').val().length;
                var textRemaining = textMax - textLength;
                $('#textarea_feedback').html(textRemaining + ' CHARACTERS');
            });
            /* Text area word count ends here*/

            return this;
        },

        navigate: function () {
            if (this.validateData()) {
                var data = {
                    itemNumber: this.dom.$selectCatalog.find('option:selected').val(),
                    price: this.dom.$selectCatalog.find('option:selected').text(),
                    firstName: recipientInfoForm.model.get('firstName'),
                    lastName: recipientInfoForm.model.get('lastName'),
                    email: recipientInfoForm.model.get('email'),
                    message: recipientInfoForm.model.get('message')
                };

                sessionStorage.setItem('giftCardRecipientInfo', JSON.stringify(data));
                App.store.recipientInfoModel.set(data);

                App.utils.Spinner(this.el);
                App.router.navigate(this.$('.next').data('url'), { trigger: true });
            }
        },

        validateData: function () {
            var errors = recipientInfoForm.commit();

            console.log('Step1 Form Errors', errors);

            if (_.isEmpty(errors)) {
                return true;
            }

            return false;
        }
    });

    var ErrorView = Backbone.View.extend({
        id: 'error',

        template: $('#tplError').html(),

        events: {
            'click .goToHomePage': 'navigate'
        },

        initialize: function () {
            this.dom = {};
        },

        render: function () {
            this.$el.append(this.template);
            return this;
        },

        navigate: function () {
            window.location.href = App.envConfig.homePageUrl;
        }
    });

    var renderLayout = function () {
            catalogCollection = new CatalogCollection();
            catalogCollection.fetch({ beforeSend: App.setHeader }).then(function () {

                var baseView = new BaseView();
                $('#app-main').html(baseView.render().$el);
                window.EQ.Helpers.goToTop();
            });
    };

    // init layout
    Step1.init = function () {
        App.store.transactionModel.set('isEmpty', true);

        if (window.user && window.user.SourceSystem !== 1) {
            var errorView = new ErrorView();
            $('#app-main').html(errorView.render().$el);
            window.EQ.Helpers.goToTop();
        } else {
            if (location.search.substr(1) === '' && App.store.isRefreshed === true) {
                sessionStorage.removeItem('giftCardRecipientInfo');
                renderLayout();
            } else {
                if (sessionStorage.getItem('giftCardRecipientInfo')) {
                    giftCardRecipientInfo = JSON.parse(sessionStorage.getItem('giftCardRecipientInfo'));

                    App.store.recipientInfoModel.set({
                        itemNumber: giftCardRecipientInfo.itemNumber,
                        price: giftCardRecipientInfo.price,
                        firstName: giftCardRecipientInfo.firstName,
                        lastName: giftCardRecipientInfo.lastName,
                        email: giftCardRecipientInfo.email,
                        reTypeEmail: giftCardRecipientInfo.email,
                        message: giftCardRecipientInfo.message
                    });

                    if (giftCardRecipientInfo.itemNumber.length && location.search.substr(1) === 'fromLogin=true') {
                        App.router.navigate('#step2', { trigger: true });
                    } else {
                        renderLayout();
                    }
                } else {
                    renderLayout();
                }
            }
        }


    };
});