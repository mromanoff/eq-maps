(function (global, App) {
    'use strict';

    /* global debug, EQ */

    var Backbone = global.Backbone,
        _ = global._;

    /**
    * Views
    */

    var SelectGenderView = Backbone.View.extend({
        className: 'genderModal',
        template: _.template($('#selectGenderModalSingleViewTemplate').html()),
        events: {
            'click .close-modal, .cancel': 'declineGender',
            'click .genderSelection': 'selectGender',
            'click .confirm': 'confirmGender'
        },
        initialize : function (options) {
            this.options = options || {};
        },
        openModal: function () {
            this.$el.removeClass('hidden');
        },
        closeModal: function () {
            this.$el.addClass('hidden');
        },
        declineGender: function (e) {
            e.preventDefault();
            this.options.genderDeclinedCallback();
            this.closeModal();
        },
        selectGender: function (e) {
            e.preventDefault();
            var $thisLink = $(e.currentTarget);

            this.$el.find('.genderSelection').removeClass('selected');
            $thisLink.addClass('selected');
            this.selectedGender = $thisLink.data('gender');
        },
        validateGender: function () {
            if (!this.selectedGender) {
                this.$el.find('.genderError').removeClass('hidden');
                return false;
            } else {
                return true;
            }
        },
        confirmGender: function (e) {
            e.preventDefault();
            var self = this;

            if (this.validateGender()) {
                var loaderAndError,
                    dataToSend = {
                    gender: this.selectedGender
                };

                loaderAndError = EQ.Helpers.loaderAndErrorHandler(self.$el.find('.modal-wrapper'), {
                    type: 'popup'
                });
                loaderAndError.showLoader();

                EQ.Helpers.putService('/v1/me/profile', dataToSend).done(function () {
                    loaderAndError.hideLoader();
                    self.closeModal();
                    self.options.genderSelectedCallback(self.selectedGender);
                });
            }
        },
        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });

    /**
    * Component Init
    */

    App.Components['gender-selection'] = function ($el, options) {
        debug('INIT GENDER SELECTION MODAL');

        var selectGenderView = new SelectGenderView(options);
        $el.append(selectGenderView.render().el);

        Backbone.Events.on('gender-selection:open', function () {
            selectGenderView.openModal();
        });
    };

} (window, window.App));