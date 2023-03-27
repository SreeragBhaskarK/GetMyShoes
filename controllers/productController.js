var userHelper = require('../server/helpers/user-helpers');


exports.productView = (req, res) => {
    userHelper.doViewProducts().then(productData => {
        console.log(productData, "//////////////////viewproduct///////////////////////");
        res.render('users/products', { productData })
    })

}


exports.productDetail = (req, res) => {
    userHelper.doProductDetails(req.params.id).then((products) => {
        console.log(products[0].product_name, "////////////////////products/////////////");
        res.render("users/product_details", { products })
    })

}
exports.shopView = (req, res) => {

    res.render('users/shop')
}