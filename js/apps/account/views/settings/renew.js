define(function (require, exports, module) {
    'use strict';

    // External dependencies.
    var Marionette = require('marionette');
    var Template   = require('text!templates/settings/renew.tpl');

    /**
     * Auto Renew PT Packages View
     *
     * View for the auto renew packages component used in /account/ptrenew
     *
     * @name RenewView
     * @class RenewView
     * @return view
     */
    var RenewView = Marionette.ItemView.extend({

        template: _.template(''),

        /**
         * ui elements
         *
         * Store all selectors in memory
         */
        ui: {
            toggle60: '.toggle-60-renewal',
            toggle30: '.toggle-30-renewal',
            select60: '.toggle-60-dropdown',
            select30: '.toggle-30-dropdown',
            select: '.fancy-select'
        },

        /**
         * events
         *
         * all click events on this page
         */
        events: {
            'click .toggle-60-renewal': 'toggle60',
            'click .toggle-30-renewal': 'toggle30'
        },

        /**
         * toggle60
         *
         * onClick toggle
         */
        toggle60: function (e) {
            e.preventDefault();

            this.toggle('60');
        },

        /**
         * toggle30
         *
         * onClick toggle
         */
        toggle30: function (e) {
            e.preventDefault();

            this.toggle('30');
        },

        /**
         * toggle
         *
         * toggle logic for toggle buttons. It would be nice to abstract the toggle UI
         * into a reusable component somewhere in the core. Much like an Angular UI directive.
         *
         * @todo: abstract the toggling part of this UI component into something reusable
         */
        toggle: function (time) {
            var curr = this.model.get('toggle' + time);
            var next = !curr;
            var css  = next ? 'on' : 'off';

            this.ui['toggle' + time].removeClass('on off').addClass(css);

            // to reuse this func on init and onclick, we only save
            // when we pass save=true in the click trigger arguments
            if (typeof arguments[1] === 'object' && arguments[1]['save'] === true) {
                this.model.set('toggle' + time, !curr);
            } else {
                this.model.set('toggle' + time, !curr);
            }

            if(next) {
                this.ui['select' + time].slideDown();
            } else {
                this.ui['select' + time].slideUp();
                this.ui['select' + time].find('select').val('0').trigger('change');
            }
        },

        /**
         * create
         *
         * If API succeeds, then show this view
         */
        create: function () {

            this.template = _.template(Template);
            this.render();
        },

        /**
         * initialize
         *
         * First thing we do is listen for changes and based on that we either populate
         * the view with an actual template and show to the user. If for whatever reason
         * it fails, then destroy this view and show nothing
         */
        initialize: function () {
            var that = this;

            Core.vent.on('account:renewals:available', function () {
                that.create();
                that.setupDropdowns();
            });

            this.model.fetch().then(function () {

                Core.vent.trigger('account:renewals:available');
            });
        },

        /**
         * setupDropdowns
         *
         * Again, this could be abstracted into reusable UI component that just works when
         * dropped in the page. I guess I did this already in as a Backbone.Form editor but
         * i hate those forms and it would have been so unnecessary to use them just for this.
         */
        setupDropdowns: function () {
            var that = this;

            var toggle60 = this.model.get('60').packageSize === 'No repurchase' ? false : true;
            var toggle30 = this.model.get('30').packageSize === 'No repurchase' ? false : true;

            // set it to the opposite of its actual value as the toggle will
            // revert it back to on the click event
            this.model.set('toggle60', !toggle60);
            this.model.set('toggle30', !toggle30);

            this.ui.toggle60.trigger('click', {save:true});
            this.ui.toggle30.trigger('click', {save:true});

            this.ui.select.change(function () {
                var selectedText = $(this).find('select option:selected').text();
                var dropdownTime = $(this).attr('data-time');

                $(this).find('.option').text(selectedText);

                switch (dropdownTime) {
                    case '60':
                        that.model.set({ '60' : { packageSize: selectedText } } );
                        break;
                    case '30':
                        that.model.set({ '30' : { packageSize: selectedText } } );
                        break;
                }
            });
        }

    });

    module.exports = RenewView;
});