const mongoose = require('mongoose');
var orderHelper = require('../server/helpers/order-helper');
const fs = require('fs');
const pdf = require('html-pdf');
var path = require('path');
let ejs = require('ejs')
const user = require('../models/user');
const { ObjectId } = require('mongodb');
const order = require('../models/order');

exports.orderDetails = (req, res) => {


    let orderId = req.params.id
    let proId = req.params.id1
    orderHelper.doOrderDetails(orderId, proId).then(response => {
        let orders = response[0]

        res.render('orders/ordersDetails', { orders, layout: false })
    })

}

exports.verifyPayment = async (req, res) => {

    orderHelper.verifyPayment(req.body).then(() => {
        let razorpay_payment_id = req.body['payment[razorpay_payment_id]']
        let razorpay_order_id = req.body['payment[razorpay_order_id]']
        let razorpay_signature = req.body['payment[razorpay_signature]']
        let paymentDetails = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        orderHelper.changePaymentStatus(req.body['order[receipt]'], paymentDetails).then(async () => {
        
            let userId = req.session.user._id

            let couponCode = req.session.appliedCoupon?.code
            let coupon_id = req.session.appliedCoupon?.coupon[0]._id

            await user.updateOne({ _id: new ObjectId(userId) }, {
                $push: { used_coupon: [{ code: couponCode, id: coupon_id }] }
            })
            req.session.appliedCoupon = null
            res.json({ status: true })
        })
    }).catch((err) => {


        res.json({ status: false })
    })
}

exports.orderSuccessfull = (req, res) => {
    res.render('orders/order_successfull')
}
exports.orderFailed = (req, res) => {
    res.render('orders/order_failed')
}
exports.orderInvoice = (req, res) => {
    let orderId = req.params.id

    let userEmail = req.session.user?.email
    orderHelper.doOrderInvoice(orderId).then(response => {
        let orderDetail = response
        res.render('orders/invoice', { layout: false, orderDetail, userEmail })
    })
}
exports.orderCancel = (req, res) => {
    let orderId = req.params.id

    orderHelper.doOrderCancel(orderId).then(response => {

        res.redirect('/settings')
    })
}
exports.orderReturn = async (req, res) => {
    let orderId = req.params.id

    let orderData = await order.findOne({ _id: new ObjectId(orderId) })
    const currentDate = new Date();
    const createdAtDate = new Date(orderData.createdAt);
    const timeDifference = currentDate.getTime() - createdAtDate.getTime();
    const diffInDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); 

    if (diffInDays <= 10) {
        orderHelper.doOrderReturn(orderId).then(response => {

            res.redirect('/settings')
        })
    } else {
        res.redirect('/settings')
    }

}
exports.downloadInvoice = async (req, res) => {
    try {
        orderId = req.params.id
        let orderDetail = await orderHelper.doOrderInvoice(orderId)

        let filePathName = path.resolve(__dirname, '../views/orders/invoice.ejs')
        let htmlString = fs.readFileSync(filePathName).toString()
        htmlString += `
        <style>
            body {
                
                font-size: 80%;
                border: 1px solid black;
                padding: 5px;
                
            }
            .InvoiceTitle{
                text-align: center;
            }
            .InvoiceCard{
                width:100%
            }
            .payment{
                text-align: left;
                width: fit-content;
                margin-right: auto;

            }
            .paymentDate{
                text-align: right;
                width: fit-content;
                margin-left: auto;

            }
            .table{
                width:100%

            }
            th, td {
                border: 1px solid black;
                padding: 5px;
            }
           
        </style>
    `
        let options = {
            format: 'A4',
            orientation: "portrait",
            border: '5mm',
        }
        let userEmail = req.session.user?.email
        let ejsData = ejs.render(htmlString, { layout: false, orderDetail, noButton: true, userEmail })

        pdf.create(ejsData, options).toFile('invoice.pdf', (err, response) => {

            let filePath = path.resolve(__dirname, '../invoice.pdf')

            fs.readFile(filePath, (err, file) => {
                if (err) {
  
                    return res.status(500).send('Could not download file')
                }
                console.log('file generated');
                res.setHeader('Content-disposition', 'attachment; filename=invoice.pdf');
                res.setHeader('Content-type', 'application/pdf');

                res.send(file)
            })


        })
    }
    catch (e) {
     
    }

}
