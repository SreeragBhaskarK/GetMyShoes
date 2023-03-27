var express = require('express');
var router = express.Router();


const { shopView, productDetail, productView } = require("../controllers/productController")


router.get('/products', productView)
router.get('/product/:id', productDetail)
router.get('/shop', shopView) 
module.exports = router;