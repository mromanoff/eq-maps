/* data-component library - all subscritps are loaded from app/components */
(function (App) {
    'use strict';

    /* global debug, require, Backbone, _ */
    var isLocal = (location.host.indexOf('extend-group.codio.io:3000') === 0 || location.host.indexOf('local-web.equinox.com') === 0) ? true : false;
        
    var assetBaseUrl = $('body').data('asset-base-url') || '',
        version = $('body').data('app-version') ? '?v=' + $('body').data('app-version') : '';

    var createComponent = function (component, $el, options) {
        try {
            return App.Components[component]($el, options);
        } catch (e) {
            console.error('data-component failed to export as a function', e.stack);
        }
    };

    App.renderComponents = function (selector) {
        var $selector = $(selector),
            components = [],
            requireComponents = [];

        //For each component, add it to the load list.
        $selector.find('[data-component]').each(function (i, el) {
            var $el = $(el),
                component = $el.data('component'),
                options = $el.data('component-options'),
                devAssets = assetBaseUrl + '/js/app/components/' + component + '.js' + version,
                prodAssets = assetBaseUrl + '/js/app/components/min/' + component + '.js' + version;

            try {
                debug('[DataComponent] Loading: ' + component + ' component.');

                var C = {
                    filename: isLocal ? devAssets : prodAssets,
                    $el: $el,
                    component: component,
                    options: options
                };

                components.push(C);
                requireComponents.push(C.filename);

            } catch (e) {
                console.error('data-component not found: ' + component, e.stack);
            }
        });

        try {
            // Load them with requirejs and after all the components are loaded, run them.
            require(requireComponents, function () {
                // Iterate over the components and initialize them.
                _.forEach(components, function (c) {
                    createComponent(c.component, c.$el, c.options || {});
                });
            });
        } catch (e) {
            console.error('data-component not found', e.stack);
        }


    };

    /*
    * Load a component and  bind it to an $el. Useful for loading components without DOM data-elements
     */
    /* jshint -W072 */
    // Disable JSHint 3 parameter limit for only this function.
    App.loadComponent = function (component, $el, options, callback) {
        debug('[DataComponent] Loading: ' + component + ' component.');

        require([assetBaseUrl + '/js/app/components/min/' + component + '.js' + version], function () {
            createComponent(component, $el, options || {});
            if (callback && typeof callback === 'function') {
                callback.call(component); // Call the callback and bind
            }
        });
    };
    /* jshint +W072 */

    // Render Components.
    App.renderComponents('body');

    // Add renderComponents to Backbone.View (Call this after View.render to process data-components)
    _.extend(Backbone.View.prototype, Backbone.Events, {
        renderComponents: function ($el) {
            App.renderComponents($el);
        }
    });

}(window.App));
