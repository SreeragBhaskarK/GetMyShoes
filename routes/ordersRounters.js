var express = require('express');
const { verify } = require('../server/middleware/session_user');
var router = express.Router();
let {orderDetails,orderSuccessfull,orderFailed,orderInvoice,downloadInvoice,middleWare,verifyPayment,orderCancel,orderReturn}=require('../controllers/orderController')

router.get('/order-details/:id/:id1',verify, orderDetails)
router.get('/order-successfull',verify,orderSuccessfull)
router.get('/order-failed',verify,orderFailed)
router.get('/invoice/:id',verify,orderInvoice)
router.get('/order_cancel/:id',verify,orderCancel)
router.get('/order_return/:id',verify,orderReturn)
router.get('/order_invoice_download/:id',verify,downloadInvoice)
router.post('/verify-payment', verify,verifyPayment)
module.exports=router