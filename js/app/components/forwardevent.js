(function (App) {
    'use strict';

    /* global EQ */

    /**
     * Forwards events from an element to the ones beneath. Think of this module as a   * pointer-events: none; polyfill.
     */
    App.Components.forwardevent = function ($el) {
        if (EQ.Helpers.isIe() < 11) {
            $el.forwardevents();
        }
    };

}(window.App));