var express = require('express');
const { verify } = require('../server/middleware/session_user');
var router = express.Router();
let {cartView,addToCartView, changeProductQuantity,deleteCartProduct ,checkOut ,placeOrder}=require('../controllers/cartController')

router.get('/cart' ,verify, cartView)
router.get('/add-toCart/:id',verify, addToCartView)
router.post('/change-product-quantity',changeProductQuantity)
router.delete('/delete-cart-product',deleteCartProduct)

router.get('/checkout',verify,checkOut)
router.post('/place-order',verify,placeOrder)

module.exports=router