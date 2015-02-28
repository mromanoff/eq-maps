(function(App) {
    "use strict";
    App.Components["profile-info"] = function($el) {
        var UserHeroView = Backbone.View.extend({
            el: $el.find(".header-container"),
            template: _.template($("#userHeroTemplate").html()),
            initialize: function(options) {
                this.options = options || {};
            },
            render: function() {
                if (window.user) {
                    this.$el.html(this.template({
                        firstName: window.user.FirstName,
                        lastName: window.user.LastName,
                        sinceDate: moment(this.options.sinceDate).year()
                    }));
                }
                if (this.options.image) {
                    $("img.profile-image", this.$el).attr("src", this.options.image);
                }
            }
        });
        var SelectView = Backbone.View.extend({
            tagName: "span",
            className: "select-wrapper box",
            template: _.template($("#dateDropdownTemplate").html()),
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
            el: $el.find(".personal-info"),
            events: {
                "keyup .weight input": "numericInput",
                "keyup .height input": "numericInput",
                "keyup .height input.inches": "limitInches",
                "change .month-select": "updateDayList",
                "change .year-select": "updateDayList",
                "change label.gender-select": "selectGender",
                "click a.edit-info": "editMode",
                "click a.save-info": "saveInfo"
            },
            template: _.template($("#profileInfoTemplate").html()),
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
            editMode: function(e) {
                e.preventDefault();
                window.tagData.profile = window.tagData.profile || {};
                window.tagData.profile = {
                    action: "edit-start"
                };
                window.track("profileEdit", window.tagData.profile);
                this.$el.find(".info").hide();
                this.$el.find(".edit").show();
                this.createCalendar();
                if (this.savedData.height.heightUnit === "in") {
                    this.$el.find(".height .edit .imperial").show();
                } else {
                    this.$el.find(".height .edit .metric").show();
                }
                $(e.currentTarget).hide();
                this.$el.find(".save-info").css("display", "inline-block");
            },
            saveInfo: function(e) {
                e.preventDefault();
                var self = this, height, unit, birthdate, ENDPOINT = APIEndpoint + "/me/profile";
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
                birthdate = $(".age .day-select", self.$el).val() + " " + $(".age .month-select", self.$el).val() + " " + $(".age .year-select", self.$el).val();
                var profile = {
                    age: moment().diff(birthdate, "years") || self.$el.find(".age").data("age-value"),
                    birthdate: moment(birthdate).toISOString() || self.$el.find(".age").data("birth-value"),
                    gender: self.$el.find(".gender").data("value"),
                    height: height || self.$el.find(".height").data("value"),
                    weight: parseInt(self.$el.find(".weight input").val(), 10) || self.$el.find(".weight").data("value"),
                    unitOfMeasure: unit
                };
                self.loaderAndError.showLoader();
                $.ajax({
                    type: "PUT",
                    url: ENDPOINT,
                    contentType: "application/json",
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    data: JSON.stringify(profile),
                    success: function() {
                        self.loaderAndError.hideLoader();
                        self.savedData.age = profile.age !== "" ? profile.age : self.savedData.age;
                        self.savedData.birthdate = profile.birthdate !== "" ? profile.birthdate : self.savedData.birthdate;
                        self.savedData.gender = profile.gender !== "" ? profile.gender : self.savedData.gender;
                        self.savedData.weight.weight = profile.weight !== "" ? profile.weight : self.savedData.weight.weight;
                        self.savedData.height.height = profile.height !== "" ? profile.height : self.savedData.height.height;
                        self.$el.find(".editable .info").show();
                        self.$el.find(".editable .edit").hide();
                        self.$el.find(".edit-info").css("display", "inline-block");
                        self.$el.find(".save-info").hide();
                        self.render(self.savedData);
                        window.tagData.profile = window.tagData.profile || {};
                        window.tagData.profile = {
                            action: "edit-complete"
                        };
                        window.track("profileEdit", window.tagData.profile);
                    },
                    error: function(d) {
                        debug("server error", d.responseJSON);
                        self.render(self.savedData);
                        self.loaderAndError.showError();
                    }
                });
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
                            var profileImage, userHeroView;
                            self.savedData = data.profile;
                            debug("DATA LOADED", self.savedData);
                            if (self.savedData.profilePictureUrl) {
                                profileImage = self.savedData.profilePictureUrl;
                            }
                            userHeroView = new UserHeroView({
                                image: profileImage,
                                sinceDate: self.savedData.memberSince
                            });
                            userHeroView.render();
                            self.checkUnits();
                            loaderAndError.hideLoader();
                            self.$el.prepend(self.template(self.savedData));
                            if (!self.savedData.age) {
                                self.$el.find(".age .empty").removeClass("hidden");
                                self.$el.find(".age h3").addClass("hidden");
                            }
                            if (!self.savedData.birthdate) {
                                self.savedData.birthdate = moment().format();
                            }
                            if (!self.savedData.height.height) {
                                self.savedData.height.height = 0;
                                self.$el.find(".height .empty").removeClass("hidden");
                                self.$el.find(".height h3").addClass("hidden");
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
                            self.loaderAndError = EQ.Helpers.loaderAndErrorHandler(self.$el.find(".save-info"), {
                                type: "button",
                                errorTitle: "Error"
                            });
                            if (self.savedData.height.heightUnit === "in") {
                                self.$el.find(".height .info.imperial").show();
                            } else {
                                self.$el.find(".height .info.metric").show();
                            }
                        },
                        error: function(d) {
                            debug("server error", d.responseJSON);
                            loaderAndError.showError();
                        }
                    });
                }
            }
        });
        var HorizontalSelector = Backbone.View.extend({
            tagName: "ul",
            className: "horizontal-selector",
            template: _.template($("#horizontalSelector").html()),
            events: {
                "click li": "updateValue"
            },
            initialize: function(options) {
                this.value = options.value;
                this.callback = options.callback;
            },
            updateValue: function(e) {
                this.value = $(e.target).data("id");
                this.$el.find("li").removeClass("active");
                $(e.target).addClass("active");
                this.callback(this.value);
            },
            render: function() {
                this.$el.prepend(this.template());
                if (this.value !== "") {
                    this.$el.find("li[data-id=" + this.value + "]").addClass("active");
                }
                return this;
            }
        });
        var VerticalSelector = Backbone.View.extend({
            tagName: "ul",
            className: "vertical-selector",
            template: _.template($("#verticalSelector").html()),
            events: {
                "click li[data-value]": "updateValue"
            },
            initialize: function(options) {
                this.value = options.value;
                this.callback = options.callback;
            },
            updateValue: function(e) {
                this.value = $(e.target).data("value");
                this.$el.find("li").removeClass("active");
                $(e.target).addClass("active");
                this.callback(this.value);
            },
            render: function() {
                this.$el.prepend(this.template());
                if (this.value !== "") {
                    this.$el.find("li[data-value=" + this.value + "]").addClass("active");
                }
                return this;
            }
        });
        var BikeStep = Backbone.View.extend({
            initialize: function(options) {
                this.active = false;
                this.value = options.value;
                this.stepId = options.id;
                this.isDefault = false;
                if (this.value === "") {
                    this.isDefault = true;
                    if (this.id === "seat" || this.id === "handlebar") {
                        this.value = "zero";
                    } else {
                        this.value = 0;
                    }
                }
            },
            updateValue: function(value) {
                var el = this.$el.find(".settings-container ." + this.stepId);
                el.find(".step-" + this.value).addClass("hidden");
                this.value = value;
                this.isDefault = false;
                this.showValue();
                el.find(".step-" + this.value).removeClass("hidden");
            },
            showValue: function() {
                var text = this.value;
                if (this.isDefault) {
                    text = "--";
                } else {
                    if (this.id === "seat" || this.id === "handlebar") {
                        var textValues = {
                            zero: "0",
                            plus: "+",
                            minus: "-",
                            one: "1",
                            two: "2"
                        };
                        text = textValues[text];
                    }
                }
                this.$el.find(".containers-row ." + this.stepId + " .input span").text(text);
                this.$el.find(".containers-row ." + this.stepId + " .info").addClass("active");
            },
            hideStep: function() {
                this.$el.find(".settings-container ul.horizontal-selector").remove();
                this.$el.find(".settings-container ul.vertical-selector").remove();
                this.$el.find(".settings-container ." + this.stepId).addClass("hidden");
            },
            showStep: function() {
                var selector, el = this.$el.find(".settings-container ." + this.stepId);
                this.showValue();
                if (this.id === "seat" || this.id === "handlebar") {
                    selector = new HorizontalSelector({
                        value: this.value,
                        callback: this.updateValue.bind(this)
                    });
                } else {
                    selector = new VerticalSelector({
                        value: this.value,
                        callback: this.updateValue.bind(this)
                    });
                }
                el.removeClass("hidden");
                el.find(".step-" + this.value).removeClass("hidden");
                this.$el.find(".containers-row").attr("class", "containers-row " + this.stepId);
                this.$el.find(".settings-container").prepend(selector.render().el);
            },
            render: function() {
                return this;
            }
        });
        var BikeSettings = Backbone.View.extend({
            el: $el.find(".bike-settings"),
            events: {
                "click .get-started button": "startBikeSettings",
                "click .controls #back-btn": "prevStep",
                "click .controls #next-btn": "nextStep",
                "click .controls #done-btn": "saveSettings",
                "click a.edit-info": "editMode",
                "click a.save-info": "saveSettings"
            },
            initialize: function() {
                this.currentStep = 0;
            },
            editMode: function(e) {
                e.preventDefault();
                var bikeStepEl = this.$el.find(".bike-settings-container");
                $(".validation-feedback").addClass("hidden");
                this.$el.find("a.edit-info").hide();
                this.$el.find("a.save-info").show();
                this.$el.find(".settings-container").show();
                this.$el.find(".controls").show();
                this.$el.find(".containers-row .info").attr("class", "info");
                this.$el.addClass("edit-mode");
                this.bikeSteps = [];
                this.bikeSteps.push(new BikeStep({
                    el: bikeStepEl,
                    value: this.bikeSettings.preferences.seatHeight,
                    id: "seat-height"
                }));
                this.bikeSteps.push(new BikeStep({
                    el: bikeStepEl,
                    value: this.bikeSettings.preferences.seatPosition,
                    id: "seat"
                }));
                this.bikeSteps.push(new BikeStep({
                    el: bikeStepEl,
                    value: this.bikeSettings.preferences.handlebarHeight,
                    id: "handlebar-height"
                }));
                this.bikeSteps.push(new BikeStep({
                    el: bikeStepEl,
                    value: this.bikeSettings.preferences.handlebarPosition,
                    id: "handlebar"
                }));
                this.bikeSteps[this.currentStep].showStep();
            },
            startBikeSettings: function() {
                var bikeStepEl = this.$el.find(".bike-settings-container");
                this.$el.find(".get-started").addClass("hidden");
                this.$el.find(".bike-settings-container").removeClass("hidden");
                this.$el.find("a.edit-info").hide();
                this.$el.find("a.save-info").show();
                this.$el.find(".settings-container").show();
                this.$el.find(".controls").show();
                this.$el.find(".containers-row .info").attr("class", "info");
                this.$el.addClass("edit-mode");
                this.bikeSteps = [];
                this.bikeSteps.push(new BikeStep({
                    el: bikeStepEl,
                    value: "",
                    id: "seat-height"
                }));
                this.bikeSteps.push(new BikeStep({
                    el: bikeStepEl,
                    value: "",
                    id: "seat"
                }));
                this.bikeSteps.push(new BikeStep({
                    el: bikeStepEl,
                    value: "",
                    id: "handlebar-height"
                }));
                this.bikeSteps.push(new BikeStep({
                    el: bikeStepEl,
                    value: "",
                    id: "handlebar"
                }));
                this.bikeSteps[this.currentStep].showStep();
            },
            saveSettings: function(e) {
                e.preventDefault();
                var self = this, loaderAndError, newSettings = {
                    seatHeight: parseInt(this.bikeSteps[0].value, 10),
                    seatPosition: this.bikeSteps[1].value,
                    handlebarHeight: parseInt(this.bikeSteps[2].value, 10),
                    handlebarPosition: this.bikeSteps[3].value
                };
                loaderAndError = EQ.Helpers.loaderAndErrorHandler(self.$el.find(".save-loader"), {
                    errorTitle: "Error"
                });
                loaderAndError.showLoader();
                self.$el.find(".save-info").hide();
                EQ.Helpers.putService("/v2.6/me/preferences/bike/save", newSettings).done(function() {
                    loaderAndError.hideLoader();
                    self.bikeSettings.preferences = newSettings;
                    self.doneStep();
                }).fail(function() {
                    loaderAndError.showError();
                    self.$el.find(".save-info").show();
                });
            },
            doneStep: function() {
                if (this.currentStep !== 0) {
                    this.changeBackStepName();
                }
                this.$el.find(".containers-row .info").addClass("active");
                this.$el.find("a.edit-info").show();
                this.$el.find("a.save-info").hide();
                this.$el.find(".controls #next-btn").removeClass("hidden");
                this.$el.find(".controls #done-btn").addClass("hidden");
                this.$el.find(".controls").hide();
                this.$el.removeClass("edit-mode");
                this.bikeSteps[this.currentStep].hideStep();
                this.currentStep = 0;
                this.$el.find(".bike-settings-container .steps .step").text("1");
            },
            nextStep: function(e) {
                e.preventDefault();
                if (this.currentStep === 0) {
                    this.changeBackStepName();
                }
                if (this.currentStep === 2) {
                    this.$el.find(".controls #next-btn").addClass("hidden");
                    this.$el.find(".controls #done-btn").removeClass("hidden");
                }
                this.bikeSteps[this.currentStep].hideStep();
                this.currentStep++;
                this.updateStep();
            },
            changeBackStepName: function() {
                var backBtn = this.$el.find(".controls #back-btn"), backTxt = backBtn.data("alt");
                backBtn.data("alt", backBtn.text());
                this.$el.find(".controls #back-btn").text(backTxt);
            },
            backStep: function() {
                if (this.bikeSettings.isDefault) {
                    this.$el.find(".get-started").removeClass("hidden");
                    this.$el.find(".bike-settings-container").addClass("hidden");
                    this.$el.find(".steps-container div").each(function() {
                        $(this).addClass("hidden");
                    });
                } else {
                    this.bikeSteps[0].updateValue(this.bikeSettings.preferences.seatHeight);
                    this.bikeSteps[1].updateValue(this.bikeSettings.preferences.seatPosition);
                    this.bikeSteps[2].updateValue(this.bikeSettings.preferences.handlebarHeight);
                    this.bikeSteps[3].updateValue(this.bikeSettings.preferences.handlebarPosition);
                }
                this.$el.removeClass("edit-mode");
                this.$el.find("a.edit-info").show();
                this.$el.find("a.save-info").hide();
                this.$el.find(".controls").hide();
                this.bikeSteps[this.currentStep].hideStep();
                this.$el.find(".bike-settings-container .steps .step").text("1");
            },
            prevStep: function(e) {
                e.preventDefault();
                if (this.currentStep === 0) {
                    this.backStep();
                } else {
                    var step = this.bikeSteps[this.currentStep];
                    if (this.currentStep === 1) {
                        this.changeBackStepName();
                    }
                    if (this.currentStep === 3) {
                        this.$el.find(".controls #next-btn").removeClass("hidden");
                        this.$el.find(".controls #done-btn").addClass("hidden");
                    }
                    this.$el.find(".containers-row ." + step.stepId + " .info").removeClass("active");
                    step.hideStep();
                    this.currentStep--;
                    this.updateStep();
                }
            },
            updateStep: function() {
                this.$el.find(".bike-settings-container .steps .step").text(this.currentStep + 1);
                this.bikeSteps[this.currentStep].showStep();
            },
            render: function() {
                var self = this;
                self.$el.find("a.save-info").hide();
                self.loaderAndError = EQ.Helpers.loaderAndErrorHandler(self.$el.find(".loader"), {
                    errorTitle: "Error"
                });
                self.loaderAndError.showLoader();
                EQ.Helpers.getService("/v2.6/me/preferences/bike").done(function(data) {
                    console.log("BIKESETTINGS LOADED", data);
                    self.bikeSettings = data;
                    self.loaderAndError.hideLoader();
                    if (self.bikeSettings.isDefault) {
                        self.$el.find(".get-started").removeClass("hidden");
                    } else {
                        self.$el.find(".bike-settings-container").removeClass("hidden");
                        self.$el.find(".settings-container").hide();
                        self.$el.find(".controls").hide();
                        var textValues = {
                            zero: "0",
                            plus: "+",
                            minus: "-",
                            one: "1",
                            two: "2"
                        };
                        self.$el.find(".containers-row .seat-height .input span").text(self.bikeSettings.preferences.seatHeight);
                        self.$el.find(".containers-row .seat .input span").text(textValues[self.bikeSettings.preferences.seatPosition]);
                        self.$el.find(".containers-row .handlebar-height .input span").text(self.bikeSettings.preferences.handlebarHeight);
                        self.$el.find(".containers-row .handlebar .input span").text(textValues[self.bikeSettings.preferences.handlebarPosition]);
                    }
                }).fail(function() {
                    self.loaderAndError.showError();
                });
                return self;
            }
        });
        var profileInfoView = new ProfileInfoView(), bikeSettings = new BikeSettings();
        profileInfoView.render();
        bikeSettings.render();
    };
})(window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
