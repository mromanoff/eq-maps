//define(function (require, exports, module) {
//    'use strict';
//
//    /**
//     * Utilities
//     *
//     * Useful utitilities we will use throughout the app
//     *
//     * @name Utils
//     * @class Utils
//     */
//    var DateHelper = function () {
//        //this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//        //this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//        //this.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//        //this.shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//        this.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//        this.abbreviatedDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//        this.shortestDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
//        this.firstLetterDayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
//        this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//        this.abbreviatedMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//    };
//
//    DateHelper.prototype = {
//
//        addMilliseconds: function (value) {
//            var d = new Date();
//            d.setMilliseconds(d.getMilliseconds() + value);
//            return d;
//        },
//
//        addDays: function (value) {
//            return this.addMilliseconds(value * 86400000);
//        },
//
//        pad: function (n) {
//            return (n < 10) ? '0' + n : n;
//        },
//
//        /**
//         * Get Month long name
//         * @param d
//         * @returns month name
//         */
//        getMonth: function (d) {
//            d = new Date(d);
//            return this.monthNames[d.getMonth()];
//        },
//
//        /**
//         *
//         * @param d
//         * @returns short month name
//         */
//        getShortMonth: function (d) {
//            d = new Date(d);
//            return this.abbreviatedMonthNames[d.getMonth()];
//        },
//
//        // getDate 2 or 31
//        getDate: function (d) {
//            d = new Date(d);
//            return d.getDate();
//        },
//
//        // getTime etc. 10:30
//        getTime: function (d) {
//            d = new Date(d);
//            return d.getHours() + ':' + d.getMinutes();
//        },
//
//        // getWeekdayDay etc. Sunday
//        getWeekDay: function (d) {
//            d = new Date(d);
//            return this.dayNames[d.getDay()];
//        },
//
//        // getShortWeekdayDay etc. Sun
//        getShortWeekDay: function (d) {
//            d = new Date(d);
//            return this.abbreviatedDayNames[d.getDay()];
//        },
//
////        // week starts on sunday
////        startDate: function (d) {
////            d = new Date(d);
////            var day = d.getDay(),
////                diff = d.getDate() - day;
////            return new Date(d.setDate(diff));
////        },
////
////        // week ends on saturday
////        endDate: function (d) {
////            d = new Date(d);
////            var day = d.getDay(),
////                diff = d.getDate() - day + 6;
////            return new Date(d.setDate(diff));
////        },
//
//        // Date formats
//        // 2013-12-01  used for URLs
//        iso8601: function (d) {
//            d = new Date(d);
//            return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
//        },
//
//        // AM/PM
//        getMeridiemIndicator: function (d) {
//            d = new Date(d);
//            return ((d.getHours() >= 12) ? 'PM' : 'AM');
//        }
//        //,
//
////        // 3:25 AM or 3:25 PM
////        period: function (d) {
////            return (((d.getHours() % 12) === 0) ? 12 : d.getHours() % 12) + ':' + ((d.getMinutes() < 10) ? ('0' + d.getMinutes()) : d.getMinutes()) + ' ' + this.meridiemIndicator(d);
////        },
//
//        //JAN 2012 Used for Month View
////        shortDate: function (d) {
////            return '<strong>' + this.abbreviatedMonthNames(d) + '</strong> ' + d.getFullYear();
////        }
//    };
//
//    module.exports = DateHelper;
//});
//
