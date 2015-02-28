/**
 * @module helpers/utils
 */
define(function (require, exports, module) {
    'use strict';

    var moment = require('moment');
    /**
     * Utilities
     *
     * Useful utilities we will use throughout the app
     *
     * @name Utils
     * @class Utils
     */
    var Utils = function () {
        /** @constant {string} */
        this.STARTDATE = moment().add('days', 1).format('YYYY-MM-DD');
        /** @constant {string} */
        this.ENDDATE = moment().add('days', 30).format('YYYY-MM-DD');
        /** @constant {string} */
        this.TOMORROW = moment().add('days', 1).format('YYYY-MM-DD');
    };

    Utils.prototype = {
        /**
         * @name isValidDate
         * @function
         * @param {string} date - 2014-05-31 format
         * @returns {boolean}
         */
        isValidDate: function (date) {
            var isAfter = moment(date).isAfter(this.STARTDATE);
            var isBefore = moment(date).isBefore(this.ENDDATE);
            var isStart = moment(date).isSame(this.STARTDATE);
            var isEnd = moment(date).isSame(this.ENDDATE);

//            console.log('Attr: date', date);
//            console.log('isAfter ', moment(date).isAfter(this.STARTDATE));
//            console.log('isBefore ', moment(date).isBefore(this.ENDDATE));
//            console.log('isSame as Start ', moment(date).isSame(this.STARTDATE));
//            console.log('isSame as End ', moment(date).isSame(this.ENDDATE));
//            console.log('Return', (isAfter && isBefore) || (isStart || isEnd));

            return (isAfter && isBefore) || (isStart || isEnd);
        }
    };

    module.exports = Utils;
});

