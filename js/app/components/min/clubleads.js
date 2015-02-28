(function(global, App) {
    "use strict";
    App.Components.clubleads = function($el) {
        var SAV = {};
        SAV.Step1 = {};
        SAV.Step1.Validate = function() {
            var $firstName = $el.find(".first-name"), $lastName = $el.find(".last-name"), $interest = $el.find("#interest"), $email = $el.find(".email"), $phone = $el.find(".phone");
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
            if ($interest.val() === "") {
                $interest.parent().addClass("error");
            } else {
                $interest.parent().removeClass("error");
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
            var ENDPOINT_URL = "/leads/clublead";
            $el.find(".submit").on("click", function(e) {
                e.preventDefault();
                SAV.Step1.Validate();
                var InterestsVal = $el.find("input[type=checkbox]:checked").map(function() {
                    return this.id;
                }).get().join(", ");
                if ($.trim($el.find("#other").val()) !== "") {
                    if (InterestsVal !== "") {
                        InterestsVal += ", other(" + $.trim($el.find("#other").val()) + ")";
                    } else {
                        InterestsVal = "other(" + $.trim($el.find("#other").val()) + ")";
                    }
                }
                var data = {
                    nameFirst: $el.find(".first-name").val(),
                    nameLast: $el.find(".last-name").val(),
                    EmailAddress: $el.find(".email").val(),
                    PhoneNumber: $el.find(".phone").val(),
                    Interests: InterestsVal,
                    transactionId: $el.find(".transation-id").val(),
                    subjectCode: $el.find(".subjectCode").val(),
                    recipientEmailAddresses: $el.find(".recipientEmailAddresses").val()
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
                            $("body, html").scrollTop($("#leads").offset().top);
                            $(".sav-form").addClass("hidden");
                            if (response) {
                                if (typeof window._satellite.track === "function") {
                                    window._satellite.track("leadSurveySubmit");
                                }
                                window.tagData = window.tagData || {};
                                window.tagData.leadSubmit = {
                                    facilityId: $el.find(".club select option").filter(":selected").data("id") || "",
                                    facilityRegion: $el.find(".region select option").filter(":selected").data("slug") || "NoRegion",
                                    formTransactionId: $el.find(".transation-id").val()
                                };
                                window.track("leadSubmit", window.tagData.leadSubmit);
                                $("#leads-thanks").removeClass("hidden");
                            } else {
                                $("#leads-error").removeClass("hidden");
                            }
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
        SAV.Step1.init = function() {
            SAV.Step1.Submit();
        };
        SAV.init = function() {
            if ($el.hasClass("step1")) {
                SAV.Step1.init();
            }
        };
        SAV.init();
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
