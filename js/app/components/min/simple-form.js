(function(global, App) {
    "use strict";
    var SimpleForm = {};
    SimpleForm.init = function($el) {
        debug("[SimpleForm] ", SimpleForm);
        if (!$el) {
            throw new Error("Param missing ($el) on SimpleForm init method");
        }
        this.$el = $el;
        this.fields = {};
        $el.data("publicMethods", this.publicMethods);
        console.log($._data($el, "events"));
        $el.on("submit", function(e) {
            if ($el.data("publicMethods").isValid()) {
                debug("SimpleForm] Valid Form!");
            } else {
                e.preventDefault();
            }
        });
        this.initFields();
    };
    SimpleForm.initFields = function() {
        var that = this;
        this.$el.find("input, select").each(function() {
            that.fields[$(this).attr("name")] = new global.EQ.Validator($(this));
        });
    };
    SimpleForm.publicMethods = {
        sendAjaxRequest: function(dataMap, successCallback) {
            var formData = this.getData(), formMethod = SimpleForm.$el.attr("method") || "post", formAction = SimpleForm.$el.attr("action"), $submitButton = SimpleForm.$el.find(":submit"), $errorBox = SimpleForm.$el.find(".is-error"), buttonText = $submitButton.val(), buttonProccesingtext = "Loading...", dataToSend = {};
            $.each(dataMap, function(name, fieldName) {
                dataToSend[name] = formData[fieldName];
            });
            $submitButton.val(buttonProccesingtext).attr("disabled", "disabled");
            $.ajax(APIEndpoint + formAction, {
                data: dataToSend,
                type: formMethod,
                xhrFields: {
                    withCredentials: true
                }
            }).done(function(data, textStatus, jqXHR) {
                if (data.error || data.message) {
                    var errorMessage = data.error ? data.error.message : data.message;
                    debug("[FormSendAjaxRequest]" + errorMessage);
                    $submitButton.val(buttonText).removeAttr("disabled");
                    $errorBox.text(data.error.message).removeClass("hidden");
                } else {
                    debug("[FormSendAjaxRequest] OK");
                    $submitButton.val(buttonText).removeAttr("disabled");
                    $errorBox.text("").addClass("hidden");
                    if (successCallback) {
                        successCallback(data, textStatus, jqXHR);
                    }
                }
            }).fail(function(data) {
                try {
                    var response = data.responseJSON;
                    var errorMessage = response.error ? response.error.message : response.message;
                    $errorBox.text(errorMessage).removeClass("hidden");
                    $submitButton.val(buttonText).removeAttr("disabled");
                } catch (e) {
                    $submitButton.val(buttonText).removeAttr("disabled");
                    $errorBox.text("").addClass("hidden");
                    debug("[FormSendAjaxRequest] Error logged into Crittercism:", e, arguments);
                    Crittercism.logHandledException(e);
                }
            });
        },
        getData: function() {
            var values = {};
            $.each(SimpleForm.$el.serializeArray(), function(key, field) {
                values[field.name] = field.value;
            });
            return values;
        },
        isValid: function() {
            var isFormValid = true, fieldValidation = {}, errorsList = [], $errorBox = SimpleForm.$el.find(".is-error");
            $errorBox.text("").addClass("hidden");
            $.each(SimpleForm.fields, function(key, field) {
                fieldValidation = field.validate();
                if (!fieldValidation.isValid) {
                    isFormValid = false;
                    errorsList.push(fieldValidation.message);
                }
            });
            if (errorsList.length > 0) {
                console.log(errorsList);
                $errorBox.html(errorsList.join("<br />")).removeClass("hidden");
                $("body, html").animate({
                    scrollTop: $errorBox.offset().top - 130
                });
            }
            return isFormValid;
        }
    };
    App.Components["simple-form"] = function($el) {
        SimpleForm.init($el);
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
