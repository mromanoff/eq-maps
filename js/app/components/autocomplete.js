(function (App) {
    'use strict';

    /* global debug, Backbone, EQ, _ */

    // To fix issue on autocomplete results on iOS
    var forceRedraw = function (element, trick) {
        var disp = element.style.display;
        element.style.display = 'none';
        trick = element.offsetHeight;
        element.style.display = disp;
    };

    /**
    * Models
    */

    var ItemData = Backbone.Model.extend({
        defaults: {
            id: '',
            category: '',
            displayText: '',
            score: ''
        }
    });

    /**
    * Collections
    */

    var AutoCompleteDataCollection = Backbone.Collection.extend({
        model: ItemData,
        initialize : function (options) {
            this.options = options || {};
        },
        parse: function (response) {
            var finalItems = [],
                that = this;
            _.each(response, function (item) {
                item.type = that.options.type;
                finalItems.push(item);
            });
            return finalItems;
        },
        url: function () {
            var url = this.options.urlEndpoint + this.keyWord;
            return url;
        },
        updateKeyWord: function (keyWord) {
            this.keyWord = keyWord;
        }
    });

    /**
    * Views
    */

    var AutocompleteView = Backbone.View.extend({
        initialize: function (options) {
            this.options = options || {};
        },
        events: {
            'keyup input': 'inputChange',
            'focus input': 'showAutocomplete',
            'click a.close': 'hideAutocomplete',
            'click .autocomplete-toggler': 'toggleAutocomplete'
        },
        inputChange: _.debounce(function (e) {
            e.preventDefault();
            debug('inputChange');

            var that = this,
                $input = $(e.target),
                $autocompleteComponent = this.$el,
                $autocompleteResults = $autocompleteComponent.find('.autocompleteResults'),
                $loaderContainer,
                loaderAndError;

            this.collection.updateKeyWord($input.val());

            // If the user delete all the input content
            if ($input.val() === '') {
                this.clearAutocomplete();
                this.trigger('showDropdown');
            } else {
                // Hide dropwdown and then execute search
                this.clearAutocomplete();

                // Hide dropwdown
                this.trigger('hideDropdown');

                // Loader needs a container using a mock element
                $autocompleteResults.append('<li><a>.</a></li>');
                $loaderContainer = $autocompleteResults.find('li a');
                loaderAndError = EQ.Helpers.loaderAndErrorHandler($loaderContainer, {
                    type: 'button',
                    color: 'white'
                });
                loaderAndError.showLoader();

                /* filterFunction takes in 3 parameters, search term, a success function (
                    that takes an array of objects {id:id, displayText: text, score: 1});
                    and an error / empty function */
                if (this.options.filterFunction) {
                    this.options.filterFunction($input.val(), function (data) {
                        debug('filter ok', data);

                        var customFilterCollection = new AutoCompleteDataCollection(data);

                        var $autocomplete = that.$el.find('.autocompleteResults');

                        // First clean autocomplete
                        that.clearAutocomplete();

                        // Show
                        $autocomplete.show();

                        // Hide dropwdown
                        that.trigger('hideDropdown');

                        var autocompleteResultsView = new AutocompleteResultsView({
                            collection: customFilterCollection,
                            el: $autocompleteResults,
                            itemSelectedCallback: function (model) {
                                that.options.itemSelectedCallback(model);
                                that.clearAutocomplete();
                                $autocomplete.hide();
                                that.$el.find('.autocomplete').removeClass('focused');
                                $input.val('');
                            }
                        });
                        that.$el.addClass('selected');
                        autocompleteResultsView.render();
                    }, function () {
                        that.clearAutocomplete();
                    });
                } else {
                    this.collection.fetch({
                        'xhrFields': { 'withCredentials': true },
                        'success': function (collection) {
                            debug('search ok', collection);

                            var $autocomplete = that.$el.find('.autocompleteResults');

                            // First clean autocomplete
                            that.clearAutocomplete();

                            // Show
                            $autocomplete.show();

                            // Hide dropwdown
                            that.trigger('hideDropdown');

                            var autocompleteResultsView = new AutocompleteResultsView({
                                collection: collection,
                                el: $autocompleteResults,
                                itemSelectedCallback: function (model) {
                                    that.options.itemSelectedCallback(model);
                                    that.clearAutocomplete();
                                    $autocomplete.hide();
                                    that.$el.find('.autocomplete').removeClass('focused');
                                    $input.val('');
                                }
                            });
                            that.$el.addClass('selected');
                            autocompleteResultsView.render();
                        },
                        'error': function () {
                            that.clearAutocomplete();
                            debug('Server Error');
                        }
                    });
                }
            }

        }, 500),
        showAutocomplete: function () {
            if (this.$el.find('.autocomplete').hasClass('focused') === false) {
                this.$el.find('.autocomplete').addClass('focused');

                if ($(window).width() <= 380) {
                    $('body').scrollTop((this.$el.offset().top - this.$el.height()) - 20);
                }

                this.trigger('showDropdown');
                this.togglePlaceholder();
            }
        },
        hideAutocomplete: function (e) {
            var that = this;
            if (e) {
                e.preventDefault();
            }
            var $el = this.$el;

            $el.find('input').blur();
            $el.find('input').val('');
            $el.find('.autocompleteResults').empty();
            $el.removeClass('selected');
            that.trigger('hideDropdown');


            // This call must happen before the 'focused' class is removed from the input
            this.togglePlaceholder();

            this.$el.find('.autocomplete').removeClass('focused');
        },
        togglePlaceholder: function () {
            // Change the placeholder for the inputs when they gain or lose focus

            if (EQ.Helpers.isIe() <= 9) {
                return false;
            } else {
                var $input = this.$el.find('.autocomplete.focused input'),
                    $placeholder = $input.attr('placeholder'),
                    $alternativePlaceholder = $input.attr('data-alt-placeholder');

                $input.attr('data-alt-placeholder', $placeholder);
                $input.attr('placeholder', $alternativePlaceholder);
            }
        },
        toggleAutocomplete: function () {
            if (this.$el.find('.autocomplete').hasClass('focused')) {
                this.hideAutocomplete();
            } else {
                this.trigger('showDropdown');
                this.$el.find('input').focus();
            }
        },
        clearAutocomplete: function () {
            var $autocomplete = this.$el.find('.autocompleteResults');
            $autocomplete.html('');
            this.$el.removeClass('selected');
        },
        render: function () {
            var that = this;

            // Bind hideAutocomplete
            $(document).on('mouseup touchend', function (e) {
                if ($(e.target).closest(that.$el).length === 1) {
                    return true;
                } else {
                    that.hideAutocomplete();
                }
            });

            if (this.options.dropdown) {
                this.options.dropdown.render();
                this.options.dropdown.hide();

                this.options.dropdown.$el.on('touchstart touchmove', function () {
                    if ($(window).width() <= 380) {
                        document.activeElement.blur();
                        this.$el.find('input').blur();
                    }
                });

                this.options.dropdown.listenTo(this, 'showDropdown', this.options.dropdown.show);
                this.options.dropdown.listenTo(this, 'hideDropdown', this.options.dropdown.hide);
            }
            return this;
        }
    });

    var AutocompleteResultsView = Backbone.View.extend({
        initialize: function (options) {
            this.options = options || {};
        },
        render: function () {
            var that = this;
            this.$el.empty();
            this.collection.each(function (item) {
                var autocompleteResultsSingleView = new AutocompleteResultsSingleView({
                    model: item,
                    itemSelectedCallback: that.options.itemSelectedCallback
                });
                this.$el.append(autocompleteResultsSingleView.render().el);
            }, this);

            forceRedraw(this.$el[0]);

            return this;
        }
    });

    var AutocompleteResultsSingleView = Backbone.View.extend({
        tagName: 'li',
        className: 'single',
        template: _.template($('#autocompleteResultsSingleView').html()),
        events: {
            'click a': 'selectItem'
        },
        initialize: function (options) {
            this.options = options || {};
        },
        selectItem: function (e) {
            e.preventDefault();
            debug('itemSelected');

            // Execute callback
            this.options.itemSelectedCallback(this.model);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var Autocomplete = {};

    Autocomplete.init = function ($el, options) {
        debug('init autocomplete');
        var autocompleteView,
            autoCompleteDataCollection;

        autoCompleteDataCollection = new AutoCompleteDataCollection({
            urlEndpoint: options.url,
            type: options.type
        });

        autocompleteView = new AutocompleteView({
            el: $el,
            collection: autoCompleteDataCollection,
            itemSelectedCallback: options.itemSelectedCallback,
            filterFunction: options.filterFunction,
            dropdown: options.dropdown
        });
        autocompleteView.render();
    };

    /**
    * Component Init.
    */

    App.Components.autocomplete = function ($el, options) {
        Autocomplete.init($el, options);
    };

}(window.App));
