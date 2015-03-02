var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
      title: 'EQUINOX',
      classes: 'home'  
  });
});


/* GET clubs page. */
router.get('/clubs', function(req, res, next) {
  res.render('clubs', { 
      title: 'EQUINOX | Fitness Clubs',
      classes: 'clubs'
  });
});


/* GET clubs region page. */
router.get('/clubs/:region', function(req, res, next) {
  res.render('region', { 
      title: 'EQUINOX | Fitness Clubs Region',
      classes: 'clubs clubs-region',
      regionName: req.params.region
  });
});

/* GET club page. */
router.get('/clubs/:region/:club', function(req, res, next) {
  res.render('club', { 
      title: 'EQUINOX | Fitness Club',
      classes: 'club-detail'
  });
});

module.exports = router;
