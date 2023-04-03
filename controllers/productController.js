const product = require('../models/products');
var userHelper = require('../server/helpers/user-helpers');
let shopCategory

exports.productView = (req, res) => {
    userHelper.doViewProducts().then(productData => {
        console.log(productData, "//////////////////viewproduct///////////////////////");
        res.render('users/products', { productData })
    })

}


exports.productDetail = (req, res) => {
    userHelper.doProductDetails(req.params.id).then(({productdata,allProduct}) => {
       let products=productdata[0]
        console.log(allProduct, "////////////////////products/////////////");
        res.render("users/product_details", { products,allProduct })
    })

}
exports.shopView = async (req, res) => {


       if (shopCategory) {

            let productData = shopCategory

            res.render('users/shop', { productData })
            shopCategory = undefined

        } {
            userHelper.doViewProducts().then(productData => {
                console.log(productData, "//////////////////viewproduct///////////////////////");
                res.render('users/shop', { productData })
            })
        } 
  

}

exports.shopCategory = (req, res) => {
    console.log(req.body);
    let categorys = req.body.category
    if (categorys == 'men') {

        userHelper.getMenProduct().then(response => {

            shopCategory = response
            res.json({ status: true })
            console.log(shopCategory);

        })
    } else if (categorys == 'women') {
        userHelper.getWomenProduct().then(response => {

            shopCategory = response
            res.json({ status: true })
            console.log(shopCategory);

        })
    } else if (categorys == 'sports') {
        userHelper.getSportsProduct().then(response => {

            shopCategory = response
            res.json({ status: true })
            console.log(shopCategory);

        })
    } else if (categorys == 'all') {
        userHelper.doViewProducts().then(response => {

            shopCategory = response
            res.json({ status: true })
            console.log(shopCategory);

        })
    }

}