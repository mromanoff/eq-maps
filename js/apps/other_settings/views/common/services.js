/* global, define, _ */

define(function (require, exports, module) {
    'use strict';

    var Marionette = require('marionette');
    var Template   = '';

    /**
     * This sucks
     *
     * Let me explain... one of the requirements we have is that we can use sitecore widgets
     * which are just dumped into the page by the backend. Well, this doesn't play too nice
     * with an SPA app as they are not registered as views in our app. How should we solve this?
     * There are many ways but whichever implementation required heavy work in the backend. Time
     * we didnt have at this point in time. So, how i solved it? Well, I look for it in the DOM
     * If it is there, i grab the sucker, copy the string and jammed it into the Template. Then,
     * destroy the original copy dumped by the backend. Like I said, this utterly sucks.
     */
    if ($('.module-3col-points').length > 0) {
        $('.module-3col-points').addClass('three-points-table');
        Template += $('.module-3col-points')[0].outerHTML;

        if ($('.module-netpulse-user').length == 0) {
            Template += require('text!other_settings/templates/services.tpl');
        }

        $('.module-3col-points').remove(); // destroy original
    }

    if ($('.module-netpulse-user').length > 0) {
        Template += $('.module-netpulse-user')[0].outerHTML;

        $('.module-netpulse-user').remove(); // destroy original
    }

    /**
     * Services View
     *
     * This is the view, template helpers and bindings for the services component
     * seen on the Other Settings landing page
     *
     * @name Services
     * @class ServicesView
     * @return view
     */
    var View = Marionette.ItemView.extend({

        el: '<div></div>',

        template: _.template(Template),

        onRender: function() {
            if (this.$el.find('.module-netpulse-user').length > 0) {
                this.$el.find('.module-3col-points').find('.col-1-3:nth-child(2)').css('opacity', 0);
                this.$el.find('.module-3col-points').find('.col-1-3:nth-child(4)').css('opacity', 0);
            }
        }
    });

    module.exports = View;
});