
const cart = require('../models/cart')
const user = require('../models/user')
let cartHelper = require('../server/helpers/cart-helper')
const userHelpers = require('../server/helpers/user-helpers')

exports.cartView = async (req, res) => {
    userId = req.session.user?._id
    let totalPrice = await cartHelper.getTotalAmount(userId)
    cartHelper.getCartProduct(userId).then(async (response) => {

        let subTotal = await cartHelper.getSubTotal(userId)

        subTotal = subTotal[0]?.subTotal
        let products = response
        req.session.userCart = response
        console.log(products[0]?.quantity, "testing");

        res.render('cart/cart', { products, totalPrice, subTotal })
    })

}

exports.addToCartView = (req, res, next) => {

    userId = req.session.user?._id
    proId = req.params.id
    if (userId) {
        cartHelper.addToCart(userId, proId).then((cartCount) => {
          
            res.json(cartCount)
        })

    }


}

exports.changeProductQuantity = (req, res) => {
    console.log(req.body, "//////////////////");
    userId = req.session.user?._id
    cartHelper.changeProductQuantity(req.body).then(async () => {
        let totalPrice = await cartHelper.getTotalAmount(userId)
        res.send(totalPrice)
    })

}
exports.deleteCartProduct = (req, res) => {
    console.log(req.body, "//////////////////");
    cartHelper.deleteCartProduct(req.body).then()
    res.send(true)


}

exports.checkOut = async (req, res) => {
    let subTotal = await cartHelper.getSubTotal(userId)
    subTotal = subTotal[0]?.subTotal
    let totalPrice = await cartHelper.getTotalAmount(userId)
    totalPrice = totalPrice[0]?.total
    let userCart = req.session.userCart
    console.log(subTotal, userCart);
    let users = await user.findOne({ phone: req.session.user.phone })
    res.render('cart/checkout', { subTotal, totalPrice, userCart, users })


}
exports.placeOrder = async (req, res) => {
    console.log(req.body)
    let cartProducts = await cart.findOne({ userId: req.body.user_id })
    let totalPrice = await cartHelper.getTotalAmount(req.body.user_id)
    totalPrice = totalPrice[0]?.total

    cartHelper.placeOrder(req.body, cartProducts, totalPrice).then(response => {
        res.send({ status: true })
    })

}

