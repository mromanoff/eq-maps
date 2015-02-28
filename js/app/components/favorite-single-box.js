(function (global, App) {
    'use strict';

    /* global APIEndpoint26, APIEndpoint, EQ, debug */

    var Backbone = global.Backbone,
        _ = global._;

    /**
    * Models
    */

    var ItemModel = Backbone.Model.extend({
        defaults: {
            id: '',
            displayText: '',
            type: ''
        }
    });

    /**
    * Collections
    */

    var ItemsCollection = Backbone.Collection.extend({
        model: ItemModel,
        initialize : function (options) {
            this.options = options || {};
        }
    });

    /**
    * Views
    */

    var FavoriteContainerView = Backbone.View.extend({
        initialize : function (options) {
            this.options = options || {};
        },
        events: {
            'click a.edit-mode': 'switchEditMode',
            'click a.done-editing': 'switchEditMode'
        },
        switchEditMode: function (e) {
            if (e) {
                e.preventDefault();
            }
            var $error = $('.is-error', this.$el);

            this.$el.find('.favorite-wrapper').toggleClass('edit-mode-container');

            if (!$error.hasClass('hidden')) {
                $error.addClass('hidden');
            }

            // if (this.$el.find('.favorite-wrapper').hasClass('edit-mode-container')) {
            if (this.isOnEditMode()) {
                App.Events.trigger('favoriteBoxOpened', {
                    '$el': this.$el
                });
            } else {
                App.Events.trigger('favoriteBoxClosed', {
                    '$el': this.$el
                });
            }
        },
        toggleEditButton: function () {
            var $editModeButton = this.$el.find('.edit-mode');

            if (this.collection.length > 0) {
                $editModeButton.removeClass('hidden');
            } else {
                $editModeButton.addClass('hidden');
            }
        },
        addMultipleItems: function (multipleSelectedItems) {
            var that = this,
                itemModel;

            if (multipleSelectedItems.length) {
                _.each(multipleSelectedItems, function (value) {
                    itemModel = new ItemModel(value);
                    that.addNewItem(itemModel);
                });
            }
        },
        isOnEditMode: function () {
            return this.$el.find('.favorite-wrapper').hasClass('edit-mode-container') ? true : false;
        },
        addNewItem: function (item) {
            var that = this,
                favoriteItemView,
                $editModeButton = this.$el.find('.edit-mode');

            // Hide edit button when adding
            $editModeButton.addClass('hidden');

            this.loaderAndError.showLoader();

            if (!this.collection.get(item.id)) {
                $.ajax({
                    type: 'PUT',
                    url: APIEndpoint + '/me/favorites/' + item.get('type') + '/' + item.get('id'),
                    contentType: 'application/json',
                    xhrFields: { 'withCredentials': true },
                    dataType: 'json',
                    success: function () {
                        debug('save ok');
                        that.loaderAndError.hideLoader();

                        $editModeButton.removeClass('hidden');
                        that.collection.add(item);

                        favoriteItemView = new FavoriteItemView({
                            model: item,
                            itemDeletedCallback: (that.removeItem).bind(that)
                        });
                        that.$el.find('.favorites-added').append(favoriteItemView.render().el);
                        that.toggleEditButton();

                        EQ.Helpers.user.invalidateFavoritesCache();
                    },
                    error: function (d) {
                        debug('server error', d.responseJSON);
                        that.loaderAndError.showError();
                    }
                });
            } else {
                that.loaderAndError.hideLoader();
            }
        },
        removeItem: function (itemModel) {
            if (itemModel.get('type') === 'clubs' && this.collection.length === 1) {
                $('.is-error', this.$el).removeClass('hidden');
                return;
            }

            var that = this,
                deleteEndPoint = APIEndpoint + '/me/favorites/' + itemModel.get('type') + '/remove/' + itemModel.get('id');

            if (itemModel.get('type') === 'bikes') {
                deleteEndPoint = APIEndpoint + '/me/favorites/bikes/' + itemModel.get('id') + '/remove';
            }

            $.ajax({
                type: 'DELETE',
                url: deleteEndPoint,
                contentType: 'application/json',
                xhrFields: { 'withCredentials': true },
                dataType: 'json',
                success: function () {
                    debug('delete ok');
                    that.collection.remove(itemModel);
                    that.renderFavList();
                    that.toggleEditButton();
                    if (that.collection.length === 0) {
                        that.switchEditMode();
                    }
                    EQ.Helpers.user.invalidateFavoritesCache();
                },
                error: function (d) {
                    debug('server error', d.responseJSON);
                }
            });
        },
        renderFavList: function () {
            this.$el.find('.favorites-added').empty();
            this.collection.each(function (item) {
                var favoriteItemView = new FavoriteItemView({
                    model: item,
                    itemDeletedCallback: (this.removeItem).bind(this)
                });
                this.$el.find('.favorites-added').append(favoriteItemView.render().el);
            }, this);
        },
        render: function () {
            var that = this,
                $favoritesClasses = this.$el.find('.favoritesSelectorComponent'),
                $loaderContainer = this.$el.find('.loader-container');

            this.renderFavList();

            if (this.options.name === 'bikes' && this.collection.length === 1) {
                var ENDPOINT = APIEndpoint26 + '/me/preferences/bike/';

                $.ajax({
                    type: 'GET',
                    url: ENDPOINT,
                    contentType: 'application/json',
                    xhrFields: { 'withCredentials': true },
                    dataType: 'json',
                    success: function (data) {
                        debug('[BIKE PREFERENCES OK]', data);
                        if (data.isDefault === true) {
                            var popupWindow = EQ.Helpers.PopupMessageHandler($('.favorites-bikes .favorites-added li:first-child'), {
                                closeButton: true,
                                description: 'The best ride starts with the best settings. Set up your bike preferences here.',
                                buttonColor: 'white',
                                buttonText: 'Set up my bike'
                            });

                            popupWindow.showPopup();
                        }
                    },
                    error: function (d) {
                        debug('server error', d.responseJSON);
                    }
                });
            }

            if (!this.options.componentOptions.itemSelectedCallback) {
                this.options.componentOptions.itemSelectedCallback = function (itemModel) {
                    that.addNewItem(itemModel);
                };
            }

            if (this.options.listSimpleAddingEvent && this.options.listSimpleAddingCallback) {
                Backbone.Events.on(this.options.listSimpleAddingEvent, this.options.listSimpleAddingCallback);
            }

            if (this.options.multipleAddingsEvent) {
                Backbone.Events.on(this.options.multipleAddingsEvent, function (multipleSelectedItems) {
                    that.addMultipleItems(multipleSelectedItems);
                });
            }

            that.toggleEditButton();

            // First clear old loader
            $loaderContainer.empty();

            // Loader init
            this.loaderAndError = EQ.Helpers.loaderAndErrorHandler($loaderContainer);

            // render component for selecting favorites
            App.loadComponent(this.options.componentName,
                $favoritesClasses, this.options.componentOptions);

            App.Events.on('favoriteBoxOpened', function (e, data) {
                if (data.$el.attr('class') !== that.$el.attr('class')) {
                    that.$el.find('.favorite-wrapper').removeClass('edit-mode-container');
                }
            });

            App.Events.on('removeFavoriteItem', function (e, data) {
                that.removeItem(data.itemModel);
            });

            App.Events.on('clickOnBg', function () {
                if (that.isOnEditMode()) {
                    that.switchEditMode();
                }
            });

            return this;
        }
    });

    var FavoriteItemView = Backbone.View.extend({
        model: ItemModel,
        template: _.template($('#itemFavorite').html()),
        tagName: 'li',
        initialize : function (options) {
            this.options = options || {};
        },
        events: {
            'click .remove-favorite': 'remove'
        },
        remove: function (e) {
            e.preventDefault();
            this.options.itemDeletedCallback(this.model);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var FavoriteBox = {};

    FavoriteBox.init = function ($el, options) {
        var favoriteContainerView,
            itemsCollection = new ItemsCollection(options.data),
            name = options.name || '';

        favoriteContainerView = new FavoriteContainerView({
            el: $el,
            collection: itemsCollection,
            name: name,
            componentName: options.componentName,
            multipleAddingsEvent: options.multipleAddingsEvent || '',
            listSimpleAddingEvent: options.listSimpleAddingEvent || '',
            listSimpleAddingCallback: options.listSimpleAddingCallback || undefined,
            componentOptions: options.componentOptions
        });
        favoriteContainerView.render();
    };

    /**
    * Component Init.
    */

    App.Components['favorite-single-box'] = function ($el, options) {
        FavoriteBox.init($el, options);
    };

} (window, window.App));