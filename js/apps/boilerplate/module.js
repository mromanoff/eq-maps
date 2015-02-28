define(function (require, exports, module) {    
    'use strict';
    
    // External dependencies.
    var Marionette = require('marionette');
    
    var Module = function() {
        // constructor..

        // This property will be unique to that particular instance of this module
        this.myProperty = 'Hello';

        // This is how to call a private method from anywhere in this module
        myPrivateMethod();

        // This is how you call a public method from within this module
        this.myPublicMethod();

    };

        /**
         * myPublicMethod
         *
         * This is a public method that is share across all instances of this module
         *
         * @function
         * @public
         */
        Module.prototype.myPublicMethod = function() {
            console.log('myProperty is: ' + this.myProperty);
        }


        /**
         * Parse
         *
         * evaluate the namespaced string into the actual object and assign the value we want to
         * set. I know, I know, don't use eval; but, show me a better way.
         *
         * @function
         * @private
         */
        myPrivateMethod = function() {
            // logic here...
            console.log('Hello from myPrivateMethod..');
        }
    
    module.exports = Module;
});

