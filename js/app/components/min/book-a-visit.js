(function(global, App) {
    "use strict";
    App.Components["book-a-visit"] = function($el) {
        var SAV = {};
        SAV.BindDropdowns = function() {
            var $regions = "", $clubs = {};
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
                $.each(currentFacilities, function(i, facility) {
                    if (!(facility.IsAvailableOnline === false && facility.IsPresale === false)) {
                        $clubsOptions += '<option data-id="' + facility.Id + '">' + facility.ClubName + "</option>";
                    }
                });
                $el.find(".club select").html($clubsOptions);
                $el.find(".club select").each(function() {
                    var options = $(this).children("option");
                    options.sort(function(optionA, optionB) {
                        return optionA.value.localeCompare(optionB.value);
                    });
                    $(this).empty().append(options);
                });
                $el.find(".club select").prepend('<option selected data-id="">SELECT A CLUB</option>');
                $el.find(".club select").trigger("change");
            });
            $el.find(".region select").trigger("change");
        };
        SAV.DefaultSelects = function() {
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
        SAV.Validate = function() {
            var $firstName = $el.find(".first-name"), $lastName = $el.find(".last-name"), $club = $el.find(".club"), $interest = $el.find("#interest"), $fitness = $el.find("#fitness"), $email = $el.find(".email"), $phone = $el.find(".phone");
            var Validators = {
                email: function(value) {
                    return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
                },
                digits: function(value) {
                    return /^\d+$/.test(value);
                },
                phone: function(value) {
                    return /^[0-9\-()\s]*$/.test(value);
                },
                onlyAlphanumericAndSpaces: function(value) {
                    return /^[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ\s]+$/.test(value);
                }
            };
            $el.find(".error").removeClass("error");
            if ($firstName.val().length < 1 || Validators.onlyAlphanumericAndSpaces($firstName.val()) === false) {
                $firstName.addClass("error");
            } else {
                $firstName.removeClass("error");
            }
            if ($lastName.val().length < 1 || Validators.onlyAlphanumericAndSpaces($lastName.val()) === false) {
                $lastName.addClass("error");
            } else {
                $lastName.removeClass("error");
            }
            console.log("Club", $club.find("select option").filter(":selected").data("id"));
            if ($club.find("select option").filter(":selected").data("id") === "") {
                $club.addClass("error");
            } else {
                $club.removeClass("error");
            }
            if ($interest.val() === "") {
                $interest.parent().addClass("error");
            } else {
                $interest.parent().removeClass("error");
            }
            if ($fitness.val() === "") {
                $fitness.parent().addClass("error");
            } else {
                $fitness.parent().removeClass("error");
            }
            if ($email.length === 1) {
                if ($email.val().length < 3 || Validators.email($email.val()) === false) {
                    $email.addClass("error");
                } else {
                    $email.removeClass("error");
                }
            }
            if ($phone.length === 1) {
                if ($phone.val().length < 1 || Validators.digits($phone.val()) === false) {
                    $phone.addClass("error");
                } else {
                    $phone.removeClass("error");
                }
            }
        };
        SAV.Submit = function() {
            var ENDPOINT_URL = "/leads/step1";
            $el.find(".submit").on("click", function(e) {
                e.preventDefault();
                SAV.Validate();
                var Arr = "", qa = "", qa2 = "", answer = "", singleAnswer = "", questionText = "";
                if ($el.find(".action select").val() !== null && $el.find(".action select").val() !== "") {
                    answer = $el.find(".action select").val();
                    singleAnswer = "<Answer>";
                    singleAnswer += "<answerText>" + answer + "</answerText>";
                    singleAnswer += "<additionalInformation></additionalInformation>";
                    singleAnswer += "</Answer>";
                    var combinedSingleAns = singleAnswer;
                    var answerInt = $(".action").prev(".question").text() === "I'm interested in" ? "Interested in" : $(".action").prev(".question").text();
                    var answerArr = "<answers>" + combinedSingleAns.split(",").join("") + "</answers>";
                    questionText = "<questionText>" + answerInt + "</questionText>";
                    qa = "<QuestionAnswers>" + questionText + answerArr + "</QuestionAnswers>";
                }
                if ($el.find(".individual select").val() !== null && $el.find(".individual select").val() !== "") {
                    answer = $el.find(".individual select").val();
                    singleAnswer = null;
                    singleAnswer = "<Answer>";
                    singleAnswer += "<answerText>" + answer + "</answerText>";
                    singleAnswer += "<additionalInformation></additionalInformation>";
                    singleAnswer += "</Answer>";
                    var combinedSingleAns2 = singleAnswer;
                    var answerArr2 = "<answers>" + combinedSingleAns2.split(",").join("") + "</answers>";
                    questionText = "<questionText>" + $(".individual").prev(".question").text() + "</questionText>";
                    qa2 = "<QuestionAnswers>" + questionText + answerArr2 + "</QuestionAnswers>";
                }
                Arr = "<questionsAnswers>" + qa + qa2 + "</questionsAnswers>";
                var data = {
                    nameFirst: $el.find(".first-name").val(),
                    nameLast: $el.find(".last-name").val(),
                    transactionId: $el.find(".transation-id").val(),
                    activationCode: $el.find(".activation-code").val(),
                    facilityKey: $el.find(".club select option").filter(":selected").data("id"),
                    emailAddress: $el.find(".email").val(),
                    phoneNumber: $el.find(".phone").val(),
                    notes: null,
                    userLocation: $el.find(".region select").val() || "NoRegion",
                    qa: Arr
                };
                Crittercism.leaveBreadcrumb("Ready to Submit. User:" + JSON.stringify(data));
                if ($el.find(".error").length === 0) {
                    $(this).text("Loading...");
                    $.ajax({
                        type: "POST",
                        url: ENDPOINT_URL,
                        data: JSON.stringify(data),
                        contentType: "application/json",
                        headers: {
                            "Eqx-Version": "1"
                        }
                    }).success(function(response) {
                        console.log("[SAV]-Result", response);
                        if (!response) {
                            $el.find(".sav-form").addClass("hidden");
                            $el.find(".sav-error").removeClass("hidden");
                            var error = {
                                name: "Schedule A Visit - Submission Error",
                                message: "Response:" + response + " - For Submission:" + JSON.stringify(data),
                                htmlMessage: "Response:" + response + " - For Submission:" + JSON.stringify(data),
                                Data: data
                            };
                            Crittercism.logHandledException(error);
                        } else {
                            $el.find(".sav-form").addClass("hidden");
                            $el.find(".sav-thanks small").text("Thank you, " + data.nameFirst);
                            $el.find(".sav-thanks").removeClass("hidden");
                            window.tagData = window.tagData || {};
                            window.tagData.leadSubmit = {
                                facilityId: $el.find(".club select option").filter(":selected").data("id"),
                                facilityRegion: $el.find(".region select option").filter(":selected").data("slug") || "NoRegion",
                                formTransactionId: $el.find(".transation-id").val()
                            };
                            window.track("leadSubmit", window.tagData.leadSubmit);
                        }
                    }).error(function(xhr) {
                        $el.find(".sav-form").addClass("hidden");
                        $el.find(".sav-error").removeClass("hidden");
                        var error = {
                            name: "Schedule A Visit - Backend Error",
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
        SAV.init = function() {
            $el.find("input").autoGrowInput({
                comfortZone: 10,
                minWidth: 130
            });
            SAV.BindDropdowns();
            SAV.Submit();
            $(function() {
                SAV.DefaultSelects();
            });
        };
        SAV.init();
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
