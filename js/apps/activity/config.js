var consts = {};

consts.BASEPATH    = '/assets/js';
consts.API         = APIEndpoint;
consts.VENDOR      = consts.BASEPATH + '/vendor';
consts.BOWER       = consts.VENDOR + '/bower_components';
consts.APPS        = consts.BASEPATH + '/apps';
consts.CORE        = consts.APPS + '/core';
consts.ACTIVITY    = consts.APPS + '/activity';
consts.PAGES    = consts.ACTIVITY  + '/pages';
consts.DATA    = consts.ACTIVITY  + '/data';
consts.COMPONENTS    = consts.ACTIVITY  + '/components';
consts.APP_COMPONENTS      = consts.BASEPATH + '/app/components';
consts.HELPERS          = consts.BASEPATH + '/lib/equinox.helpers';

requirejs.config({

    baseUrl: consts.BASEPATH,

    paths: {
        // Make vendor easier to access.
        vendor: consts.VENDOR,

        // Map remaining vendor dependencies.
        jquery: consts.BOWER + '/jquery/jquery',
        // Opt for Lo-Dash Underscore compatibility build over Underscore.
        underscore: consts.BOWER + '/lodash/dist/lodash.underscore',
		backbone: consts.BOWER + '/backbone/backbone',
		moment: consts.BASEPATH + '/lib/moment',
		spinner: consts.BOWER + '/spin.js/spin',
        owlcarousel: consts.BOWER + '/owlcarousel/owl-carousel/owl.carousel',
        chartjs: consts.BOWER + '/chartjs/Chart',
        apps: consts.APPS,
        core: consts.CORE,
		activity: consts.ACTIVITY,
		pages : consts.PAGES,
		data : consts.DATA,
		components : consts.COMPONENTS,
		app_components : consts.APP_COMPONENTS,
		helpers : consts.HELPERS
    },

    shim: {
		'app_components' : {
			deps : [ 'jquery', 'underscore', 'backbone', 'vendor/_console' ],
			exports : 'app_components'
		},
		'helpers' : {
		    exports : 'helpers'
		}
    }
});