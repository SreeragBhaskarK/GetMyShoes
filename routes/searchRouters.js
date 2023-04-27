var express = require('express');
var router = express.Router();

let {search} = require('../controllers/searchControllers')

router.post('/search/:key',search)

module.exports = router