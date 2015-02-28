(function(global, App) {
    "use strict";
    App.Components["leads"] = function($el) {
        var SAV = {};
        SAV.Step1 = {};
        SAV.Step2 = {};
        SAV.Step1.BindDropdowns = function() {
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
        SAV.Step1.DefaultSelects = function() {
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
        SAV.Step1.Validate = function() {
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
                if ($phone.val() === "" || $phone.val() === null) {
                    $phone.removeClass("error");
                } else if ($phone.val().length > 1 && Validators.phone($phone.val()) === true) {
                    $phone.removeClass("error");
                } else {
                    $phone.addClass("error");
                }
            }
        };
        SAV.Step1.Submit = function() {
            var ENDPOINT_URL = "/leads/step1";
            $el.find(".submit").on("click", function(e) {
                e.preventDefault();
                SAV.Step1.Validate();
                var InterestsVal = $el.find("input[type=checkbox]:checked").map(function() {
                    return this.id;
                }).get().join(",");
                if ($.trim($el.find("#other").val()) !== "") {
                    if (InterestsVal !== "") {
                        InterestsVal += ",other(" + $.trim($el.find("#other").val()) + ")";
                    } else {
                        InterestsVal = "other(" + $.trim($el.find("#other").val()) + ")";
                    }
                }
                var Arr = "", qa = "";
                var quest = $el.find(".question").length;
                function getCheckedId(index) {
                    return $el.find("input[type=checkbox]:checked").eq(index).map(function() {
                        return this.id;
                    });
                }
                for (var i = 0; i < quest; i++) {
                    var ansLen = $el.find("input[type=checkbox]:checked").length;
                    var singleAnswer, combinedSingleAns = "";
                    if (ansLen > 0) {
                        for (var j = 0; j < ansLen; j++) {
                            singleAnswer = "<Answer>";
                            singleAnswer += "<answerText>" + getCheckedId(j)[0] + "</answerText>";
                            singleAnswer += "<additionalInformation></additionalInformation>";
                            singleAnswer += "</Answer>";
                            combinedSingleAns += singleAnswer;
                        }
                    }
                    if ($.trim($el.find("#other").val()) !== "") {
                        singleAnswer = "<Answer>";
                        singleAnswer += "<answerText>" + "other" + "</answerText>";
                        singleAnswer += "<additionalInformation>" + $.trim($el.find("#other").val()) + "</additionalInformation>";
                        singleAnswer += "</Answer>";
                        combinedSingleAns += singleAnswer;
                    }
                    if (combinedSingleAns) {
                        var answerArr = "<answers>" + combinedSingleAns.split(",").join("") + "</answers>";
                        var answerInt = $el.find(".question").text() === "I'm interested in:" ? "Interested in" : $el.find(".question").text();
                        var questionText = "<questionText>" + answerInt + "</questionText>";
                        qa = "<QuestionAnswers>" + questionText + answerArr + "</QuestionAnswers>";
                        Arr = "<questionsAnswers>" + qa + "</questionsAnswers>";
                    } else {
                        Arr = "";
                    }
                }
                var data = {
                    nameFirst: $el.find(".first-name").val(),
                    nameLast: $el.find(".last-name").val(),
                    transactionId: $el.find(".transation-id").val(),
                    activationCode: $el.find(".activation-code").val(),
                    facilityKey: $el.find(".club select option").filter(":selected").data("id"),
                    emailAddress: $el.find(".email").val(),
                    phoneNumber: $el.find(".phone").val(),
                    notes: InterestsVal,
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
                        if (response.Success === "false") {
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
                            SAV.Step1.navigateToStep2(response.TokenId);
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
        SAV.Step1.navigateToStep2 = function(tokenId) {
            var $form = $("<form />");
            $form.attr("action", "/leads/step2").attr("method", "POST");
            var $nameFirst = $('<input type="hidden"/>').attr("name", "nameFirst").val($el.find(".first-name").val());
            var $nameLast = $('<input type="hidden"/>').attr("name", "nameLast").val($el.find(".last-name").val());
            var $tokenId = $('<input type="hidden"/>').attr("name", "tokenId").val(tokenId);
            var $facilityId = $('<input type="hidden"/>').attr("name", "facilityId").val($el.find(".club select option").filter(":selected").data("id"));
            var $emailAddress = $('<input type="hidden"/>').attr("name", "emailAddress").val($el.find(".email").val());
            var $phoneNumber = $('<input type="hidden"/>').attr("name", "phone").val($el.find(".phone").val());
            var $outreachCode = $('<input type="hidden"/>').attr("name", "outreachCode").val($el.find(".activation-code").val());
            $form.append($nameFirst);
            $form.append($nameLast);
            $form.append($tokenId);
            $form.append($facilityId);
            $form.append($emailAddress);
            $form.append($phoneNumber);
            $form.append($outreachCode);
            $("body").append($form);
            $form.submit();
        };
        SAV.Step1.init = function() {
            SAV.Step1.BindDropdowns();
            SAV.Step1.Submit();
            $(function() {
                SAV.Step1.DefaultSelects();
            });
        };
        SAV.Step2.Validate = function() {
            var flag = [];
            $el.find(".row").each(function() {
                var $this = $(this);
                var $answerOptions = $this.find(".answer-options");
                if ($answerOptions.find("input").is(":radio")) {
                    if ($answerOptions.find("input:checked").val()) {
                        flag.push(true);
                    } else {
                        flag.push(false);
                    }
                } else if ($answerOptions.find("input").is(":checkbox")) {
                    if ($answerOptions.find("input:checked").val()) {
                        flag.push(true);
                    } else {
                        if ($.trim($("#other").val()) === "") {
                            flag.push(false);
                        } else {
                            flag.push(true);
                        }
                    }
                }
            });
            return true;
        };
        SAV.Step2.Submit = function() {
            var ENDPOINT_URL = "/leads/thank-you";
            $el.find(".submit").on("click", function(e) {
                e.preventDefault();
                var notes = "";
                var question;
                var Arr = "";
                $el.find(".row").each(function() {
                    var $this = $(this);
                    var $answerOptions = $this.find(".answer-options");
                    question = $this.find(".question-heading h3").text();
                    function getCheckedId(index) {
                        return $answerOptions.find(":checked").eq(index).map(function() {
                            return $(this).data("value");
                        });
                    }
                    var ansLen, answer, answerArr = "", singleAnswer, combinedSingleAns = "", questionText, qa;
                    if ($answerOptions.find("input").is(":radio")) {
                        answer = $answerOptions.find(":checked").val();
                        if (answer !== undefined && answer !== null) {
                            singleAnswer = "<Answer>";
                            singleAnswer += "<answerText>" + answer + "</answerText>";
                            singleAnswer += "<additionalInformation></additionalInformation>";
                            singleAnswer += "</Answer>";
                            combinedSingleAns += singleAnswer;
                            answerArr = "<answers>" + combinedSingleAns.split(",").join("") + "</answers>";
                            questionText = "<questionText>" + $(this).find(".question").text() + "</questionText>";
                            qa = "<QuestionAnswers>" + questionText + answerArr + "</QuestionAnswers>";
                        } else {
                            return;
                        }
                    } else if ($answerOptions.find(".range-selection").length) {
                        answer = $answerOptions.find(".range-selection .reference.current .caption").text();
                        if (answer) {
                            singleAnswer = "<Answer>";
                            singleAnswer += "<answerText>" + answer + "</answerText>";
                            singleAnswer += "<additionalInformation></additionalInformation>";
                            singleAnswer += "</Answer>";
                            combinedSingleAns += singleAnswer;
                            answerArr = "<answers>" + combinedSingleAns.split(",").join("") + "</answers>";
                            questionText = "<questionText>" + $(this).find(".question").text() + "</questionText>";
                            qa = "<QuestionAnswers>" + questionText + answerArr + "</QuestionAnswers>";
                        } else {
                            return;
                        }
                    } else if ($answerOptions.find("input").is(":checkbox")) {
                        ansLen = $answerOptions.find(":checked").length;
                        var chkBoxansArr = [];
                        if (ansLen > 0) {
                            for (var k = 0; k < ansLen; k++) {
                                answer = getCheckedId(k)[0];
                                singleAnswer = "<Answer>";
                                singleAnswer += "<answerText>" + answer + "</answerText>";
                                singleAnswer += "<additionalInformation></additionalInformation>";
                                singleAnswer += "</Answer>";
                                combinedSingleAns += singleAnswer;
                                chkBoxansArr.push(answer);
                            }
                            if (chkBoxansArr.length > -1) {
                                answer = chkBoxansArr.toString();
                            }
                        }
                        if ($.trim($el.find("#other").val()) !== "") {
                            if (answer) {
                                answer += ", other(" + $.trim($("#other").val()) + ")";
                            } else {
                                answer = "other(" + $.trim($("#other").val()) + ")";
                            }
                            singleAnswer = "<Answer>";
                            singleAnswer += "<answerText>other</answerText>";
                            singleAnswer += "<additionalInformation>" + $.trim($el.find("#other").val()) + "</additionalInformation>";
                            singleAnswer += "</Answer>";
                            combinedSingleAns += singleAnswer;
                        }
                        if (combinedSingleAns !== "") {
                            answerArr = "<answers>" + combinedSingleAns.split(",").join("") + "</answers>";
                            questionText = "<questionText>" + $(this).find(".question").text() + "</questionText>";
                            qa = "<QuestionAnswers>" + questionText + answerArr + "</QuestionAnswers>";
                        } else {
                            return;
                        }
                    }
                    Arr += qa;
                    if (answer) {
                        notes += "\n\n" + question + ": " + answer;
                    }
                });
                Arr = Arr.split(",").join("");
                var BigArr = "<questionsAnswers>" + Arr + "</questionsAnswers>";
                notes = notes.toUpperCase();
                console.log("XML STRUCTURE:");
                console.log(BigArr);
                console.log("NOTES:");
                console.log(notes);
                var data = {
                    nameFirst: $("#nameFirst").val(),
                    nameLast: $("#nameLast").val(),
                    outreachCode: $("#outreachCode").val(),
                    facilityId: $("#facilityId").val(),
                    emailAddress: $("#emailAddress").val(),
                    phone: $("#phone").val(),
                    tokenId: $("#tokenId").val(),
                    notes: notes,
                    qa: BigArr
                };
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
                    $("body, html").scrollTop(0);
                    $("#leads-form").addClass("hidden");
                    if (response) {
                        if (typeof window._satellite.track === "function") {
                            window._satellite.track("leadSurveySubmit");
                        }
                        $("#leads-thanks").removeClass("hidden");
                    } else {
                        $("#leads-error").removeClass("hidden");
                    }
                }).error(function() {
                    $("body, html").scrollTop(0);
                    $("#leads-form").addClass("hidden");
                    $("#leads-error").removeClass("hidden");
                });
            });
        };
        SAV.Step2.init = function() {
            SAV.Step2.Submit();
        };
        SAV.init = function() {
            if ($el.hasClass("step1")) {
                SAV.Step1.init();
            } else if ($el.hasClass("step2")) {
                SAV.Step2.init();
            }
        };
        SAV.init();
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
