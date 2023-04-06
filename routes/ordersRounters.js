var express = require('express');
const { verify } = require('../server/middleware/session_user');
var router = express.Router();
let {orderDetails}=require('../controllers/orderController')

router.get('/order-details/:id/:id1', orderDetails)
module.exports=router