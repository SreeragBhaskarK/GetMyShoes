var express = require('express');
const { verify } = require('../server/middleware/session_user');
var router = express.Router();
let {orderDetails,orderSuccessfull,orderFailed,orderInvoice,downloadInvoice,middleWare,verifyPayment,orderCancel}=require('../controllers/orderController')
router.use(middleWare)
router.get('/order-details/:id/:id1', orderDetails)
router.get('/order-successfull',orderSuccessfull)
router.get('/order-failed',orderFailed)
router.get('/invoice/:id',orderInvoice)
router.get('/order_cancel/:id',orderCancel)
router.get('/order_invoice_download/:id',downloadInvoice)
router.post('/verify-payment', verifyPayment)
module.exports=router