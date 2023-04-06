let cart = require('../../models/cart')
let order = require('../../models/order')
let user = require('../../models/user')
const mongoose = require('mongoose');
const objectId = mongoose.Types.ObjectId;

module.exports = {
    addToCart(userId, proId) {
        return new Promise(async (resolve, reject) => {
            let cartItem = await cart.findOne({ userId: userId })
            if (cartItem) {
                let proExist = cartItem.products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    console.log("quantinnnnnnnnnnnnnnnnnnnnnnnnnnnnn");
                    await cart.updateOne({ userId: new objectId(userId), 'products.item': new objectId(proId) }, {
                        $inc: {
                            'products.$.quantity': 1
                        }
                    }).then(async () => {
                        let cartCount = await cart.findOne({ userId: userId })

                        cartCount = cartCount?.products.length
                        resolve(cartCount)
                    })
                } else {
                    await cart.updateOne({
                        userId: new objectId(userId)
                    }, {
                        $push: {
                            products: [
                                {
                                    item: proId,
                                    quantity: 1
                                }
                            ]
                        }
                    }).then(async () => {
                        let cartCount = await cart.findOne({ userId: userId })

                        cartCount = cartCount?.products.length
                        resolve(cartCount)
                    })
                }



            } else {
                let newCart = new cart({
                    userId: userId,
                    products: [
                        {
                            item: proId,
                            quantity: 1
                        }
                    ]
                })
                newCart.save()
                resolve()
            }
        })
    }

    , getCartProduct(userId) {
        return new Promise(async (resolve, reject) => {
            console.log(userId, "userrrrrrrrrrrrrrrrrrId");
            let cartItems = await cart.aggregate([{
                $match: {
                    userId: new objectId(userId)
                }
            }, {
                $unwind: '$products'

            }, {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'products'
                }
            }, {
                $project: {
                    item: 1, quantity: 1, products: {
                        $arrayElemAt: ['$products', 0]
                    }
                }
            }, {
                $addFields: {
                    total: { $multiply: ['$quantity', '$products.product_price'] }
                }
            }])
            console.log(cartItems, "nnnnntotalnnnnnn");


            /*   console.log(cartCount.productId.length,"leeeeeeeeeeeeeee"); */
            resolve(cartItems)
        })
    },
    changeProductQuantity(cartData) {
        return new Promise(async (resolve, reject) => {
            let { count, cartId, proId } = cartData
            count = new Number(count)
            console.log(cartId);
            await cart.updateOne({
                _id: new objectId(cartId), 'products.item': new objectId(proId)
            }, {

                'products.$.quantity': count

            })
            resolve()
        })
    }
    ,
    getTotalAmount(userId) {
        return new Promise(async (resolve, reject) => {
            console.log(userId, "userrrrrrrrrrrrrrrrrrId");
            let totalPrice = await cart.aggregate([{
                $match: {
                    userId: new objectId(userId)
                }
            }, {
                $unwind: '$products'

            }, {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'products'
                }
            }, {
                $project: {
                    item: 1, quantity: 1, products: {
                        $arrayElemAt: ['$products', 0]
                    }
                }
            }, {
                $group: {
                    _id: null,
                    total: { $sum: { $multiply: ['$quantity', '$products.product_price'] } }
                }
            }])
            console.log(totalPrice, "nnnnnnnnnnn");
            resolve(totalPrice)
        })
    },
    getCartCount(userId) {
        return new Promise(async (resolve, reject) => {
            console.log(userId, "userrrrrrrrrrrrrrrrrrId");

            /* let cartCount = await cart.aggregate([{
                $match: {
                    userId: new objectId(userId)
                }
            }, {
                $unwind: '$products'

            }, {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'products'
                }
            }, {
                $project: {
                    item: 1, quantity: 1, products: {
                        $arrayElemAt: ['$products', 0]
                    }
                }
            }, {
                $group: {
                    _id: null,
                    total: { $sum: '$quantity' }
                }
            }]) */
            let cartCount = await cart.findOne({ userId: userId })

            cartCount = cartCount?.products.length
            resolve(cartCount)
        })
    },
    getSubTotal(userId) {
        return new Promise(async (resolve, reject) => {
            console.log(userId, "userrrrrrrrrrrrrrrrrrId");
            let subTotal = await cart.aggregate([{
                $match: {
                    userId: new objectId(userId)
                }
            }, {
                $unwind: '$products'

            }, {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'products'
                }
            }, {
                $project: {
                    item: 1, quantity: 1, products: {
                        $arrayElemAt: ['$products', 0]
                    }
                }
            }, {
                $group: {
                    _id: null,
                    subTotal: { $sum: '$products.product_price' }
                }
            }])
            console.log(subTotal, "nnnnnnsubTotalnnnnn");
            resolve(subTotal)
        })
    },

    deleteCartProduct(data) {
        return new Promise(async (resolve, reject) => {
            let { proId, cartId } = data
            let deleteStatus = await cart.findOneAndUpdate({ _id: new objectId(cartId) }, {
                $pull: {
                    products: { item: new objectId(proId) }
                }
            })
            console.log(deleteStatus);
            resolve()
        })
    },

    placeOrder(orders, products, total) {
        console.log(orders, products, total, "////////////");
        return new Promise(async (resolve, reject) => {
            let status = orders.payment_method === 'COD' ? 'placed' : 'pending'
            let deliveryAddressId = orders.delevery_address
            let userId = orders.user_id
            let paymentMethod = orders.payment_method
            let deliveryAddress = await user.aggregate([{
                $match: {
                    _id: new objectId(userId)
                }

            }, {
                $unwind: '$address'
            }, {
                $match: { 'address._id': new objectId(deliveryAddressId) }

            }, {
                $project: { address: 1, _id: 0 }
            }])
            deliveryAddress = deliveryAddress[0]?.address
            let orderData = new order({
                userId: userId,
                deliveryAddress: deliveryAddress,
                paymentMethod: paymentMethod,
                products: products,
                status: status,
                totalAmount: total
            })
            orderData.save()

            await cart.deleteOne({ userId: new objectId(userId) })
            resolve()

        })
    },
    getOrders() {

        return new Promise(async (resolve, reject) => {
            let orders = await order.aggregate([{
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
                                    $in: ['$_id', '$$productIds']
                                }
                            }
                        }
                    ],
                    as: 'productInfo'
                }
            }])
            console.log(orders[0].productInfo, "nnnnnnnnnnn");
            resolve(orders)

        })
    }
}