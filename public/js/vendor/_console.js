// Console-polyfill. MIT license.
// https://github.com/paulmillr/console-polyfill
// Make it safe to do console.log() always.
(function (con) {
    'use strict';
    var prop, method;
    var empty = {};
    var dummy = function () { };
    var properties = 'memory'.split(',');
    var methods = ('assert,count,debug,dir,dirxml,error,exception,group,' +
       'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
       'time,timeEnd,trace,warn').split(',');
    while (prop = properties.pop()) con[prop] = con[prop] || empty;
    while (method = methods.pop()) con[method] = con[method] || dummy;

    window.debug = function () {
        // Is it local environment?
        if (location.hostname.indexOf('local') === 0 || window.location.host.charAt(0) === '1') {
            // Add the color as second argument (CSS)
            Array.prototype.splice.apply(arguments, [1, 0, 'color: #0000ff']);
            // Split first argument text (which could be like "[Section] message")
            var text = arguments[0].split('] ');
            // Transform first argument to be only [Section] including color
            arguments[0] = '%c' + text[0] + ']';
            // Add the back " message" part after CSS.
            Array.prototype.splice.apply(arguments, [2, 0, text[1]]);
            // Call actual console.log
            try {
                console.log.apply(console, arguments);
            }
            catch (e) {
                Function.prototype.apply.call(console.log, console, arguments);
            }
        }
    };
})(window.console = window.console || {});