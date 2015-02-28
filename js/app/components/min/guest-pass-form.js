(function(global, App) {
    "use strict";
    App.Components["guest-pass-form"] = function($el) {
        var GuestPass = {};
        GuestPass.BindDropdowns = function() {
            var $regions = "", $clubs = {}, $visitDate = "";
            $.each(global.allRegionsData, function(i, region) {
                if (region.SubRegions && region.SubRegions.length) {
                    $regions += '<option data-slug="' + region.ShortName + '">' + region.Name + "</option>";
                    var facilities = [];
                    $.each(region.SubRegions, function(j, subregion) {
                        facilities = facilities.concat(subregion.Facilities);
                    });
                    $clubs[region.Name] = facilities;
                } else {
                    $regions += '<option data-slug="' + region.ShortName + '">' + region.Name + "</option>";
                    $clubs[region.Name] = region.Facilities;
                }
            });
            $el.find(".region select").html($regions);
            $el.find(".region select").on("change", function() {
                var currentFacilities = $clubs[$(this).val()], $clubsOptions = "";
                $clubsOptions = '<option selected data-id="">Select a club</option>';
                $.each(currentFacilities, function(i, facility) {
                    $clubsOptions += '<option data-id="' + facility.Id + '">' + facility.ClubName + "</option>";
                });
                $el.find(".club select").html($clubsOptions);
                $el.find(".club select").trigger("change");
            });
            $el.find(".region select").trigger("change");
            var createDate = function() {
                var i = 0;
                var date = moment();
                var model;
                var collection = [];
                for (i; i < 14; i++) {
                    model = {
                        dataDate: date.format("YYYY-MM-DD"),
                        date: date.format("dddd"),
                        month: date.format("MMM"),
                        day: date.format("DD")
                    };
                    collection.push(model);
                    date.add("days", 1);
                }
                return collection;
            };
            $visitDate = '<option selected data-id="">Select a date</option>';
            $.each(createDate(), function(i, item) {
                $visitDate += '<option data-id="' + item.dataDate + '">' + item.month + " " + item.day + ", " + item.date + "</option>";
            });
            $el.find(".date select").html($visitDate);
        };
        GuestPass.DefaultSelects = function() {
            if (global.isClubDetail) {
                if (global.selectedRegion) {
                    $el.find(".region select option").each(function(i, el) {
                        if ($(el).data("slug") === global.selectedRegion) {
                            $el.find(".region select").prop("selectedIndex", i).trigger("change");
                        }
                    });
                }
                if (global.currentClub) {
                    $el.find(".club select option").each(function(i, el) {
                        if ($(el).data("id") === +global.currentClub) {
                            $el.find(".club select").prop("selectedIndex", i).trigger("change");
                        }
                    });
                }
            } else {
                EQ.Geo.getLatLng(function() {
                    EQ.Geo.getNearestClub(function(club) {
                        var clubId = club.Id, region = club.Region.replace(/ /g, "-");
                        if (region) {
                            $el.find(".region select option").each(function(i, el) {
                                if ($(el).data("slug") === region) {
                                    $el.find(".region select").prop("selectedIndex", i).trigger("change");
                                }
                            });
                        }
                        if (clubId) {
                            $el.find(".club select option").each(function(i, el) {
                                if ($(el).data("id") === +clubId) {
                                    $el.find(".club select").prop("selectedIndex", i).trigger("change");
                                }
                            });
                        }
                    });
                }, function() {
                    $el.find(".region select option").each(function(i, el) {
                        if ($(el).data("slug") === "New-York") {
                            $el.find(".region select").prop("selectedIndex", i).trigger("change");
                        }
                    });
                });
            }
        };
        GuestPass.Validate = function() {
            var $firstName = $el.find(".first-name"), $lastName = $el.find(".last-name"), $club = $el.find(".club"), $email = $el.find(".email"), $phone = $el.find(".phone"), $date = $el.find(".date");
            var Validators = {
                email: function(value) {
                    return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
                },
                digits: function(value) {
                    return /^\d+$/.test(value);
                },
                phone: function(value) {
                    return /^[0-9()\-\s]+$/.test(value);
                }
            };
            $el.find(".error").removeClass("error");
            if ($firstName.val().length < 1) {
                $firstName.addClass("error");
            } else {
                $firstName.removeClass("error");
            }
            if ($lastName.val().length < 1) {
                $lastName.addClass("error");
            } else {
                $lastName.removeClass("error");
            }
            if ($club.find("select option").filter(":selected").data("id") === "") {
                $club.addClass("error");
            } else {
                $club.removeClass("error");
            }
            if ($date.find("select option").filter(":selected").data("id") === "") {
                $date.parent().addClass("error");
            } else {
                $date.parent().removeClass("error");
            }
            if ($email.length === 1) {
                if ($email.val().length < 3 || Validators.email($email.val()) === false) {
                    $email.addClass("error");
                } else {
                    $email.removeClass("error");
                }
            }
            if ($phone.length === 1) {
                var valid = $phone.val().length > 9 && Validators.phone($phone.val());
                $phone.toggleClass("error", !valid);
            }
        };
        GuestPass.Submit = function() {
            var ENDPOINT_URL = "/me/rewards/guestpass/send";
            $el.find(".submit").on("click", function(e) {
                e.preventDefault();
                GuestPass.Validate();
                var data = {
                    firstName: $el.find(".first-name").val(),
                    lastName: $el.find(".last-name").val(),
                    guestPassId: $el.find(".guest-pass-id").val(),
                    facilityId: $el.find(".club select option").filter(":selected").data("id"),
                    email: $el.find(".email").val(),
                    phoneNumber: $el.find(".phone").val(),
                    passDate: $el.find(".date select option").filter(":selected").data("id")
                };
                Crittercism.leaveBreadcrumb("Ready to Submit. User:" + JSON.stringify(data));
                if ($el.find(".error").length === 0) {
                    $(this).text("Loading...");
                    $.ajax({
                        type: "POST",
                        url: APIEndpoint + ENDPOINT_URL,
                        data: JSON.stringify(data),
                        contentType: "application/json",
                        xhrFields: {
                            withCredentials: true
                        },
                        crossDomain: true
                    }).success(function(response) {
                        if (!response) {
                            var error = {
                                name: "Schedule A Visit - Submission Error",
                                message: "Response:" + response + " - For Submission:" + JSON.stringify(data),
                                htmlMessage: "Response:" + response + " - For Submission:" + JSON.stringify(data),
                                Data: data
                            };
                            Crittercism.logHandledException(error);
                        } else {
                            window.tagData = window.tagData || {};
                            window.tagData.guestPassSubmit = {
                                facilityId: $el.find(".club select option").filter(":selected").data("id"),
                                facilityRegion: $el.find(".region select option").filter(":selected").data("slug") || "NoRegion",
                                formTransactionId: $el.find(".transation-id").val()
                            };
                            window.track("guestPassSubmit", window.tagData.guestPassSubmit);
                            window.location.href = "/rewards/thank-you?emailto=" + data.email + "&fname=" + data.firstName;
                        }
                    }).error(function(xhr) {
                        $el.find(".guest-pass-form").addClass("hidden");
                        $el.find(".guest-pass-error").removeClass("hidden");
                        var error = {
                            name: "Reward A Visit - Backend Error",
                            message: xhr.status + ":" + xhr.statusText,
                            htmlMessage: xhr.responseText,
                            Data: data
                        };
                        Crittercism.logHandledException(error);
                    });
                } else {
                    console.log("Error in validation.");
                }
            });
        };
        GuestPass.init = function() {
            $el.find("input").autoGrowInput({
                comfortZone: 10,
                minWidth: 130
            });
            GuestPass.BindDropdowns();
            GuestPass.Submit();
            $(function() {
                GuestPass.DefaultSelects();
            });
        };
        GuestPass.init();
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
