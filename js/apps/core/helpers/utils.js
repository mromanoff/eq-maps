define(function (require, exports, module) {
    'use strict';

    var Utils;

    /**
     * Utilities Class
     *
     * Useful utilities we will use throughout the app
     *
     * @class Utils
     */
    Utils = function() {
        this.parent = window;
    };

        /**
         * Override jQuery's default ajax setup
         *
         * @memberOf Utils
         * @method
         * @public
         */
        Utils.prototype.setupAjax = function() {
            jQuery.support.cors = true; // fix cors in IE9

            $.ajaxSetup({
                dataType: 'json',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true
            });
        };

        /**
         * Override Links
         *
         * If pushState is on, we want to make sure no links cause a full page refresh
         * so we preventDefault IF the url is local and instead cause a router navigate
         *
         * @memberOf Utils
         * @method
         * @public
         */
        Utils.prototype.overrideLinks = function() {
            $(document).on('click', 'a:not([data-bypass])', function (evt) {
                var href = $(this).attr('href');
                var protocol = this.protocol + '//';

                // make links trigger a route only if it has a hash in the string
                if (href && href.indexOf('#') > -1 && href.slice(protocol.length) !== protocol) {
                    evt.preventDefault();
                    Core.router.navigate(href, true);
                }
            });
        };


        /**
         * Namespace Objects
         *
         * Create namespace object(s) out of a string separated by dots.
         *
         * @credit: http://stackoverflow.com/questions/15170167/creating-a-namespace-object-from-string-to-call-a-function
         * @memberOf Utils
         * @method
         * @public
         */
        Utils.prototype.namespace = function (namespace, root) {

            if(root) {
                this.parent = root;
            }

            var parts  = namespace.split(".");
            var parent = this.parent;

            // we want to be able to include or exclude the root namespace so we strip
            // it if it's in the namespace
            if (parts[0] === "MYAPPLICATION") {
                parts = parts.slice(1);
            }

            // loop through the parts and create a nested namespace if necessary
            for (var i = 0; i < parts.length; i++) {
                var partname = parts[i];

                // check if the current parent already has the namespace declared
                // if it isn't, then create it
                if (typeof parent[partname] === "undefined") {
                    parent[partname] = {};
                }

                // get a reference to the deepest element in the hierarchy so far
                parent = parent[partname];

            }

            // the parent is now constructed with empty namespaces and can be used.
            // we return the outermost namespace
            return parent;
        };

        /**
         *  getApi
         *
         *  retrieve the right API for your environment and if you set consts.MOCKDATA to true
         *  then use the consts.MOCK data url instead
         *
         * @method
         * @memberOf Utils
         * @public
         * @param url
         * @returns {string}
         */
        Utils.prototype.getApi = function(url) {
            var json = consts.MOCKDATA ? '.json' : '';
            var api  = consts.MOCKDATA ? consts.MOCKS : consts.API;

            return api + url + json;
        };

        /**
         *  jsDateToISO8601
         *
         *  Convert JS Date objects to ISO8601. Do not use moving forward as it has been
         *  deprecated in favor of MomentJS.
         *
         * @method
         * @memberOf Utils
         * @deprecated
         * @public
         * @param url
         * @returns {string}
         */
        Utils.prototype.jsDateToISO8601 = function (date) {
            function padzero(n) {
                return n < 10 ? '0' + n : n;
            }

            function pad2zeros(n) {
                if (n < 100) {
                    n = '0' + n;
                }
                if (n < 10) {
                    n = '0' + n;
                }
                return n;
            }

            function toISOString(d) {
                return d.getUTCFullYear() + '-' + padzero(d.getUTCMonth() + 1) + '-' + padzero(d.getUTCDate()) + 'T' + padzero(d.getUTCHours()) + ':' + padzero(d.getUTCMinutes()) + ':' + padzero(d.getUTCSeconds()) + '.' + pad2zeros(d.getUTCMilliseconds()) + 'Z';
            }

            return  toISOString(new Date(date));
        };

        /**
         * getLastFourDigits
         *
         * Used to get the last four digits of a credit card number
         *
         * @memberOf Utils
         * @param str
         * @returns {string}
         */
        Utils.prototype.getLastFourDigits = function(str) {
            return str.substr(str.length - 4);
        };


        /**
         * getCardType
         *
         * Determine the card type based on the first four digits
         *
         * @credit http://stackoverflow.com/a/19138852/63449
         * @memberOf Utils
         * @method
         * @param number
         * @returns {string}
         */
        Utils.prototype.getCardType = function(number) {
            var re = {
                visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
                mastercard: /^5[1-5][0-9]{14}$/,
                amex: /^3[47][0-9]{13}$/,
                diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
                discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
                jcb: /^(?:2131|1800|35\d{3})\d{11}$/
            };
            if (re.visa.test(number)) {
                return 'visa';
            } else if (re.mastercard.test(number)) {
                return 'mastercard';
            } else if (re.amex.test(number)) {
                return 'amex';
            } else if (re.diners.test(number)) {
                return 'diners';
            } else if (re.discover.test(number)) {
                return 'discover';
            } else if (re.jcb.test(number)) {
                return 'jcb';
            }
        };

        /**
         *  Spinner
         *
         *  Spinner load icon
         *
         * @memberOf Utils
         * @method
         * @param url
         * @returns {string}
         */
        Utils.prototype.Spinner = function (target) {
        	var Spinner = require('spin');

        	var opts = {
        		lines: 13, // The number of lines to draw
        		length: 7, // The length of each line
        		width: 2, // The line thickness
        		radius: 10, // The radius of the inner circle
        		corners: 0, // Corner roundness (0..1)
        		rotate: 0, // The rotation offset
        		color: '#fff', // #rgb or #rrggbb
        		speed: 1, // Rounds per second
        		trail: 52, // Afterglow percentage
        		shadow: false, // Whether to render a shadow
        		hwaccel: false, // Whether to use hardware acceleration
        		className: 'spinner', // The CSS class to assign to the spinner
        		zIndex: 2e9, // The z-index (defaults to 2000000000)
        		top: '50%', // Top position relative to parent in px
        		left: '50%' // Left position relative to parent in px
        	};

        	target = target || document.getElementById('app-main');
        	return new Spinner(opts).spin(target);
        };

    module.exports = Utils;
});