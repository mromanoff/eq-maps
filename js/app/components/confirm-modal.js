(function (App) {
    'use strict';

    var ConfirmModalView = Backbone.View.extend({

        initialize: function (options) {
            this.options = options || {};
            this.template = _.template(this.options.el.html());
            this.showModal();
        },

        events: {
            'click .no': 'noAction',
            'click .yes': 'yesAction'
        },

        hideModal: function (e) {
            if (e) {
                e.preventDefault();
            }
            this.$el.addClass('hidden');
        },

        showModal: function () {
            this.$el.removeClass('hidden');
        },

        noAction: function (e) {
            e.preventDefault();
            this.options.callback(false);
            this.hideModal();
        },

        yesAction: function (e) {
            e.preventDefault();
            this.options.callback(true);
            this.hideModal();
        },

        render: function () {
            this.setElement(this.template({}));

            return this;
        }

    });

    /**
     * Component Init.
     */

    var ConfirmModal = {};

    ConfirmModal.init = function ($el, options) {
        var data = _.extend(options, {
            el: $el
        });
        console.log(data);
        var confirmModalView = new ConfirmModalView(data);
        $('body').append(confirmModalView.render().$el);
    };

    /**
     * Component Init.
     */

    App.Components['confirm-modal'] = function ($el, options) {
        ConfirmModal.init($el, options);
    };

}(window.App));