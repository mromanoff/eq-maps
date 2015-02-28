(function(global, App) {
    "use strict";
    var Question = Backbone.Model.extend({
        defaults: {
            answerId: "",
            answerText: "",
            isSelected: false
        }
    });
    var QuestionsCollection = Backbone.Collection.extend({
        model: Question
    });
    var QuestionSingleViewHelpers = {
        getSelected: function() {
            return this.isSelected ? "selected" : "";
        }
    };
    var QuestionsContainerView = Backbone.View.extend({
        updateQuestion: function() {
            var collection = this.collection.toJSON(), qId = collection[0].questionId, data = {
                questions: [ {
                    questionId: qId,
                    answers: collection
                } ]
            };
            $.ajax({
                type: "POST",
                url: APIEndpoint + "/personalization/onboarding/questions/me/update",
                contentType: "application/json",
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                data: JSON.stringify(data),
                success: function(response) {
                    debug("UPDATED PREFERENCES", response);
                },
                error: function(d) {
                    debug("server error", d);
                }
            });
        },
        render: function() {
            this.collection.each(function(goal) {
                var questionSingleView = new QuestionSingleView({
                    model: goal,
                    updateCallBack: this.updateQuestion.bind(this)
                });
                this.$el.append(questionSingleView.render().el);
            }, this);
        }
    });
    var QuestionSingleView = Backbone.View.extend({
        model: Question,
        events: {
            "click a": "switchSelected"
        },
        initialize: function(options) {
            this.options = options || {};
        },
        className: "circles-container",
        template: _.template($("#goalSingleView").html()),
        switchSelected: function(e) {
            var selected = this.model.get("isSelected");
            e.preventDefault();
            this.$el.find("a").toggleClass("selected");
            this.model.set("isSelected", !selected);
            this.options.updateCallBack();
        },
        getRenderData: function() {
            var data = this.model.toJSON();
            return _.extend(data, QuestionSingleViewHelpers);
        },
        render: function() {
            this.$el.html(this.template(this.getRenderData()));
            return this;
        }
    });
    var FitnessGoals = {};
    FitnessGoals.init = function($el) {
        var goalsContainerView, goalsCollection;
        $.ajax({
            url: APIEndpoint + "/personalization/onboarding/questions/me",
            contentType: "application/json",
            data: {
                questionTypes: "OnBoarding"
            },
            type: "GET",
            xhrFields: {
                withCredentials: true
            }
        }).done(function(answers) {
            debug("PROFILE RESPONSE", answers);
        }).fail(function() {
            debug("Server Error");
        });
        goalsCollection = new QuestionsCollection([ {
            answerId: 40,
            questionId: 10,
            answerText: "INCREASE MUSCLE",
            isSelected: false
        }, {
            answerId: 37,
            questionId: 10,
            answerText: "LOSE WEIGHT",
            isSelected: true
        }, {
            answerId: 39,
            questionId: 10,
            answerText: "TONE AND TIGHTEN UP",
            isSelected: false
        }, {
            answerId: 41,
            questionId: 10,
            answerText: "IMPROVE HEALTH",
            isSelected: false
        }, {
            answerId: 38,
            questionId: 10,
            answerText: "TRAIN FOR AN EVENT",
            isSelected: false
        }, {
            answerId: 42,
            questionId: 10,
            answerText: "SPORT PERFORMANCE",
            isSelected: false
        } ]);
        goalsContainerView = new QuestionsContainerView({
            el: $el.find(".goals-container"),
            collection: goalsCollection
        });
        goalsContainerView.render();
    };
    App.Components["profile-goals"] = function($el) {
        FitnessGoals.init($el);
    };
})(window, window.App);
/*! local_env mindoro v0.7.0 - 2015-02-27 02:02:38 */
