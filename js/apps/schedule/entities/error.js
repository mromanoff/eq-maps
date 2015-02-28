define(function (require, exports, module) {
    'use strict';

    var Backbone = require('backbone');

    module.exports = Backbone.Model.extend({
        defaults: {
            message: null,
            code: null,
            exception: null,
            data: null
        }
    });
});


//{
//    "error": {
//    "message": "Please try again later.",
//        "code": 500,
//        "exception": "System.NullReferenceException: Object reference ...",
//        "data": null
//}
//}
