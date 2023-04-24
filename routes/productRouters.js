var express = require('express');
var router = express.Router();


const { shopView, productDetail, productView,shopCategory,shopPriceFilter,brandProducts,allBrandProducts } = require("../controllers/productController")


router.get('/products', productView)
router.get('/product/:id', productDetail)
router.get('/shop', shopView) 
router.post('/shop_category',shopCategory)
router.post('/price_filter',shopPriceFilter)
router.post('/brand_product',brandProducts)
router.post('/all_brand_product',allBrandProducts)
module.exports = router;