(function (global, App) {
    'use strict';

    var Backbone = global.Backbone,
        _ = global._;

    /**
    * Models
    */

    var Question = Backbone.Model.extend({
        defaults: {
            answerId: '',
            answerText: '',
            isSelected: false
        }
    });

    /**
    * Collections
    */

    var QuestionsCollection = Backbone.Collection.extend({
        model: Question
    });

    /**
    * Views Helpers
    */

    var QuestionSingleViewHelpers = {
        getSelected: function () {
            return (this.isSelected) ? 'selected' : '';
        }
    };

    /**
    * Views
    */

    var QuestionsContainerView = Backbone.View.extend({
        render: function () {
            this.collection.each(function (goal) {
                var questionSingleView = new QuestionSingleView({
                    model: goal
                });
                this.$el.append(questionSingleView.render().el);
            }, this);
        }
    });

    var QuestionSingleView = Backbone.View.extend({
        model: Question,
        className: 'small-circles-container',
        template: _.template($('#interestSingleView').html()),
        events: {
            'click a': 'switchSelected'
        },
        switchSelected: function (e) {
            e.preventDefault();
            this.$el.find('a').toggleClass('selected');
        },
        getRenderData: function () {
            var data = this.model.toJSON();
            return _.extend(data, QuestionSingleViewHelpers);
        },
        render: function () {
            this.$el.html(this.template(this.getRenderData()));
            return this;
        }
    });

    var FitnessInterests = {};

    FitnessInterests.init = function ($el) {
        var interestsContainerView,
            interestsCollection;

        interestsCollection = new QuestionsCollection([
            {
                'answerId': 17,
                'questionId': 3,
                'answerText': 'PILATES',
                'isSelected': false
            },
            {
                'answerId': 20,
                'questionId': 3,
                'answerText': 'SPA',
                'isSelected': false
            },
            {
                'answerId': 16,
                'questionId': 3,
                'answerText': 'PERSONAL TRAINING',
                'isSelected': false
            },
            {
                'answerId': 18,
                'questionId': 3,
                'answerText': 'AMENITIES',
                'isSelected': false
            },
            {
                'answerId': 13,
                'questionId': 3,
                'answerText': 'CYCLING',
                'isSelected': false
            },
            {
                'answerId': 15,
                'questionId': 3,
                'answerText': 'CONDITIONING',
                'isSelected': false
            },
            {
                'answerId': 19,
                'questionId': 3,
                'answerText': 'POOL',
                'isSelected': false
            },
            {
                'answerId': 14,
                'questionId': 3,
                'answerText': 'YOGA',
                'isSelected': false
            }
        ]);

        interestsContainerView = new QuestionsContainerView({
            el: $el.find('.small-circles-wrapper'),
            collection: interestsCollection
        });
        interestsContainerView.render();
    };

    /**
    * Component Init.
    */

    App.Components['profile-interests'] = function ($el) {
        FitnessInterests.init($el);
    };

} (window, window.App));