define('bootstrap', function (require) {
    'use strict';

    var App = require('account/app');

    App.start();

});

// Break out the application running from the configuration definition to
// assist with testing.
require(['config'], function () {
    require(['bootstrap']);
});