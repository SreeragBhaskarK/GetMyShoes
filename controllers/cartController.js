
const { ObjectId } = require('mongodb')
const cart = require('../models/cart')
const product = require('../models/products')
const user = require('../models/user')
let cartHelper = require('../server/helpers/cart-helper')
const userHelpers = require('../server/helpers/user-helpers')

exports.cartView = async (req, res) => {
    userId = req.session.user?._id

    let appliedCoupon = req.session?.appliedCoupon?.code
    let appliedDiscount = req.session.appliedCoupon?.discount
    let discount = appliedDiscount ? appliedDiscount : 0
    let appliedminPurchase = req.session.appliedCoupon?.minPurchase
    let minPurchase = appliedminPurchase ? appliedminPurchase : 0
    console.log(discount, "nnnnnnnnnnnnn");
    let totalPrice = await cartHelper.getTotalAmount(userId, discount, minPurchase)
    cartHelper.getCartProduct(userId).then(async (response) => {

        let subTotal = await cartHelper.getSubTotal(userId)
        let coupons = await cartHelper.getCoupons()
        console.log(coupons);
        subTotal = subTotal[0]?.subTotal
        let products = response
        console.log(products, "cartlllllllllllllllllll");
        req.session.userCart = response
        console.log(discount, minPurchase, totalPrice);
        if (minPurchase <= totalPrice[0]?.total) {

            res.render('cart/cart', { products, totalPrice, subTotal, appliedCoupon, discount, coupons })
        } else {

            res.render('cart/cart', { products, totalPrice, subTotal, appliedCoupon, discount: 0, coupons })
        }

    })

}

exports.addToCartView = (req, res, next) => {

    userId = req.session.user?._id
    stock = req.body.stock
    proId = req.params.id
    console.log(proId, req.body, "nnnnnnnnnnnnnoooooo");
    let quantity = req.body?.quantity
    quantity = quantity ? quantity : 1
    stock = stock ?? 0
    console.log(quantity);
    if (userId) {
        cartHelper.addToCart(userId, proId, quantity, stock).then((cartCount) => {

            res.json(cartCount)
        })

    }


}

exports.changeProductQuantity = (req, res) => {

    userId = req.session.user?._id
    cartHelper.changeProductQuantity(req.body).then(async () => {


        let appliedDiscount = req.session.appliedCoupon?.discount ?? 0
        let discount = appliedDiscount ? appliedDiscount : 0
        let appliedminPurchase = req.session.appliedCoupon?.minPurchase
        let minPurchase = appliedminPurchase ? appliedminPurchase : 0
        let totalPrice = await cartHelper.getTotalAmount(userId, discount, minPurchase)
        console.log(totalPrice, "nnnnnnnnnn");
        let total = totalPrice[0]?.total ?? 0
        const stock = await product.findOne({ _id: req.body.proId })
        console.log(stock);
        if (minPurchase <= totalPrice[0]?.total) {
            if (stock.product_stock < req.body.count) {
                res.json({ total, stockStatus: true, discount: appliedDiscount })
            } else {
                res.json({ total, discount: appliedDiscount })
            }

        } else {
            if (stock.product_stock <= 0) {

                res.json({ total, stockStatus: true, discount: 0 })
            } else {

                res.json({ total, discount: 0 })
            }

        }
    })

}
exports.deleteCartProduct = (req, res) => {

    cartHelper.deleteCartProduct(req.body).then(async response => {
        {
            userId = req.session.user?._id
            let appliedDiscount = req.session.appliedCoupon?.discount ?? 0
            let discount = appliedDiscount ? appliedDiscount : 0
            let appliedminPurchase = req.session.appliedCoupon?.minPurchase
            let minPurchase = appliedminPurchase ? appliedminPurchase : 0
            let totalPrice = await cartHelper.getTotalAmount(userId, discount, minPurchase)
            let total = totalPrice[0]?.total ?? 0
            let subTotal = await cartHelper.getSubTotal(userId)
            subTotal = subTotal[0]?.subTotal ?? 0
            if (minPurchase <= totalPrice[0]?.total) {
                res.json({ discount: appliedDiscount, subTotal, total, status: true })
            } else {

                res.json({ discount: 0, subTotal, total, status: true })
            }


        }
    })


}


exports.checkOut = async (req, res) => {
    userId = req.session.user?._id
    let checking = await cartHelper.checkOutChecking(userId)
    if (checking) {
        let subTotal = await cartHelper.getSubTotal(userId)
        subTotal = subTotal[0]?.subTotal
        let appliedCoupon = req.session?.appliedCoupon?.code
        let appliedDiscount = req.session.appliedCoupon?.discount
        let discount = appliedDiscount ? appliedDiscount : 0
        let appliedminPurchase = req.session.appliedCoupon?.minPurchase
        let minPurchase = appliedminPurchase ? appliedminPurchase : 0
        let totalPrice = await cartHelper.getTotalAmount(userId, discount, minPurchase)

        let userCart = req.session.userCart

        let users = await user.findOne({ phone: req.session.user?.phone })
        if (totalPrice.length === 1) {
            totalPrice = totalPrice[0]?.total
            res.render('cart/checkout', { subTotal, totalPrice, userCart, users, discount })
        } else {
            res.redirect('back')
        }
    } else {
        res.redirect('back')
    }




}
exports.placeOrder = async (req, res) => {
    let userId = req.session.user?._id
    let cartProducts = await cart.findOne({ userId: userId })
    console.log(cartProducts, req.body, "nnnnnnnnnnnnnnnnnn");
    let appliedDiscount = req.session.appliedCoupon?.discount
    let discount = appliedDiscount ? appliedDiscount : 0
    let appliedminPurchase = req.session.appliedCoupon?.minPurchase
    let minPurchase = appliedminPurchase ? appliedminPurchase : 0
    let totalPrice = await cartHelper.getTotalAmount(userId, discount, minPurchase)
    totalPrice = totalPrice[0]?.total

    cartHelper.placeOrder(req.body, cartProducts, totalPrice, discount, req.params.adrsid).then(async (response) => {
        if (req.body.payment_method === 'COD') {
            let userId = req.session.user._id
            let couponCode = req.session.appliedCoupon?.code
            let coupon_id = req.session.appliedCoupon?.coupon[0]._id
            console.log('///////////////////////////', cartProducts);

           cartProducts.products.forEach(async(i) => {
            console.log(i);
            let quantity = i.quantity
           
              let result= await product.updateOne({_id:new ObjectId(i.item)},{$inc:{product_stock:-quantity}})
              console.log(result,'dfkjdkfjhjdfhj');
            });
            await user.updateOne({ _id: new ObjectId(userId) }, {
                $push: { used_coupon: [{ code: couponCode, id: coupon_id }] }
            })
            req.session.appliedCoupon = null
            res.send({ codsuccess: true })
        } else {
            order = response
            cartHelper.generateRazorpay(order).then((orderData) => {
                res.json(orderData)
            })
        }

    })

}

exports.wishlist = async (req, res) => {
    let userId = req.session.user._id
    cartHelper.getWishList(userId).then((wishlistData) => {

        res.render('cart/wishlist', { wishlistData })
    })
}
exports.addToWishListView = async (req, res) => {
    userId = req.session.user?._id
    proId = req.params.id

    if (userId) {
        cartHelper.addToWishList(userId, proId).then((wishlistCount) => {
            console.log(wishlistCount, 'nnnnnnnnnn');
            res.json(wishlistCount)
        })

    }
}
exports.deleteWishListProduct = (req, res) => {

    cartHelper.deleteWishListProduct(req.body).then(response => {
        res.json(response)
    })



}

exports.couponCheck = (req, res) => {
    let total = Number(req.params.price)
    let userId = req.session.user._id
    console.log(req.body, '//////////////');
    cartHelper.couponCheck(req.body, total, userId).then(async (response) => {
        req.session.appliedCoupon = response
        console.log(response.status);
        if (response.status) {
            let appliedDiscount = req.session.appliedCoupon?.discount
            let discount = appliedDiscount ? appliedDiscount : 0
            let appliedminPurchase = req.session.appliedCoupon?.minPurchase
            let minPurchase = appliedminPurchase ? appliedminPurchase : 0
            let totalPrice = await cartHelper.getTotalAmount(userId, discount, minPurchase)
            res.json({ discount: appliedDiscount, total: totalPrice[0].total, status: true })
        } else {
            res.send(response)
        }

    }).catch(error => {
        res.json({ status: false, message: error.message })
    })


}

exports.couponClear = (req, res) => {
    req.session.appliedCoupon = null
    res.status(200).send({ status: true })
}

