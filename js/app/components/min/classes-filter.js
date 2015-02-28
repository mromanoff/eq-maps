(function(App) {
    "use strict";
    App.Components["classes-filter"] = function($el, options) {
        window.tagData = window.tagData || {};
        window.tagData.search = window.tagData.search || {};
        window.tagData.search.filterLocationType = "na";
        window.tagData.search.filterInstructorType = "na";
        window.tagData.search.filterCategoryType = "na";
        window.tagData.search.refinement = "new";
        var favLocationData = [], favCategoryData = [], favInstructorData = [];
        var FiltersListCollection = Backbone.Collection.extend({
            initialize: function() {
                this.listenTo(Backbone.Events, "classes-list:remove-filters", this.reset);
            }
        });
        var FilterView = Backbone.View.extend({
            template: _.template($("#addedFilter").html()),
            initialize: function() {
                var that = this;
                var model = that.model.toJSON();
                this.listenTo(Backbone.Events, "classes-list:remove-filters:" + model.id, function() {
                    EQ.Helpers.removeQueryStringVariable(model.type, model.id);
                    that.remove();
                });
                this.listenTo(Backbone.Events, "classes-list:remove-filters", function() {
                    EQ.Helpers.removeQueryStringVariable(model.type, model.id);
                    that.remove();
                });
            },
            events: {
                "click .remove": "removeFilter"
            },
            removeFilter: function(e) {
                e.preventDefault();
                var model = this.model.toJSON();
                EQ.Helpers.removeQueryStringVariable(model.type, model.id);
                this.remove();
                Backbone.Events.trigger("classes-list:fetch", {
                    clubs: clubsFilterCollection.pluck("id"),
                    instructors: instructorsFilterCollection.pluck("id"),
                    categories: categoriesFilterCollection.pluck("id"),
                    classes: classesFilterCollection.pluck("id")
                });
                if (this.model.attributes.type === "categories") {
                    window.tagData.search.refinement = "-category";
                    window.tagData.search.filterCategoryType = "na";
                } else if (this.model.attributes.type === "clubs") {
                    window.tagData.search.refinement = "-location";
                    window.tagData.search.filterLocationType = "na";
                } else if (this.model.attributes.type === "instructors") {
                    window.tagData.search.refinement = "-instructor";
                    window.tagData.search.filterInstructorType = "na";
                }
            },
            render: function() {
                this.setElement(this.template(this.model.toJSON()));
                return this;
            }
        });
        var clubsFilterCollection = new FiltersListCollection();
        var instructorsFilterCollection = new FiltersListCollection();
        var classesFilterCollection = new FiltersListCollection();
        var categoriesFilterCollection = new FiltersListCollection();
        var LocationDropdownView = Backbone.View.extend({
            el: $el.find('[data-autocomplete="clubs"]').find(".autocompleteDropdown"),
            events: {
                "click .region-title .expand": "expandRegion",
                "click .deepselect": "selectAll",
                "click .facility": "addItem"
            },
            show: function() {
                $('[data-facilities="favorites"]').addClass("open");
                var that = this;
                var selected = clubsFilterCollection.toJSON();
                _.each(selected, function(i) {
                    var item = {
                        id: +i.id,
                        displayText: i.displayText
                    };
                    that.selectedItems.push(item);
                    that.$el.find('[data-id="' + item.id + '"]').addClass("selected");
                });
                that.$el.find("ul[data-facilities]").each(function(i, el) {
                    var $children = $(el).find("li a"), $selected = $children.filter(".selected"), region = $(el).data("facilities");
                    if ($selected.length === $children.length) {
                        $("li[data-region=" + region + "] .deepselect").addClass("selected");
                    }
                });
                that.$el.find("ul[data-region]").each(function(i, el) {
                    var $children = $(el).find(".top.region-title .deepselect"), $selected = $children.filter(".selected"), region = $(el).data("region");
                    if ($selected.length === $children.length) {
                        $("li[data-region=" + region + "] .deepselect").addClass("selected");
                    }
                });
                this.$el.show();
            },
            hide: function() {
                this.$el.find(".open").removeClass("open");
                this.$el.find(".active").removeClass("active");
                this.$el.find(".selected").removeClass("selected");
                this.selectedItems = [];
                this.interacted = false;
                this.$el.hide();
            },
            addFilters: function() {
                if (this.interacted) {
                    var that = this;
                    var filters = {
                        clubs: that.selectedItems
                    };
                    Backbone.Events.trigger("classes-filter:add-filters", filters);
                    window.tagData.search.refinement = "+location";
                    filters.clubs.forEach(function(x) {
                        if ($.inArray(parseInt(x.id, 10), favLocationData) === -1) {
                            window.tagData.search.filterLocationType = "ind";
                        } else {
                            window.tagData.search.filterLocationType = "fav";
                        }
                    });
                }
            },
            selectedItems: [],
            interacted: false,
            addItem: function(e) {
                e.preventDefault();
                var $item = $(e.currentTarget);
                var item = {
                    id: +$item.data("id"),
                    displayText: $item.text()
                };
                this.interacted = true;
                if (_.some(this.selectedItems, {
                    id: item.id
                })) {
                    this.selectedItems = _.reject(this.selectedItems, {
                        id: item.id
                    });
                    Backbone.Events.trigger("classes-list:remove-filters:" + item.id);
                    $item.removeClass("selected");
                } else {
                    this.selectedItems.push(item);
                    $item.addClass("selected");
                }
                this.addFilters();
            },
            selectAll: function(e) {
                e.preventDefault();
                var $li = $(e.currentTarget).parent(), that = this;
                var $facilities = $('ul[data-facilities="' + $li.data("region") + '"] li a'), $region = $('ul[data-region="' + $li.data("region") + '"]'), $items = [];
                if ($region.length !== 0) {
                    $facilities = $region.find("ul[data-facilities] li a");
                }
                $facilities.each(function(i, item) {
                    $items.push(item);
                });
                this.interacted = true;
                if ($(e.currentTarget).hasClass("selected") === false) {
                    $(e.currentTarget).addClass("selected");
                    if ($region.length !== 0) {
                        $region.find(".region-title .deepselect").addClass("selected");
                    }
                    _.each($items, function(e) {
                        var $item = $(e);
                        var item = {
                            id: +$item.data("id"),
                            displayText: $item.text()
                        };
                        that.selectedItems.push(item);
                        $item.addClass("selected");
                    });
                } else {
                    $(e.currentTarget).removeClass("selected");
                    if ($region.length !== 0) {
                        $facilities = $region.find(".region-title .deepselect").removeClass("selected");
                    }
                    _.each($items, function(e) {
                        var $item = $(e);
                        var item = {
                            id: +$item.data("id"),
                            displayText: $item.text()
                        };
                        if (_.some(that.selectedItems, {
                            id: item.id
                        })) {
                            that.selectedItems = _.reject(that.selectedItems, {
                                id: item.id
                            });
                            Backbone.Events.trigger("classes-list:remove-filters:" + item.id);
                            $item.removeClass("selected");
                        }
                    });
                }
                this.addFilters();
            },
            expandRegion: function(e) {
                e.preventDefault();
                var $li = $(e.currentTarget).parent();
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
                        that.$el.prepend('<li class="region-title" data-region="favorites"><a class="deepselect" href="#"></a><a class="expand" href="#">Favorite Clubs (' + data.clubs.length + ")</a></li>");
                        var $favs = $('<ul data-facilities="favorites"></ul>');
                        _.each(data.clubs, function(facility) {
                            favLocationData.push(facility.id);
                            console.log(favLocationData);
                            $favs.append('<li><a class="facility" href="#" data-id="' + facility.id + '">' + facility.displayText + "</a></li>");
                        });
                        that.$el.find('[data-region="favorites"]').after($favs);
                        that.delegateEvents();
                    }
                });
                _.each(allRegionsData, function(region) {
                    that.$el.append('<li class="region-title" data-region="' + region.ShortName + '"><a class="deepselect" href="#"></a><a class="expand" href="#">' + region.Name + "</a></li>");
                    if (region.SubRegions.length !== 0) {
                        var $region = $('<ul data-region="' + region.ShortName + '"></ul>');
                        _.each(region.SubRegions, function(subregion) {
                            $region.append('<li class="top region-title" data-region="' + subregion.ShortName + '"><a class="deepselect" href="#"></a><a class="expand" href="#">' + subregion.Name + "</a></li>");
                            var $facilities = $('<ul data-facilities="' + subregion.ShortName + '""></ul>');
                            var sorted = _.sortBy(subregion.Facilities, "ClubName");
                            console.log(subregion.Facilities, sorted);
                            _.each(sorted, function(facility) {
                                $facilities.append('<li><a class="facility" href="#" data-id="' + facility.Id + '">' + facility.ClubName + "</a></li>");
                            });
                            $region.append($facilities);
                        });
                        that.$el.append($region);
                    } else {
                        var $facilities = $('<ul data-facilities="' + region.ShortName + '""></ul>');
                        var sorted = _.sortBy(region.Facilities, "ClubName");
                        _.each(sorted, function(facility) {
                            if (facility.IsAvailableOnline && facility.IsPresale === false) {
                                $facilities.append('<li><a class="facility" href="#" data-id="' + facility.Id + '">' + facility.ClubName + "</a></li>");
                            }
                        });
                        that.$el.append($facilities);
                    }
                });
            }
        }), CategoriesDropdownView = Backbone.View.extend({
            el: $el.find('[data-autocomplete="classes"]').find(".autocompleteDropdown"),
            events: {
                "click .item-title .expand": "expandRegion",
                "click .deepselect": "selectAll",
                "click .item": "addItem"
            },
            initialize: function(options) {
                this.type = options.type;
            },
            show: function() {
                this.$el.find('[data-items="favorites"]').addClass("open");
                this.$el.find('[data-items="categories"]').addClass("open");
                var that = this;
                var selected = categoriesFilterCollection.toJSON().concat(classesFilterCollection.toJSON());
                _.each(selected, function(i) {
                    var item = {
                        id: +i.id,
                        displayText: i.displayText
                    };
                    that.selectedItems.push(item);
                    that.$el.find('[data-id="' + item.id + '"]').addClass("selected");
                });
                that.$el.find("ul[data-items]").each(function(i, el) {
                    var $children = $(el).find("li a"), $selected = $children.filter(".selected"), region = $(el).data("items");
                    if ($selected.length === $children.length) {
                        $("[data-items=" + region + "] .deepselect").addClass("selected");
                    }
                });
                this.$el.show();
            },
            hide: function() {
                this.$el.find(".open").removeClass("open");
                this.$el.find(".active").removeClass("active");
                this.$el.find(".selected").removeClass("selected");
                this.selectedItems = [];
                this.interacted = false;
                this.$el.hide();
            },
            addFilters: function() {
                if (this.interacted) {
                    var classFilters = {}, categoryFilters = {};
                    var classes = _.where(this.selectedItems, {
                        isCatogory: false
                    });
                    if (classes) {
                        classFilters = {
                            classes: classes
                        };
                        Backbone.Events.trigger("classes-filter:add-filters", classFilters);
                    }
                    var categories = _.where(this.selectedItems, {
                        isCatogory: true
                    });
                    if (categories) {
                        categoryFilters = {
                            categories: categories
                        };
                        Backbone.Events.trigger("classes-filter:add-filters", categoryFilters);
                    }
                    window.tagData.search.refinement = "+category";
                    categoryFilters.categories.forEach(function() {
                        window.tagData.search.filterCategoryType = "ind";
                    });
                    classFilters.classes.forEach(function() {
                        window.tagData.search.filterCategoryType = "fav";
                    });
                }
            },
            selectedItems: [],
            interacted: false,
            addItem: function(e) {
                e.preventDefault();
                var $item = $(e.currentTarget);
                var isCatogory = true;
                if ($item.parent().parent().data("items") === "favorites") {
                    isCatogory = false;
                }
                var item = {
                    id: $item.data("id"),
                    displayText: $item.text(),
                    isCatogory: isCatogory
                };
                this.interacted = true;
                if (_.some(this.selectedItems, {
                    id: item.id
                })) {
                    this.selectedItems = _.reject(this.selectedItems, {
                        id: item.id
                    });
                    Backbone.Events.trigger("classes-list:remove-filters:" + item.id);
                    $item.removeClass("selected");
                } else {
                    this.selectedItems.push(item);
                    $item.addClass("selected");
                }
                this.addFilters();
            },
            selectAll: function(e) {
                e.preventDefault();
                var $li = $(e.currentTarget).parent(), that = this;
                var $its = this.$el.find('ul[data-items="' + $li.data("items") + '"] li a'), $items = [];
                $its.each(function(i, item) {
                    $items.push(item);
                });
                this.interacted = true;
                if ($(e.currentTarget).hasClass("selected") === false) {
                    $(e.currentTarget).addClass("selected");
                    _.each($items, function(e) {
                        var $item = $(e), isCatogory = true;
                        if ($item.parent().parent().data("items") === "favorites") {
                            isCatogory = false;
                        }
                        var item = {
                            id: $item.data("id"),
                            displayText: $item.text(),
                            isCatogory: isCatogory
                        };
                        that.selectedItems.push(item);
                        $item.addClass("selected");
                    });
                } else {
                    $(e.currentTarget).removeClass("selected");
                    _.each($items, function(e) {
                        var $item = $(e), isCatogory = true;
                        if ($item.parent().parent().data("items") === "favorites") {
                            isCatogory = false;
                        }
                        var item = {
                            id: $item.data("id"),
                            displayText: $item.text(),
                            isCatogory: isCatogory
                        };
                        if (_.some(that.selectedItems, {
                            id: item.id
                        })) {
                            that.selectedItems = _.reject(that.selectedItems, {
                                id: item.id
                            });
                            Backbone.Events.trigger("classes-list:remove-filters:" + item.id);
                            $item.removeClass("selected");
                        }
                    });
                }
                this.addFilters();
            },
            expandRegion: function(e) {
                e.preventDefault();
                var $li = $(e.currentTarget).parent();
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
                EQ.Helpers.user.getFavorites(function(data) {
                    if (data.classes.length !== 0) {
                        that.$el.prepend('<li class="item-title" data-items="favorites"><a class="deepselect" href="#"></a><a class="expand" href="#">Favorite Classes (' + data.classes.length + ")</a></li>");
                        var $favs = $('<ul data-items="favorites"></ul>');
                        _.each(data.classes, function(c) {
                            $favs.append('<li><a class="item" href="#" data-id="' + c.id + '">' + c.displayText + "</a></li>");
                            favCategoryData.push(c.id);
                        });
                        that.$el.find('[data-items="favorites"]').after($favs);
                        that.delegateEvents();
                    }
                });
                if (this.type !== "bookABike") {
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
                            that.$el.append('<li class="item-title" data-items="categories"><a class="deepselect" href="#"></a><a class="expand" href="#">All Categories</a></li>');
                            var $cats = $('<ul data-items="categories"></ul>'), sorted = _.sortBy(data, "categoryName");
                            _.each(sorted, function(cat) {
                                favCategoryData.push(cat.categoryId);
                                $cats.append('<li><a class="item" href="#" data-id="' + cat.categoryId + '">' + cat.categoryName + "</a></li>");
                            });
                            $cats.find('[data-id="103"]').remove();
                            that.$el.append($cats);
                            that.delegateEvents();
                        }
                    });
                }
            }
        }), InstructorDropdownView = Backbone.View.extend({
            el: $el.find('[data-autocomplete="instructors"]').find(".autocompleteDropdown"),
            events: {
                "click .item-title .expand": "expandRegion",
                "click .deepselect": "selectAll",
                "click .item": "addItem"
            },
            show: function() {
                this.$el.find('[data-items="favorites"]').addClass("open");
                var that = this;
                var selected = instructorsFilterCollection.toJSON();
                _.each(selected, function(i) {
                    var item = {
                        id: +i.id,
                        displayText: i.displayText
                    };
                    that.selectedItems.push(item);
                    that.$el.find('[data-id="' + item.id + '"]').addClass("selected");
                });
                this.$el.show();
            },
            hide: function() {
                this.$el.find(".open").removeClass("open");
                this.$el.find(".active").removeClass("active");
                this.$el.find(".selected").removeClass("selected");
                this.selectedItems = [];
                this.interacted = false;
                this.$el.hide();
            },
            addFilters: function() {
                var that = this;
                if (this.interacted) {
                    var filters = {
                        instructors: that.selectedItems
                    };
                    Backbone.Events.trigger("classes-filter:add-filters", filters);
                    window.tagData.search.refinement = "+instructor";
                    filters.instructors.forEach(function(x) {
                        if ($.inArray(parseInt(x.id, 10), favInstructorData) === -1) {
                            window.tagData.search.filterInstructorType = "ind";
                        } else {
                            window.tagData.search.filterInstructorType = "fav";
                        }
                    });
                }
            },
            selectedItems: [],
            interacted: false,
            addItem: function(e) {
                e.preventDefault();
                var $item = $(e.currentTarget);
                var item = {
                    id: $item.data("id"),
                    displayText: $item.text()
                };
                this.interacted = true;
                if (_.some(this.selectedItems, {
                    id: item.id
                })) {
                    this.selectedItems = _.reject(this.selectedItems, {
                        id: item.id
                    });
                    Backbone.Events.trigger("classes-list:remove-filters:" + item.id);
                    $item.removeClass("selected");
                } else {
                    this.selectedItems.push(item);
                    $item.addClass("selected");
                }
                this.addFilters();
            },
            expandRegion: function(e) {
                e.preventDefault();
                var $li = $(e.currentTarget).parent();
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
            selectAll: function(e) {
                e.preventDefault();
                var $li = $(e.currentTarget).parent(), that = this;
                var $its = this.$el.find('ul[data-items="' + $li.data("items") + '"] li a'), $items = [];
                $its.each(function(i, item) {
                    $items.push(item);
                });
                this.interacted = true;
                if ($(e.currentTarget).hasClass("selected") === false) {
                    $(e.currentTarget).addClass("selected");
                    _.each($items, function(e) {
                        var $item = $(e), isCatogory = true;
                        if ($item.parent().parent().data("items") === "favorites") {
                            isCatogory = false;
                        }
                        var item = {
                            id: $item.data("id"),
                            displayText: $item.text(),
                            isCatogory: isCatogory
                        };
                        that.selectedItems.push(item);
                        $item.addClass("selected");
                    });
                } else {
                    $(e.currentTarget).removeClass("selected");
                    _.each($items, function(e) {
                        var $item = $(e), isCatogory = true;
                        if ($item.parent().parent().data("items") === "favorites") {
                            isCatogory = false;
                        }
                        var item = {
                            id: $item.data("id"),
                            displayText: $item.text(),
                            isCatogory: isCatogory
                        };
                        if (_.some(that.selectedItems, {
                            id: item.id
                        })) {
                            that.selectedItems = _.reject(that.selectedItems, {
                                id: item.id
                            });
                            Backbone.Events.trigger("classes-list:remove-filters:" + item.id);
                            $item.removeClass("selected");
                        }
                    });
                }
                this.addFilters();
            },
            render: function() {
                var that = this;
                EQ.Helpers.user.getFavorites(function(data) {
                    if (data.instructors.length !== 0) {
                        that.$el.prepend('<li class="item-title" data-items="favorites"><a class="deepselect" href="#"></a><a class="expand" href="#">Favorite Instructors (' + data.instructors.length + ")</a></li>");
                        var $favs = $('<ul data-items="favorites"></ul>');
                        _.each(data.instructors, function(facility) {
                            favInstructorData.push(facility.id);
                            console.log(favInstructorData);
                            $favs.append('<li><a class="item" href="#" data-id="' + facility.id + '">' + facility.displayText + "</a></li>");
                        });
                        that.$el.find('[data-items="favorites"]').after($favs);
                        that.delegateEvents();
                    }
                });
            }
        });
        var locationDropdownView = new LocationDropdownView(), categoriesDropdownView = new CategoriesDropdownView({
            type: options.type
        }), instructorDropdownView = new InstructorDropdownView();
        $el.find('[data-autocomplete="clubs"]').each(function() {
            var autocomplete = $(this).data("autocomplete");
            App.loadComponent("autocomplete", $(this), {
                url: APIEndpoint + "/search/autocomplete/" + autocomplete + "/?term=",
                itemSelectedCallback: function(model) {
                    var cid = "" + model.get("id");
                    if (clubsFilterCollection.where({
                        id: cid
                    }).length === 0) {
                        model.set("type", autocomplete);
                        EQ.Helpers.setQueryStringVariable("clubs", cid);
                        clubsFilterCollection.add(model);
                        var FV = FilterView.extend({
                            remove: function() {
                                clubsFilterCollection.remove(this.model);
                                Backbone.View.prototype.remove.call(this);
                            }
                        });
                        var filterView = new FV({
                            model: model
                        });
                        $(".added-filters").prepend(filterView.render().el);
                        Backbone.Events.trigger("classes-list:fetch", {
                            clubs: clubsFilterCollection.pluck("id"),
                            instructors: instructorsFilterCollection.pluck("id"),
                            classes: classesFilterCollection.pluck("id"),
                            categories: categoriesFilterCollection.pluck("id")
                        });
                        window.tagData.search.refinement = "+location";
                        if ($.inArray(parseInt(model.get("id"), 10), favLocationData) === -1) {
                            window.tagData.search.filterLocationType = "ind";
                        } else {
                            window.tagData.search.filterLocationType = "fav";
                        }
                    }
                },
                filterFunction: function(term, success, error) {
                    var flattenedClubs = [], globalFlattenedClubs = [], matches = [];
                    _.each(allRegionsData, function(region) {
                        if (region.SubRegions.length === 0) {
                            _.each(region.Facilities, function(facility) {
                                if (facility.IsAvailableOnline && facility.IsPresale === false) {
                                    flattenedClubs.push(facility);
                                }
                            });
                        } else {
                            _.each(region.SubRegions, function(subregion) {
                                _.each(subregion.Facilities, function(facility) {
                                    flattenedClubs.push(facility);
                                });
                            });
                        }
                    });
                    var clubMatches = _.filter(flattenedClubs, function(club) {
                        return club.ClubName.toLowerCase().indexOf(term.toLowerCase()) !== -1 || club.ShortName.toLowerCase().indexOf(term.toLowerCase()) !== -1;
                    });
                    var globalMatches = _.filter(allRegionsData, function(region) {
                        return region.Name.toLowerCase() === term.toLowerCase();
                    });
                    _.each(globalMatches, function(region) {
                        if (region.SubRegions.length === 0) {
                            _.each(region.Facilities, function(facilty) {
                                globalFlattenedClubs.push(facilty);
                            });
                        } else {
                            _.each(region.SubRegions, function(subregion) {
                                _.each(subregion.Facilities, function(facilty) {
                                    globalFlattenedClubs.push(facilty);
                                });
                            });
                        }
                    });
                    _.each(clubMatches, function(facilty) {
                        globalFlattenedClubs.push(facilty);
                    });
                    if (globalFlattenedClubs.length !== 0) {
                        _.each(globalFlattenedClubs, function(club) {
                            matches.push({
                                id: club.Id,
                                displayText: club.ClubName,
                                score: 1
                            });
                        });
                        success(matches);
                    } else {
                        error();
                    }
                },
                dropdown: locationDropdownView
            });
        });
        $el.find('[data-autocomplete="instructors"]').each(function() {
            var autocomplete = $(this).data("autocomplete");
            App.loadComponent("autocomplete", $(this), {
                url: APIEndpoint + "/search/autocomplete/" + autocomplete + "/?term=",
                itemSelectedCallback: function(model) {
                    var cid = "" + model.get("id");
                    if (instructorsFilterCollection.where({
                        id: cid
                    }).length === 0) {
                        model.set("type", autocomplete);
                        EQ.Helpers.setQueryStringVariable("instructors", cid);
                        instructorsFilterCollection.add(model);
                        var FV = FilterView.extend({
                            remove: function() {
                                instructorsFilterCollection.remove(this.model);
                                Backbone.View.prototype.remove.call(this);
                            }
                        });
                        var filterView = new FV({
                            model: model
                        });
                        $(".added-filters").prepend(filterView.render().el);
                        Backbone.Events.trigger("classes-list:fetch", {
                            clubs: clubsFilterCollection.pluck("id"),
                            instructors: instructorsFilterCollection.pluck("id"),
                            classes: classesFilterCollection.pluck("id"),
                            categories: categoriesFilterCollection.pluck("id")
                        });
                        window.tagData.search.refinement = "+instructor";
                        if ($.inArray(parseInt(model.get("id"), 10), favInstructorData) === -1) {
                            window.tagData.search.filterInstructorType = "ind";
                        } else {
                            window.tagData.search.filterInstructorType = "fav";
                        }
                    }
                },
                dropdown: instructorDropdownView
            });
        });
        $el.find('[data-autocomplete="classes"]').each(function() {
            var autocomplete = $(this).data("autocomplete");
            App.loadComponent("autocomplete", $(this), {
                url: APIEndpoint + "/search/autocomplete/" + autocomplete + "/?term=",
                itemSelectedCallback: function(model) {
                    var cid = "" + model.get("id");
                    if (classesFilterCollection.where({
                        id: cid
                    }).length === 0) {
                        EQ.Helpers.setQueryStringVariable("classes", cid);
                        model.set("type", autocomplete);
                        classesFilterCollection.add(model);
                        var FV = FilterView.extend({
                            remove: function() {
                                classesFilterCollection.remove(this.model);
                                Backbone.View.prototype.remove.call(this);
                            }
                        });
                        var filterView = new FV({
                            model: model
                        });
                        $(".added-filters").prepend(filterView.render().el);
                        Backbone.Events.trigger("classes-list:fetch", {
                            clubs: clubsFilterCollection.pluck("id"),
                            instructors: instructorsFilterCollection.pluck("id"),
                            classes: classesFilterCollection.pluck("id"),
                            categories: categoriesFilterCollection.pluck("id")
                        });
                        window.tagData.search.refinement = "+category";
                        if ($.inArray(parseInt(model.get("id"), 10), favCategoryData) === -1) {
                            window.tagData.search.filterCategoryType = "ind";
                        } else {
                            window.tagData.search.filterCategoryType = "fav";
                        }
                    }
                },
                dropdown: categoriesDropdownView
            });
        });
        Backbone.Events.on("classes-filter:add-filters", function(filters) {
            console.log("filters");
            if (filters && filters.clubs) {
                filters.clubs.forEach(function(club) {
                    var model = new Backbone.Model(club);
                    model.set("type", "clubs");
                    var cid = "" + model.get("id");
                    EQ.Helpers.setQueryStringVariable("clubs", cid);
                    if (clubsFilterCollection.where({
                        id: cid
                    }).length === 0 && clubsFilterCollection.where({
                        id: +cid
                    }).length === 0) {
                        clubsFilterCollection.add(model);
                        var FV = FilterView.extend({
                            remove: function() {
                                clubsFilterCollection.remove(this.model);
                                Backbone.View.prototype.remove.call(this);
                            }
                        });
                        var filterView = new FV({
                            model: model
                        });
                        $(".added-filters").prepend(filterView.render().el);
                    }
                });
            }
            if (filters && filters.instructors) {
                filters.instructors.forEach(function(club) {
                    var model = new Backbone.Model(club);
                    model.set("type", "instructors");
                    var cid = "" + model.get("id");
                    EQ.Helpers.setQueryStringVariable("instructors", cid);
                    if (instructorsFilterCollection.where({
                        id: cid
                    }).length === 0 && instructorsFilterCollection.where({
                        id: +cid
                    }).length === 0) {
                        instructorsFilterCollection.add(model);
                        var FV = FilterView.extend({
                            remove: function() {
                                instructorsFilterCollection.remove(this.model);
                                Backbone.View.prototype.remove.call(this);
                            }
                        });
                        var filterView = new FV({
                            model: model
                        });
                        $(".added-filters").prepend(filterView.render().el);
                    }
                });
            }
            if (filters && filters.categories) {
                filters.categories.forEach(function(club) {
                    var model = new Backbone.Model(club);
                    model.set("type", "categories");
                    var cid = "" + model.get("id");
                    EQ.Helpers.setQueryStringVariable("categories", cid);
                    if (categoriesFilterCollection.where({
                        id: cid
                    }).length === 0 && categoriesFilterCollection.where({
                        id: +cid
                    }).length === 0) {
                        categoriesFilterCollection.add(model);
                        var FV = FilterView.extend({
                            remove: function() {
                                categoriesFilterCollection.remove(this.model);
                                Backbone.View.prototype.remove.call(this);
                            }
                        });
                        var filterView = new FV({
                            model: model
                        });
                        $(".added-filters").prepend(filterView.render().el);
                    }
                });
            }
            if (filters && filters.classes) {
                filters.classes.forEach(function(club) {
                    var model = new Backbone.Model(club);
                    model.set("type", "classes");
                    var cid = "" + model.get("id");
                    EQ.Helpers.setQueryStringVariable("classes", cid);
                    console.log("added class");
                    if (classesFilterCollection.where({
                        id: cid
                    }).length === 0 && classesFilterCollection.where({
                        id: +cid
                    }).length === 0) {
                        classesFilterCollection.add(model);
                        var FV = FilterView.extend({
                            remove: function() {
                                classesFilterCollection.remove(this.model);
                                Backbone.View.prototype.remove.call(this);
                            }
                        });
                        var filterView = new FV({
                            model: model
                        });
                        $(".added-filters").prepend(filterView.render().el);
                    }
                });
            }
            Backbone.Events.trigger("classes-list:fetch", {
                clubs: clubsFilterCollection.pluck("id"),
                instructors: instructorsFilterCollection.pluck("id"),
                categories: categoriesFilterCollection.pluck("id"),
                classes: classesFilterCollection.pluck("id")
            });
        });
        $el.find(".edit-save-filters").on("click", function(e) {
            e.preventDefault();
            $(this).toggleClass("active");
            $(".filter-edit, .selected-filters").slideToggle();
        });
        $(".filter-edit .clear-filters").on("click", function(e) {
            e.preventDefault();
            Backbone.Events.trigger("classes-list:remove-filters");
            Backbone.Events.trigger("classes-list:fetch", null);
        });
        window.track("search", window.tagData.search);
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
