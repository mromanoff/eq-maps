// Set the baseUrl here, since we're not using data-main attr.
requirejs.config({
    baseUrl: '/assets/js/apps/simple'
});

// Require Main App
require(['app']);

//main.built.js
//r.js -o baseUrl=. name=main out=main.built.js mainConfigFile=main.js  