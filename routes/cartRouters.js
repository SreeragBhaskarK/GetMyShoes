var express = require('express');
const { verify } = require('../server/middleware/session_user');
var router = express.Router();
let {cartView,addToCartView, changeProductQuantity,deleteCartProduct ,checkOut ,placeOrder,wishlist,addToWishListView,deleteWishListProduct,couponCheck}=require('../controllers/cartController')

router.get('/cart' ,verify, cartView)
router.post('/add-toCart/:id',verify, addToCartView)
router.post('/change-product-quantity',changeProductQuantity)
router.delete('/delete-cart-product',deleteCartProduct)

router.get('/checkout',verify,checkOut)
router.post('/place-order/:adrsid',verify,placeOrder)
router.get('/wishlist',verify,wishlist)
router.get('/add-toWishlist/:id',verify, addToWishListView)
router.delete('/delete-wishlist-product',deleteWishListProduct)
router.post('/coupon_check/:price', couponCheck)
module.exports=router