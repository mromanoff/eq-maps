(function (App) {
    'use strict';


    /**
     * Creates a bar chart component from the given options
     * @param  {jQuery Object}      Component object reference
     * @param  {JSON Object}        Data to create the chart
     *
     *   OPTIONS Object
     *
     *      info {Boolean}                   Specifies if more information should be displayed
     *      scalce {int}                     Specifies the scale for the numbers
     *      data {Object} {STRING: NUMBER}   Each bar specific information compound by name string and a percentage value
     *
     *      Example:
     *          {"info": true,"scale":100, "data": {"strength": 100, "cardio": 100, "flexibility": 25}
     */
    App.Components['bar-chart'] = function ($el, options) {
        var chart = $el.find('.chart');

        $.each(options.data, function (index, value) {
            var container = $(document.createElement('div')).addClass('bar-container'),
                bar = $(document.createElement('div')),
                label = $(document.createElement('span'));

            if (options.scale) {
                value = Math.round((value / options.scale) * 100);
            }

            if (options.info) {
                var tag = $(document.createElement('span'));
                
                bar.append(tag.text(value + '%').addClass('tag'));
            }

            bar.height(value + '%');

            container.append(bar.addClass('bar ' + index));

            container.append(label.text(index).addClass('label'));

            chart.append(container);
        });

    };


}(window.App));