var express = require('express');
const { verify } = require('../server/middleware/session_user');
var router = express.Router();
let {orderDetails,orderSuccessfull,orderFailed}=require('../controllers/orderController')

router.get('/order-details/:id/:id1', orderDetails)
router.get('/order-successfull',orderSuccessfull)
router.get('/order-failed',orderFailed)
module.exports=router