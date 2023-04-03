
const cart = require('../models/cart')
let cartHelper = require('../server/helpers/cart-helper')

exports.cartView = async (req, res) => {
    userId = req.session.user?._id
    let totalPrice = await cartHelper.getTotalAmount(userId)
    cartHelper.getCartProduct(userId).then(async (response) => {
        let cartCount = await cartHelper.getCartCount(userId)
        let subTotal = await cartHelper.getSubTotal(userId)

        subTotal = subTotal[0]?.subTotal
       
       
        let products = response
        req.session.userCart=response
        console.log(products[0]?.quantity, "testing");
        res.render('cart/cart', { products, totalPrice, cartCount, subTotal })
    })

}

exports.addToCartView = (req, res, next) => {

    userId = req.session.user?._id
    proId = req.params.id
    console.log(proId, "nnnnnnnnnnnnnnn");
    if (userId) {
        cartHelper.addToCart(userId, proId).then(() => {
            res.json([{ status: true }])
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

exports.checkOut =async (req, res) => {
    let subTotal = await cartHelper.getSubTotal(userId)
    subTotal = subTotal[0]?.subTotal
    let totalPrice = await cartHelper.getTotalAmount(userId)
    totalPrice = totalPrice[0]?.total
    let userCart= req.session.userCart
    console.log(subTotal,userCart);
    res.render('cart/checkout',{subTotal,totalPrice,userCart})


}

