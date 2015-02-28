(function(global, App) {
    "use strict";
    var Favorites = {};
    Favorites.init = function($el) {
        debug("favorites component");
        var $favoritesClasses = $el.find(".favorites-classes"), $favoritesLocations = $el.find(".favorites-locations"), $favoritesInstructors = $el.find(".favorites-instructors"), $favoritesCategories = $el.find(".favorites-categories"), $favoritesBikes = $el.find(".favorites-bikes"), $bgEditMode = $('<div class="bg-edit-mode hidden"></div>'), LocationDropdownView, LocationForBikesDropdownView, CategoriesDropdownView, locationDropdownView, locationDropdownForBikes, categoriesDropdownView, generalLoaders;
        generalLoaders = EQ.Helpers.loaderAndErrorHandler($(".loader-container"));
        generalLoaders.showLoader();
        LocationDropdownView = Backbone.View.extend({
            el: $favoritesLocations.find(".autocompleteDropdown"),
            events: {
                "click .region-title": "expandRegion",
                "click .facility": "addItem"
            },
            show: function() {
                this.$el.show();
            },
            hide: function() {
                this.addFilters();
                this.$el.find(".open").removeClass("open");
                this.$el.find(".active").removeClass("active");
                this.$el.find(".selected").removeClass("selected");
                this.selectedItems = [];
                this.$el.hide();
            },
            addFilters: function() {
                var that = this;
                if (this.selectedItems.length !== 0) {
                    Backbone.Events.trigger("locationSelector:add-items", that.selectedItems);
                }
            },
            selectedItems: [],
            addItem: function(e) {
                e.preventDefault();
                var $item = $(e.currentTarget);
                var item = {
                    id: $item.data("id"),
                    displayText: $item.text(),
                    type: "clubs"
                };
                if (_.some(this.selectedItems, item)) {
                    console.log("rm", this.selectedItems);
                    this.selectedItems = _.reject(this.selectedItems, item);
                    console.log("rm", this.selectedItems);
                } else {
                    this.selectedItems.push(item);
                }
                $item.toggleClass("selected");
            },
            expandRegion: function(e) {
                e.preventDefault();
                var $li = $(e.currentTarget);
                var $region = $('ul[data-region="' + $li.data("region") + '"]'), $facilities = $('ul[data-facilities="' + $li.data("region") + '"]');
                if ($region.length !== 0) {
                    this.$el.find(".open").not($region).not($region.parent()).removeClass("open");
                    $region.toggleClass("open");
                } else {
                    this.$el.find(".open").not($facilities).not($facilities.parent()).removeClass("open");
                    $facilities.toggleClass("open");
                }
                if ($li.hasClass("active") === false) {
                    this.$el.animate({
                        scrollTop: this.$el.scrollTop() + $li.position().top
                    });
                }
                this.$el.find(".active").not($li).removeClass("active");
                $li.toggleClass("active");
            },
            render: function() {
                var that = this;
                _.each(allRegionsData, function(region) {
                    that.$el.append('<li class="region-title" data-region="' + region.ShortName + '"><a href="#">' + region.Name + "</a></li>");
                    if (region.SubRegions.length !== 0) {
                        var $region = $('<ul data-region="' + region.ShortName + '"></ul>');
                        _.each(region.SubRegions, function(subregion) {
                            $region.append('<li class="region-title" data-region="' + subregion.ShortName + '"><a href="#">' + subregion.Name + "</a></li>");
                            var $facilities = $('<ul data-facilities="' + subregion.ShortName + '""></ul>');
                            _.each(subregion.Facilities, function(facility) {
                                $facilities.append('<li><a class="facility" href="#" data-id="' + facility.Id + '">' + facility.ClubName + "</a></li>");
                            });
                            $region.append($facilities);
                        });
                        that.$el.append($region);
                    } else {
                        var $facilities = $('<ul data-facilities="' + region.ShortName + '""></ul>');
                        _.each(region.Facilities, function(facility) {
                            if (facility.IsAvailableOnline && facility.IsPresale === false) {
                                $facilities.append('<li><a class="facility" href="#" data-id="' + facility.Id + '">' + facility.ClubName + "</a></li>");
                            }
                        });
                        that.$el.append($facilities);
                    }
                });
            }
        });
        LocationForBikesDropdownView = Backbone.View.extend({
            el: $favoritesBikes.find(".autocompleteDropdown"),
            events: {
                "click .region-title": "expandRegion",
                "click .facility": "addItem"
            },
            show: function() {
                this.$el.show();
            },
            hide: function() {
                this.$el.find(".open").removeClass("open");
                this.$el.find(".active").removeClass("active");
                this.$el.find(".selected").removeClass("selected");
                this.selectedItems = [];
                this.$el.hide();
            },
            selectedItems: [],
            addItem: function(e) {
                e.preventDefault();
                var $item = $(e.currentTarget);
                var item = {
                    id: $item.data("id"),
                    displayText: $item.text(),
                    type: "clubs"
                };
                Backbone.Events.trigger("locationSelectorBikes:add-item", item);
            },
            expandRegion: function(e) {
                e.preventDefault();
                var $li = $(e.currentTarget);
                var $region = $('ul[data-region="' + $li.data("region") + '"]'), $facilities = $('ul[data-facilities="' + $li.data("region") + '"]');
                if ($region.length !== 0) {
                    this.$el.find(".open").not($region).not($region.parent()).removeClass("open");
                    $region.toggleClass("open");
                } else {
                    this.$el.find(".open").not($facilities).not($facilities.parent()).removeClass("open");
                    $facilities.toggleClass("open");
                }
                if ($li.hasClass("active") === false) {
                    this.$el.animate({
                        scrollTop: this.$el.scrollTop() + $li.position().top
                    });
                }
                this.$el.find(".active").not($li).removeClass("active");
                $li.toggleClass("active");
            },
            render: function() {
                var that = this;
                EQ.Helpers.user.getFavorites(function(data) {
                    if (data.clubs.length !== 0) {
                        that.$el.prepend('<li class="region-title" data-region="favorites"><a href="">Favorite Clubs</a></li>');
                        var $favs = $('<ul data-facilities="favorites"></ul>');
                        _.each(data.clubs, function(facility) {
                            $favs.append('<li><a class="facility" href="#" data-id="' + facility.id + '">' + facility.displayText + "</a></li>");
                        });
                        that.$el.find('[data-region="favorites"]').after($favs);
                        that.delegateEvents();
                    }
                });
                _.each(allRegionsData, function(region) {
                    that.$el.append('<li class="region-title" data-region="' + region.ShortName + '"><a href="#">' + region.Name + "</a></li>");
                    if (region.SubRegions.length !== 0) {
                        var $region = $('<ul data-region="' + region.ShortName + '"></ul>');
                        _.each(region.SubRegions, function(subregion) {
                            $region.append('<li class="region-title" data-region="' + subregion.ShortName + '"><a href="#">' + subregion.Name + "</a></li>");
                            var $facilities = $('<ul data-facilities="' + subregion.ShortName + '""></ul>');
                            _.each(subregion.Facilities, function(facility) {
                                $facilities.append('<li><a class="facility" href="#" data-id="' + facility.Id + '">' + facility.ClubName + "</a></li>");
                            });
                            $region.append($facilities);
                        });
                        that.$el.append($region);
                    } else {
                        var $facilities = $('<ul data-facilities="' + region.ShortName + '""></ul>');
                        _.each(region.Facilities, function(facility) {
                            if (facility.IsAvailableOnline && facility.IsPresale === false) {
                                $facilities.append('<li><a class="facility" href="#" data-id="' + facility.Id + '">' + facility.ClubName + "</a></li>");
                            }
                        });
                        that.$el.append($facilities);
                    }
                });
            }
        });
        CategoriesDropdownView = Backbone.View.extend({
            el: $favoritesCategories.find(".autocompleteDropdown"),
            events: {
                "click .item-title": "expandRegion",
                "click .item": "addItem"
            },
            show: function() {
                this.$el.show();
            },
            hide: function() {
                this.addFilters();
                this.$el.find(".open").removeClass("open");
                this.$el.find(".active").removeClass("active");
                this.$el.find(".selected").removeClass("selected");
                this.selectedItems = [];
                this.$el.hide();
            },
            addFilters: function() {
                var that = this;
                if (this.selectedItems.length !== 0) {
                    Backbone.Events.trigger("categorySelector:add-items", that.selectedItems);
                }
            },
            selectedItems: [],
            addItem: function(e) {
                e.preventDefault();
                var $item = $(e.currentTarget);
                var item = {
                    id: $item.data("id"),
                    displayText: $item.text(),
                    type: "categories"
                };
                if (_.some(this.selectedItems, item)) {
                    console.log("rm", this.selectedItems);
                    this.selectedItems = _.reject(this.selectedItems, item);
                    console.log("rm", this.selectedItems);
                } else {
                    this.selectedItems.push(item);
                }
                $item.toggleClass("selected");
            },
            expandRegion: function(e) {
                e.preventDefault();
                var $li = $(e.currentTarget);
                var $items = $('ul[data-items="' + $li.data("items") + '"]');
                if ($items.length !== 0) {
                    this.$el.find(".open").not($items).not($items.parent()).removeClass("open");
                    $items.toggleClass("open");
                }
                if ($li.hasClass("active") === false) {
                    this.$el.animate({
                        scrollTop: this.$el.scrollTop() + $li.position().top
                    });
                }
                this.$el.find(".active").not($li).removeClass("active");
                $li.toggleClass("active");
            },
            render: function() {
                var that = this;
                $.ajax({
                    type: "GET",
                    url: APIEndpoint + "/classes/categories",
                    contentType: "application/json",
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function(data) {
                        console.log("[categories OK]", data);
                        _.each(data, function(cat) {
                            that.$el.append('<li><a class="item single-level" href="#" data-id="' + cat.categoryId + '">' + cat.categoryName + "</a></li>");
                        });
                        that.delegateEvents();
                    }
                });
            }
        });
        locationDropdownView = new LocationDropdownView();
        locationDropdownForBikes = new LocationForBikesDropdownView();
        categoriesDropdownView = new CategoriesDropdownView();
        EQ.Helpers.user.getFavorites(function(favoritesData) {
            generalLoaders.hideLoader();
            App.loadComponent("favorite-single-box", $favoritesClasses, {
                data: favoritesData.classes,
                componentName: "autocomplete",
                componentOptions: {
                    url: APIEndpoint + "/search/autocomplete/classes?term=",
                    type: "classes"
                }
            });
            App.loadComponent("favorite-single-box", $favoritesLocations, {
                data: favoritesData.clubs,
                componentName: "autocomplete",
                multipleAddingsEvent: "locationSelector:add-items",
                componentOptions: {
                    url: APIEndpoint + "/search/autocomplete/clubs?term=",
                    type: "clubs",
                    dropdown: locationDropdownView
                }
            });
            App.loadComponent("favorite-single-box", $favoritesInstructors, {
                data: favoritesData.instructors,
                componentName: "autocomplete",
                componentOptions: {
                    url: APIEndpoint + "/search/autocomplete/instructors?term=",
                    type: "instructors"
                }
            });
            App.loadComponent("favorite-single-box", $favoritesCategories, {
                data: favoritesData.categories,
                componentName: "autocomplete",
                multipleAddingsEvent: "categorySelector:add-items",
                componentOptions: {
                    url: APIEndpoint + "/search/autocomplete/class-categories?term=",
                    type: "categories",
                    dropdown: categoriesDropdownView
                }
            });
            App.loadComponent("favorite-single-box", $favoritesBikes, {
                data: favoritesData.bikes,
                name: "bikes",
                componentName: "autocomplete",
                listSimpleAddingEvent: "locationSelectorBikes:add-item",
                listSimpleAddingCallback: function(itemModel) {
                    window.location.href = "/bookabike/favorite/" + itemModel.id;
                },
                componentOptions: {
                    url: APIEndpoint + "/search/autocomplete/clubs?term=",
                    dropdown: locationDropdownForBikes,
                    type: "clubs",
                    itemSelectedCallback: function(itemModel) {
                        window.location.href = "/bookabike/favorite/" + itemModel.get("id");
                    }
                }
            });
        });
        $("body").prepend($bgEditMode);
        $bgEditMode.on("click", function() {
            debug("clickoutside!!!");
            App.Events.trigger("clickOnBg");
        });
        App.Events.on("favoriteBoxOpened", function() {
            $bgEditMode.removeClass("hidden");
        });
        App.Events.on("favoriteBoxClosed", function() {
            $bgEditMode.addClass("hidden");
        });
    };
    App.Components.favorites = function($el) {
        Favorites.init($el);
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
