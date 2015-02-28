(function() {
	define('bootstrap', function (require) {
	    'use strict';
	    
	    var init = function() {
	        require('app_components');
	        require('helpers');
	        require('moment');
    		require('jquery');
    		require('underscore');
    		
    		if (window.EQ && window.moment && window._ && window.$) {
    		    var Activity = require('activity/app');
    		} else {
    		    console.warn('error loading require modules');
    		    setTimeout(init, 500);
    		}
	    };

	    init();
	    
	});

	// Break out the application running from the configuration definition to
	// assist with testing.
	require(['config'], function () {
	    // Kick off the application.
	    require(['bootstrap']);
	});
})();