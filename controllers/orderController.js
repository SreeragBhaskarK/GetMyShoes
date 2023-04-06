const mongoose = require('mongoose');
var orderHelper = require('../server/helpers/order-helper');

exports.orderDetails = (req, res) => {

  /*   // Check if idData is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(idData)) {
        return res.status(400).send('Invalid ID');
    }
 */
let orderId = req.params.id
let proId = req.params.id1
    orderHelper.doOrderDetails(orderId,proId).then(response => {

        let orders = response[0]
        console.log(orders);
        res.render('orders/ordersDetails', { orders, layout: false })
    })

}
