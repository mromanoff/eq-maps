/**
 * Simple Tabs
 *
 * @param options.duration duration of animation in milliseconds. Default is 500.
 * @returns jQuery Object
 * @usage $('.tabs-simple').simpleTabs();
 */
$.fn.simpleTabs = function (options) {
    'use strict';

    var defaults = {
        duration: 500,   // fade ins/outs duration
        onTabShown: function () {}
    };

    var opts = $.extend(defaults, options);

    var animating = false;

    /**
     * showNextTab
     * Hides current tab, removes its `active` status, and then shows the next tab
     *
     * @param tabs tabs object
     * @param tab Single tab to be shown next
     * @private
     */
    function showNextTab(tabs, tab) {
        animating = true;
        tabs.find('.tabs-content').find('.active').fadeOut(opts.duration, function () {
            $(this).removeClass('active');

            tabs.find('.' + tab).fadeIn(opts.duration, function () {
                $(this).addClass('active');
                opts.onTabShown();
            });

            animating = false;
        });
    }

    /**
     * switchTabContent
     * If there is no other animations happening AND this tab that has been clicked
     * is not `active` already, then go ahead and swap the content from the tabs
     *
     * @param tabs tabs object
     * @param tabLink tab link object that was clicked
     * @private
     */
    function switchTabContent(tabs, tabLink) {
        var tabClicked, tab = tabLink.parent();

        if (!animating && !tab.hasClass('active')) {
            tabClicked = (tabLink.attr('href')).replace('#', ''); // remove #hash

            tabs.find('.tabs-nav').find('.active').removeClass('active'); // remove any `active` currently in the DOM
            tab.addClass('active');

            showNextTab(tabs, tabClicked);
        }
    }

    // ensure to separate each instance to avoid one instance controlling another
    return this.each(function () {
        var tabs = $(this);
        tabs.find('.tabs-nav').find('a').click(function (e) {
            e.preventDefault();
            switchTabContent(tabs, $(this));
        });
    });

};