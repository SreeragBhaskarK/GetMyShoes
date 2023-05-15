const order = require("../../models/order")
const { ObjectId } = require("mongodb")

var crypto = require("crypto");
module.exports = {
    doOrderDetails(orders, pro) {

        return new Promise(async (resolve, reject) => {
            try {
                let ordersData = await order.aggregate([{
                    $match: { _id: new ObjectId(orders) }
                }, {
                    $addFields: {
                        productsData: '$products.products'
                    }
                }, {
                    $lookup: {
                        from: 'products',
                        let: { productIds: '$productsData.item' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$productIds'],

                                    }
                                }
                            }
                        ],
                        as: 'productInfo'
                    }
                }, {
                    $addFields: {
                        productInfo: {
                            $map: {
                                input: "$productInfo",
                                as: "product",
                                in: {
                                    $mergeObjects: [
                                        "$$product",
                                        {
                                            quantity: {
                                                $arrayElemAt: [
                                                    "$productsData.quantity",
                                                    {
                                                        $indexOfArray: [
                                                            "$productsData.item",
                                                            "$$product._id"
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }, {
                    $project: {
                        _id: 1,
                        productInfo: 1,
                        createdAt: 1,
                        paymentMethod: 1,
                        status: 1,
                        shipping_status:1,
                        deliveryAddress:1
                    }
                }, {
                    $unwind: '$productInfo'
                }, {
                    $match: {
                        'productInfo._id': new ObjectId(pro)
                    }
                }]);

      
                resolve(ordersData)
            }
            catch (e) {
            
            }

        })
    }, verifyPayment(details) {
        return new Promise((resolve, reject) => {
            var expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            expectedSignature.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            expectedSignature = expectedSignature.digest('hex')
            if (expectedSignature === details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })

    },

    changePaymentStatus(orderId, paymentDetails) {
        return new Promise((resolve, reject) => {
            order.updateOne({ _id: new ObjectId(orderId) }, {
                $set: { status: 'placed', payment_details: paymentDetails,shipping_status:'Order Placed' }
            }).then(() => {
                resolve()
            })
        })

    }, doOrderInvoice(orderId) {
        let orderID = new ObjectId(orderId)
        return new Promise(async (resolve, reject) => {
            let orders = await order.aggregate([{
                $match: {
                    _id: orderID
                }
            }, {
                $addFields: {
                    productsData: {
                        $ifNull: ['$products.products', []]
                    }
                }
            }, {
                $lookup: {
                    from: 'products',
                    let: { productIds: '$productsData.item' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ['$_id', '$$productIds']
                                }
                            }
                        }
                    ],
                    as: 'productInfo'
                }
            }, {
                $addFields: {
                    'productInfo': {
                        $map: {
                            input: '$productInfo',
                            as: 'product',
                            in: {
                                $mergeObjects: [
                                    '$$product',
                                    {
                                        quantity: {
                                            $arrayElemAt: [
                                                '$productsData.quantity',
                                                {
                                                    $indexOfArray: [
                                                        '$productsData.item',
                                                        '$$product._id'
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }, {
                $addFields: {
                    totalProAmount: {
                        $reduce: {
                            input: '$productInfo',
                            initialValue: 0,
                            in: {
                                $add: [
                                    '$$value',
                                    {
                                        $multiply: [
                                            '$$this.quantity',
                                            '$$this.product_price'
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            }])
      
            resolve(orders)

        })
    }

    ,
    doOrderCancel(orderId){
        return new Promise(async(resolve,reject)=>{
            await order.updateOne({_id:new ObjectId(orderId)},{
                $set:{
                    shipping_status:'Cancelled'
                }
            })

            resolve()
        })
    }
    ,
    doOrderReturn(orderId){
        return new Promise(async(resolve,reject)=>{
            await order.updateOne({_id:new ObjectId(orderId)},{
                $set:{
                    shipping_status:'Return to Sender'
                }
            })

            resolve()
        })
    }
}