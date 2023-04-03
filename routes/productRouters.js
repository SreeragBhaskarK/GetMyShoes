var express = require('express');
var router = express.Router();


const { shopView, productDetail, productView,shopCategory } = require("../controllers/productController")


router.get('/products', productView)
router.get('/product/:id', productDetail)
router.get('/shop', shopView) 
router.post('/shop_category',shopCategory)
module.exports = router;