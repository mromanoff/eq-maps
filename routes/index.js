var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EQUINOX' });
});


/* GET clubs page. */
router.get('/clubs', function(req, res, next) {
  res.render('clubs', { title: 'EQUINOX | Fitness Clubs' });
});

module.exports = router;
