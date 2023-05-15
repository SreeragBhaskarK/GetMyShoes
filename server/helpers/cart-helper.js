let cart = require('../../models/cart')
let order = require('../../models/order')
let user = require('../../models/user')
let wishlist = require('../../models/wishlist')
let coupon = require('../../models/coupon')
const mongoose = require('mongoose');
const objectId = mongoose.Types.ObjectId;
const Razorpay = require('razorpay')
const { ObjectId } = require('mongodb')
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {
    addToCart(userId, proId, quantity, stock) {
        return new Promise(async (resolve, reject) => {
            let cartItem = await cart.findOne({ userId: userId })
            if (cartItem) {
                let proExist = cartItem.products.findIndex(product => product.item == proId)
                if (proExist != -1) {

                    await cart.updateOne({ userId: new objectId(userId), 'products.item': new objectId(proId) }, {
                        $inc: {
                            'products.$.quantity': quantity
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
                                    quantity: quantity,
                                    stock: stock
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



            /*   console.log(cartCount.productId.length,"leeeeeeeeeeeeeee"); */
            resolve(cartItems)
        })
    },
    changeProductQuantity(cartData) {
        return new Promise(async (resolve, reject) => {
            let { count, cartId, proId } = cartData
            count = new Number(count)

            await cart.updateOne({
                _id: new objectId(cartId), 'products.item': new objectId(proId)
            }, {

                'products.$.quantity': count

            })
            resolve()
        })
    }
    ,
    getTotalAmount(userId, discount, minPurchase) {
        console.log(userId, discount, minPurchase);
        return new Promise(async (resolve, reject) => {

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
                    total: { $sum: { $multiply: ['$quantity', '$products.product_price'] } },

                }
            }, {
                $project: {
                    _id: 0,
                    total: {
                        $subtract: [
                            '$total',
                            {
                                $cond: {
                                    if: { $gte: ['$total', minPurchase] },
                                    then: discount,
                                    else: 0
                                }
                            }
                        ]
                    },


                }
            }])
            console.log(totalPrice, "///////////////total");

            resolve(totalPrice)
        })
    },
    getCartCount(userId) {
        return new Promise(async (resolve, reject) => {


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

            resolve()
        })
    },

    placeOrder(orders, products, total, discount, address) {
        console.log(orders, products, total, 'mmmmm');
        return new Promise(async (resolve, reject) => {
            let status = orders.payment_method === 'COD' ? 'placed' : 'pending'
            let ShippingStatus = orders.payment_method === 'COD' ? 'Order Placed' : 'Processing'

            /* let deliveryAddressId = orders.delevery_address */
            let userId = orders.user_id
            let paymentMethod = orders.payment_method
            let deliveryAddress = await user.aggregate([{
                $match: {
                    _id: new objectId(userId)
                }

            }, {
                $unwind: '$address'
            }, {
                $match: { 'address._id': new objectId(address) }

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
                totalAmount: total,
                discount: discount,
                shipping_status: ShippingStatus
            })
            orderData.save()
            console.log(orderData, 'checkingorder');
            await cart.deleteOne({ userId: new objectId(userId) })
            resolve(orderData)

        })
    },
    getOrders(user_id) {

        return new Promise(async (resolve, reject) => {
            let orders = await order.aggregate([{
                $match: {
                    userId: new objectId(user_id)
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
                    productInfo: {
                        $map: {
                            input: "$productInfo",
                            as: "p",
                            in: {
                                $mergeObjects: [
                                    "$$p",
                                    {
                                        quantity: {
                                            $arrayElemAt: [
                                                "$productsData.quantity",
                                                {
                                                    $indexOfArray: [
                                                        "$productsData.item",
                                                        "$$p._id"
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
            }, { "$sort": { "createdAt": -1 } }
            ]).catch(error => {
                console.log(error.message);
            })

            resolve(orders)

        }).catch(error => {
            console.log(error.message);
        })
    },
    generateRazorpay(orders) {
        return new Promise((resolve, reject) => {
            var options = {
                amount: orders.totalAmount * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: String(orders._id)
            };
            instance.orders.create(options, function (err, order) {
                console.log(order);
                resolve(order)
            });
        })

    }
    ,
    getWishList(userId) {
        return new Promise(async (resolve, reject) => {
            let wishlistData = await wishlist.aggregate([{
                $match: {
                    userId: new objectId(userId)
                }
            }, {
                $project: {
                    item: '$products.item'
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'products'
                }
            }])
            console.log(wishlistData, '/////////');
            resolve(wishlistData)
        })
    },
    addToWishList(userId, proId) {
        return new Promise(async (resolve, reject) => {
            let wishlistItem = await wishlist.findOne({ userId: userId })
            if (wishlistItem) {
                let proExist = wishlistItem.products.findIndex(product => product.item == proId)
                if (proExist != -1) {


                    let cartCount = await wishlist.findOne({ userId: userId })

                    cartCount = cartCount?.products.length
                    resolve(cartCount)

                } else {
                    await wishlist.updateOne({
                        userId: new objectId(userId)
                    }, {
                        $push: {
                            products:
                            {
                                item: proId
                            }

                        }
                    }).then(async () => {
                        let wishlistCount = await wishlist.findOne({ userId: userId })

                        wishlistCount = wishlistCount?.products.length
                        resolve(wishlistCount)
                    })
                }



            } else {
                let newWishlist = new wishlist({
                    userId: userId,
                    products: [
                        {
                            item: proId
                        }
                    ]
                })
                newWishlist.save()
                resolve()
            }
        })
    },

    getwishListCount(userId) {
        return new Promise(async (resolve, reject) => {

            let wishlistCount = await wishlist.findOne({ userId: userId })

            wishlistCount = wishlistCount?.products.length
            resolve(wishlistCount)
        })
    },

    deleteWishListProduct(data) {
        return new Promise(async (resolve, reject) => {
            let { proId, wishlistId } = data

            let deleteStatus = await wishlist.findOneAndUpdate({ _id: new objectId(wishlistId) }, {
                $pull: {
                    products: { item: new objectId(proId) }
                }
            })


            let wishlistCount = deleteStatus.products.length - 1
            console.log(wishlistCount);
            resolve(wishlistCount)
        })
    },
    couponCheck(Coupon, total, userId) {
        return new Promise(async (resolve, reject) => {
            let { appliedCoupon } = Coupon
            let checkCoupon = await user.find({ _id: new ObjectId(userId) })
            console.log(checkCoupon);
            let result = checkCoupon[0].used_coupon.findIndex(coupon => coupon.code == appliedCoupon)
            console.log(result);
            if (result != -1) {
                reject(new Error('already using coupon'))
                return
            }
            let couponCheck = await coupon.find({ code: appliedCoupon, status: 'active' })
            console.log(couponCheck);
            if (couponCheck.length === 1) {
                console.log(total);
                if (couponCheck[0].minPurchase <= total) {
                    resolve({ status: true, code: appliedCoupon, discount: couponCheck[0].discount, minPurchase: couponCheck[0].minPurchase, coupon: couponCheck })
                } else {
                    resolve({ status: false, message: 'minimum purchase ₹ ' + couponCheck[0].minPurchase })
                }

            } else {

                reject(new Error('invaild coupon'))
                return
            }
        }).catch(error => {
            throw error
        })
    },
    getCoupons() {
        return new Promise(async (resolve, reject) => {
            let coupons = await coupon.find({ status: 'active' }).sort({ $natural: -1 }).limit(4)

            resolve(coupons)
        })
    },
    checkOutChecking(userId) {
        return new Promise(async (resolve, reject) => {
            let checkResult = await cart.aggregate([{
                $match: {
                    userId: new ObjectId(userId)
                }
            }, {
                $unwind: '$products'

            }, {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity',
                    stock: '$products.stock',

                }
            }])
            console.log(checkResult,';;;;;;;;');
            let result = true
            checkResult.forEach(i => {
                let stock = i.stock
                let quantity = i.quantity
                if (quantity > stock) {
                    result = false
                    console.log(result);
                    return
                }
            })
            console.log(result);
            resolve(result)
        })
    }
}