/* global, define, _, userProfileJson */

/**
 * Others View
 *
 * A common view used to display other settings. In here we scrapped the DOM for any module
 * Sitecore may have dump on the page and we integrated it into our SPA app.
 *
 * @augments Backbone.ItemView
 * @name OtherView
 * @module OtherView
 * @namespace OtherSettings.Views.Other
 * @return ItemView
 */
define(function (require, exports, module) {
    'use strict';

    var Template   = '';
    var Marionette = require('marionette');

    var moment = require('momentjs');
     
    

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
    Template = '';

    $('.settings-module').each(function (i, e) {
        Template += $(this)[0].outerHTML;
        if (userProfileJson && userProfileJson.ContactId) {
            Template = Template.replace('&lt;contactId&gt;', userProfileJson.ContactId); // for Chrome
            Template = Template.replace('<contactId>', userProfileJson.ContactId); // for IE
        } else {
            console.warn('[EMAIL SUBSCRIPTIONS] Error: userProfileJson.ContactId is undefined');
        }
        $(this).remove(); // destroy original
    });

    var View = Marionette.ItemView.extend({
        el: '<div class="settings-table"></div>',
        onRender: function () {
            var self = this;
            EQ.Helpers.getService('/v2.6/me/profile/acce').done(function (d) {
                if (d.acceEnabled === null || !d.acceEnabled) {
                    self.$el.find('.module-acce .toggle-acce').toggleClass('off');
                } else {
                    self.$el.find('.module-acce .toggle-acce').toggleClass('on', d.acceEnabled);
                }
                
            });

            EQ.Helpers.getService('/v2.6/me/profile/unitofmeasure').done(function (d) {
                var isMetric = d.unitOfMeasure === 'Metric';
                self.$el.find('.module-unit-of-measurement .toggle-uom').toggleClass('on', isMetric).toggleClass('off', !isMetric);
            });

            // Load calories overlay
            var $caloriesOverlay = $('<div class="calories-overlay"></div>');
            self.$el.append($caloriesOverlay);
            App.loadComponent('automatic-calories-overlay', $caloriesOverlay, {}, function () {
                console.log($caloriesOverlay);
                self.$el.find('.module-acce .toggle-acce').on('click', '[data-val]', function () {
                    var enable = $(this).attr('data-val') === 'on';
                    if (enable) {
                        Backbone.Events.trigger('automatic-calories-overlay:open', function (value) {
                            var status = value === 'on';
                            self.$el.find('.module-acce .toggle-acce').toggleClass('on', status).toggleClass('off', !status);
                        });
                    } else {
                        EQ.Helpers.putService('/v2.6/me/profile/disableacce').done(function (d) {
                            self.$el.find('.module-acce .toggle-acce').toggleClass('on', enable).toggleClass('off', !enable);
                        });
                    }
                });
            });


            self.$el.find('.module-unit-of-measurement .toggle-uom').on('click', '[data-val]', function () {
                var value = $(this).attr('data-val');
                var isMetric = (value === 'Metric');

                EQ.Helpers.putService('/v2.6/me/profile/set/unitofmeasure', { unitOfMeasure: value }).done(function (d) {
                    self.$el.find('.module-unit-of-measurement .toggle-uom').toggleClass('on', isMetric).toggleClass('off', !isMetric);
                });
            });
        },
        template: _.template(Template)
    });

    module.exports = View;
});