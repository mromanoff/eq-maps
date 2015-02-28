(function(App) {
    "use strict";
    var overlayTemplate = "" + '<div class="automatic-calories-container">' + '<a href="#" class="icon-close close-overlay"></a>' + "<h1>Automatic Class Calories</h1>" + "<p>Equinox now provides estimated calories burned in classes, based on member’s age, gender, height and weight.</p>" + '<div class="personal-info-container">' + "<p>To activate, please update your profile:</p>" + '<div class="module-container personal-info">' + '<div class="loader"></div>' + "</div>" + "</div>" + '<button class="button box small black activate-acce">Activate Now</button>' + '<button class="button box small white deactivate-acce">Not right now</button>' + "</div>";
    var dateDropdownTemplate = "<option value=\"<%= date %>\"<%= active ? ' selected' : '' %>><%= date %></option>", profileInfoTemplate = "" + '<div class="half-container age" data-value="<%= birthdate || \'\' %>">' + '<div class="info">' + "<h3><%= age %></h3>" + '<div class="empty hidden"><span></span></div>' + "<span>Age</span>" + "</div>" + '<div class="edit">' + '<div class="input-container">' + "<span>Birthday</span>" + "</div>" + "</div>" + "</div>" + '<div class="half-container height right" data-value="<%= height.height %>">' + '<div class="info imperial">' + "<h3><%= height.feet || '' %><span class=\"suffix\">ft</span> <%= height.inch || '' %><span class=\"suffix\">in</span></h3>" + '<div class="empty hidden"><span></span></div>' + "<span>Height</span>" + "</div>" + '<div class="info metric">' + '<h3><%= height.height %><span class="suffix"><%= height.heightUnit %></span></h3>' + '<div class="empty hidden"><span></span></div>' + "<span>Height</span>" + "</div>" + '<div class="edit">' + '<div class="input-container imperial">' + '<input type="text" class="feet" name="heightft" placeholder="<%= height.feet || \'\' %>" maxlength="2">' + '<label class="suffix">ft</label>' + '<input type="text" class="inches" name="heightin" placeholder="<%= height.inch || \'\' %>" maxlength="2">' + '<label class="suffix">in</label>' + "<span>Height</span>" + "</div>" + '<div class="input-container metric">' + '<input type="text" name="height" placeholder="<%= height.height %>" maxlength="4">' + '<label class="suffix"><%= height.heightUnit %></label>' + "<span>Height</span>" + "</div>" + "</div>" + "</div>" + '<div class="half-container weight right" data-value="<%= weight.weight %>">' + '<div class="info">' + '<h3><%= weight.weight %><span class="suffix"><%= weight.weightUnit %></span></h3>' + '<div class="empty hidden"><span></span></div>' + "<span>Weight</span>" + "</div>" + '<div class="edit">' + '<div class="input-container">' + '<input type="text" name="weight" placeholder="<%= weight.weight %>" maxlength="4">' + '<label class="suffix"><%= weight.weightUnit %></label>' + "<span>Weight</span>" + "</div>" + "</div>" + "</div>" + '<div class="half-container gender right" data-value="<%= gender || \'\' %>">' + '<div class="info">' + '<h3><%= gender ? gender.substr(0,1) : "" %></h3>' + '<div class="empty hidden"><span></span></div>' + "<span>Gender</span>" + "</div>" + '<div class="edit">' + '<div class="input-container">' + '<label class="gender-select<%= gender && gender.substr(0,1) === \'M\' ? \' selected\' : \'\' %>">M<input type="checkbox" name="gender" value="Male"></label> / <label class="gender-select<%= gender && gender.substr(0,1) === \'F\' ? \' selected\' : \'\' %>">F<input type="checkbox" name="gender" value="Female"></label>' + "<span>Gender</span>" + "</div>" + "</div>" + "</div>";
    App.Components["automatic-calories-overlay"] = function($el) {
        $el.addClass("automatic-calories-overlay");
        var SelectView = Backbone.View.extend({
            tagName: "span",
            className: "select-wrapper box",
            template: _.template(dateDropdownTemplate),
            initialize: function(options) {
                this.options = options || {};
            },
            update: function(newDate) {
                this.$el.html("");
                this.options.data = newDate.data;
                this.options.selected = newDate.selected;
                return this.render();
            },
            render: function() {
                var self = this, select = $(document.createElement("select")).addClass(self.options.name), options = $(document.createElement("span")).addClass("option"), tpl = [], selected;
                $.each(self.options.data, function(index, value) {
                    if (value === self.options.selected) {
                        selected = true;
                    } else {
                        selected = false;
                    }
                    tpl.push(self.template({
                        date: value,
                        active: selected
                    }));
                });
                select.append(tpl);
                options.text(self.options.selected);
                self.$el.prepend([ select, options ]);
                App.loadComponent("inline-select", this.$el);
                return self;
            }
        });
        var ProfileInfoView = Backbone.View.extend({
            events: {
                "keyup .weight input": "numericInput",
                "keyup .height input": "numericInput",
                "keyup .height input.inches": "limitInches",
                "change .month-select": "updateDayList",
                "change .year-select": "updateDayList",
                "change label.gender-select": "selectGender"
            },
            template: _.template(profileInfoTemplate),
            numericInput: function(e) {
                $(e.currentTarget).val($(e.currentTarget).val().replace(/[^0-9\.]/g, ""));
            },
            limitInches: function(e) {
                if (parseInt($(e.currentTarget).val(), 10) > 11) {
                    $(e.currentTarget).val("11");
                }
            },
            selectGender: function(e) {
                var gender = $('input[type="checkbox"]', e.currentTarget).val();
                $("label.gender-select", this.$el).each(function() {
                    if ($(this).hasClass("selected")) {
                        $(this).removeClass("selected");
                        $('input[type="checkbox"]', this).prop("checked", false);
                    }
                });
                $(e.currentTarget).parents(".gender").data("value", gender);
                $(e.currentTarget).toggleClass("selected");
            },
            updateDayList: function() {
                var newDay = parseInt($(".age .day-select", this.$el).val(), 10), month = $(".age .month-select", this.$el).val(), year = $(".age .year-select", this.$el).val(), newDate = moment().month(month).year(year), totalNewDays = newDate.daysInMonth(), days = [];
                if (newDay > totalNewDays) {
                    newDay = 1;
                }
                for (var day = 1; day < totalNewDays + 1; day++) {
                    days.push(day);
                }
                this.daySelectView.update({
                    data: days,
                    selected: newDay
                });
            },
            createCalendar: function() {
                var birthday = this.savedData.birthdate, inputContainer = $(".age .edit .input-container", this.$el), selectCollection = [], today = moment(), years = [], months = moment.monthsShort(), days = [], monthSelectView, yearSelectView;
                for (var day = 1; day < moment(birthday).daysInMonth() + 1; day++) {
                    days.push(day);
                }
                this.daySelectView = new SelectView({
                    data: days,
                    name: "day-select",
                    selected: moment(birthday).date()
                });
                selectCollection.push(this.daySelectView.render().$el);
                monthSelectView = new SelectView({
                    data: months,
                    name: "month-select",
                    selected: moment(birthday).format("MMM")
                });
                selectCollection.push(monthSelectView.render().$el);
                var StartYear = today.year() - 100;
                var EndYear = today.year() - 13;
                for (var year = StartYear; year <= EndYear; year++) {
                    years.push(year);
                }
                yearSelectView = new SelectView({
                    data: years,
                    name: "year-select",
                    selected: moment(birthday).year()
                });
                selectCollection.push(yearSelectView.render().$el);
                inputContainer.prepend(selectCollection);
            },
            editMode: function() {
                this.$el.find(".info").hide();
                this.$el.find(".edit").show();
                this.createCalendar();
                if (this.savedData.height.heightUnit === "in") {
                    this.$el.find(".height .edit .imperial").show();
                } else {
                    this.$el.find(".height .edit .metric").show();
                }
                this.$el.find(".save-info").css("display", "inline-block");
            },
            validateData: function(profile) {
                console.log(profile);
                if (profile.weight === null || profile.weight === 0 || profile.weight === "") {
                    this.$el.find(".weight .edit input").addClass("error");
                } else {
                    this.$el.find(".weight .edit input").removeClass("error");
                }
                if (profile.height === null || profile.height === 0 || profile.height === "") {
                    this.$el.find(".height .edit input").addClass("error");
                } else {
                    this.$el.find(".height .edit input").removeClass("error");
                }
                if (profile.gender === null || profile.gender === 0 || profile.gender === "") {
                    this.$el.find(".gender .edit span").addClass("error");
                } else {
                    this.$el.find(".gender .edit span").removeClass("error");
                }
                return this.$el.find(".error").length === 0;
            },
            saveInfo: function(cb, cberror) {
                var self = this, height, unit, birthdate;
                if (this.savedData.height.heightUnit === "in") {
                    var feet, inches;
                    feet = self.$el.find(".height .imperial .feet").val() || self.savedData.height.feet;
                    inches = self.$el.find(".height .imperial .inches").val() || self.savedData.height.inch;
                    height = parseInt(feet * 12, 10) + parseInt(inches, 10);
                    unit = "Imperial";
                } else {
                    height = parseInt(self.$el.find(".height .metric input").val(), 10);
                    unit = "Metric";
                }
                birthdate = $(".age .day-select").val() + " " + $(".age .month-select").val() + " " + $(".age .year-select").val();
                var profile = {
                    age: moment().diff(birthdate, "years") || self.$el.find(".age").data("age-value"),
                    birthdate: moment(birthdate, "D MMM YYYY").toISOString() || self.$el.find(".age").data("birth-value"),
                    gender: self.$el.find(".gender").data("value"),
                    height: height || self.$el.find(".height").data("value"),
                    weight: parseInt(self.$el.find(".weight input").val(), 10) || self.$el.find(".weight").data("value"),
                    unitOfMeasure: unit
                };
                console.log(birthdate, profile.birthdate);
                if (self.validateData(profile) === true) {
                    if (cb && typeof cb === "function") {
                        cb(profile);
                        self.savedData.age = profile.age !== "" ? profile.age : self.savedData.age;
                        self.savedData.birthdate = profile.birthdate !== "" ? profile.birthdate : self.savedData.birthdate;
                        self.savedData.gender = profile.gender !== "" ? profile.gender : self.savedData.gender;
                        self.savedData.weight.weight = profile.weight !== "" ? profile.weight : self.savedData.weight.weight;
                        self.savedData.height.height = profile.height !== "" ? profile.height : self.savedData.height.height;
                        self.$el.find(".editable .info").show();
                        self.$el.find(".editable .edit").hide();
                        self.$el.find(".edit-info").css("display", "inline-block");
                        self.$el.find(".save-info").hide();
                        $(".required").remove();
                        self.render(self.savedData);
                    }
                } else {
                    console.log("error", cberror);
                    if (cberror && typeof cberror === "function") {
                        cberror();
                        $(".automatic-calories-container .required").remove();
                        $('<p class="required">This is required</p>').insertAfter(".personal-info-container > p");
                    }
                }
            },
            checkUnits: function() {
                var heightData = this.savedData.height, height, inch;
                if (heightData.heightUnit === "in") {
                    height = heightData.height / 12;
                    height = height.toString().split(".");
                    this.savedData.height.feet = height[0];
                    inch = "0." + height[1];
                    inch = Math.round(parseFloat(inch, 10) * 12);
                    if (inch === 0) {
                        this.savedData.height.inch = "00";
                    } else {
                        this.savedData.height.inch = inch.toString();
                    }
                }
            },
            initialize: function() {
                var self = this;
                this.listenTo(Backbone.Events, "automatic-calories-overlay:save-info", function(cb, cberror) {
                    self.saveInfo(cb, cberror);
                });
            },
            render: function(data) {
                var self = this, ENDPOINT = APIEndpoint + "/me", loaderAndError;
                loaderAndError = EQ.Helpers.loaderAndErrorHandler(self.$el.find(".loader"), {
                    errorTitle: "Error"
                });
                self.$el.find(".half-container").remove();
                loaderAndError.showLoader();
                if (data) {
                    self.checkUnits();
                    loaderAndError.hideLoader();
                    self.$el.prepend(self.template(data));
                    if (!self.savedData.age) {
                        self.$el.find(".age .empty").removeClass("hidden");
                        self.$el.find(".age h3").addClass("hidden");
                    }
                    if (!self.savedData.height.height) {
                        self.$el.find(".height .empty").removeClass("hidden");
                        self.$el.find(".height h3").addClass("hidden");
                    }
                    if (!self.savedData.weight.weight) {
                        self.$el.find(".weight .empty").removeClass("hidden");
                        self.$el.find(".weight h3").addClass("hidden");
                    }
                    if (self.savedData.height.heightUnit === "in") {
                        self.$el.find(".height .info.imperial").show();
                    } else {
                        self.$el.find(".height .info.metric").show();
                    }
                } else {
                    $.ajax({
                        type: "GET",
                        url: ENDPOINT,
                        contentType: "application/json",
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        success: function(data) {
                            var profileImage;
                            self.savedData = data.profile;
                            if (user && user.FacebookId) {
                                profileImage = "//graph.facebook.com/" + user.FacebookId + "/picture?width=160&height=160";
                            } else if (self.savedData.profilePictureUrl) {
                                profileImage = self.savedData.profilePictureUrl;
                            }
                            self.checkUnits();
                            loaderAndError.hideLoader();
                            console.log(self.savedData.height);
                            self.$el.prepend(self.template(self.savedData));
                            if (!self.savedData.age) {
                                self.$el.find(".age .empty").removeClass("hidden");
                                self.$el.find(".age h3").addClass("hidden");
                            }
                            if (!self.savedData.birthdate) {
                                self.savedData.birthdate = moment();
                            }
                            if (!self.savedData.height.height) {
                                self.savedData.height.height = 0;
                                self.$el.find(".height .empty").removeClass("hidden");
                                self.$el.find(".height h3").addClass("hidden");
                                self.$el.find(".height .metric .edit input").attr("placeholder", "0");
                            }
                            if (!self.savedData.height.feet && !self.savedData.height.inch) {
                                self.savedData.height.feet = 0;
                                self.savedData.height.inch = 0;
                                self.$el.find(".height .empty").removeClass("hidden");
                                self.$el.find(".height h3").addClass("hidden");
                                self.$el.find(".height .imperial .edit input").attr("placeholder", "0");
                            }
                            if (!self.savedData.gender) {
                                self.savedData.gender = 0;
                                self.$el.find(".gender .empty").removeClass("hidden");
                                self.$el.find(".gender h3").addClass("hidden");
                            }
                            if (!self.savedData.weight.weight) {
                                self.savedData.weight.weight = 0;
                                self.$el.find(".weight .empty").removeClass("hidden");
                                self.$el.find(".weight h3").addClass("hidden");
                                self.$el.find(".weight .edit input").attr("placeholder", "0");
                            }
                            self.$el.find(".edit-info").css("display", "inline-block");
                            if (self.savedData.height.heightUnit === "in") {
                                self.$el.find(".height .info.imperial").show();
                            } else {
                                self.$el.find(".height .info.metric").show();
                            }
                            self.editMode();
                            self.trigger("loaded");
                        },
                        error: function(d) {
                            debug("server error", d.responseJSON);
                            loaderAndError.showError();
                        }
                    });
                }
            }
        });
        var OverlayView = Backbone.View.extend({
            template: _.template(overlayTemplate),
            events: {
                "click .close-overlay": "closeView",
                "click .activate-acce": "activateAcce",
                "click .deactivate-acce": "deactivateAcce"
            },
            setCallback: function(cb) {
                this.overlayCallback = cb;
            },
            activateAcce: function(e) {
                e.preventDefault();
                var self = this, loaderAndError = EQ.Helpers.loaderAndErrorHandler(self.$el.find(".activate-acce"), {
                    errorTitle: "Error saving settings.",
                    type: "button"
                });
                loaderAndError.showLoader();
                Backbone.Events.trigger("automatic-calories-overlay:save-info", function(profile) {
                    var profileData = {
                        birthDate: profile.birthdate,
                        unitOfMeasure: profile.unitOfMeasure,
                        height: profile.height,
                        weight: profile.weight,
                        gender: profile.gender
                    };
                    EQ.Helpers.putService("/v2.6/me/profile/enableacce", profileData).done(function() {
                        loaderAndError.hideLoader();
                        if (self.overlayCallback && typeof self.overlayCallback === "function") {
                            self.overlayCallback("on");
                        }
                        Backbone.Events.trigger("automatic-calories-overlay:close");
                    }).fail(function() {
                        loaderAndError.showError();
                    });
                }, function() {
                    loaderAndError.hideLoader();
                });
            },
            deactivateAcce: function(e) {
                e.preventDefault();
                var self = this, loaderAndError = EQ.Helpers.loaderAndErrorHandler(self.$el.find(".activate-acce"), {
                    errorTitle: "Error saving settings.",
                    type: "button"
                });
                loaderAndError.showLoader();
                EQ.Helpers.putService("/v2.6/me/profile/disableacce").done(function() {
                    loaderAndError.hideLoader();
                    if (self.overlayCallback && typeof self.overlayCallback === "function") {
                        self.overlayCallback("off");
                    }
                    Backbone.Events.trigger("automatic-calories-overlay:close");
                }).fail(function() {
                    loaderAndError.showError();
                });
            },
            enableSave: function() {
                this.$el.find("button").fadeIn();
            },
            closeView: function(e) {
                e.preventDefault();
                Backbone.Events.trigger("automatic-calories-overlay:close");
            },
            render: function() {
                var self = this;
                this.setElement(this.template({}));
                this.$el.find("button").hide();
                var profileInfoView = new ProfileInfoView({
                    el: this.$el.find(".personal-info")
                });
                profileInfoView.render();
                this.listenTo(this, "remove", profileInfoView.remove);
                this.listenTo(profileInfoView, "loaded", self.enableSave);
                return this;
            }
        });
        var overlayView = new OverlayView();
        Backbone.Events.on("automatic-calories-overlay:open", function(cb) {
            if (cb && typeof cb === "function") {
                overlayView.setCallback(cb);
            }
            $el.html(overlayView.render().el);
            $el.addClass("open");
        });
        Backbone.Events.on("automatic-calories-overlay:close", function() {
            overlayView.remove();
            $el.removeClass("open");
        });
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
