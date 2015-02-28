define(function (require, exports, module) {
    'use strict';

    var Utils = require('core/helpers/utils');
    var utils = new Utils();


    /**
     * Store
     *
     * This is a place to store data we want to keep persistent throughout the app. It
     * only stores objects but is able to retrieve the attributes object from a
     * Backbone Model or a Backbone Model's instance
     *
     * @name Store
     * @class Store
     */
    var Store = function() {
        // constructor
    };

        /**
         * Set in Store
         *
         * Set a value to a key in the store
         *
         * @function
         * @public
         */
        Store.prototype.get = function(key) {
            return eval('this.' + key);
        };

        /**
         * Get in Store
         *
         * Get the value of a key in the store
         *
         * @function
         * @public
         */
        Store.prototype.set = function(key, val) {

            // If the key starts with "App.." or "App.store.." reject it for consistency
            if(key.indexOf('App') > -1 || key.indexOf('App.store') > -1) {
                console.error('App.store.set() failed! Please DO NOT prepend "App" or "App.store" to the key. It is assumed it will be store in App.store');

                return false;
            }

            // No key can be named "set" or "get" as they are reserved words
            if(key === 'set' || key === 'get') {
                console.error('App.store.set() failed! ' + key + ' is a reserved word in App.store for get() and set()');

                return false;
            }

            // create namespaced obj if it doesn't already exist
            utils.namespace(key, this);

            // if passed a model instance set object to its attributes
            if(typeof val === 'object' && typeof val.cid !== 'undefined') {
                parse(this, key, val.attributes);

                console.log('storing the attributes of model instance');

                return;
            }

            // if passed a Model class, instantiate it and set to its attributes
            if(typeof val === 'function' && val.extend !== 'undefined') {
                var model = new val();

                console.log('storing a Model\'s attributes');

                parse(this, key, model.attributes);

                return;
            }

            // if pass obj set to it
            if(typeof val === 'object' && typeof val.cid === 'undefined') {

                // if we already have this key, extend it instead of overriding the entire obj
                /*WORKS!! if (_.isEmpty(this[key])) {
                    console.log('key doesn\'t exists; creating obj...');
                    parse(this, key, val);
                } else {
                    console.log('key already exists; extending obj...');
                    _.extend(this[key], val);
                }*/
                parse(this, key, val);

                console.log('storing an object straight');

                return;
            }

            console.error('App.store.set() Failed! Make sure the val to be set is an object.');

        };

        /**
         * Parse
         *
         * evaluate the namespaced string into the actual object and assign the value we want to
         * set. I know, I know, don't use eval; but, show me a better way.
         *
         * @todo replace eval() with something like this https://gist.github.com/brigand/10659453
         * @function
         * @private
         */
        function parse(obj, key, val) {
            // if we already have this key, extend it instead of overriding the entire obj
            if (_.isEmpty(obj[key])) {
                console.log('obj is empty so key didn\'t exists earlier; creating obj value...');
                eval('obj.' + key + ' = ' + JSON.stringify(val)); // 'obj.' = 'App.store.'
            } else {
                console.log('obj has content already; extending it...');
                _.extend(obj[key], val);
            }
        }

    module.exports = Store;
});

