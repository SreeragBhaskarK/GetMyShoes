
const product = require('../models/products');
var userHelper = require('../server/helpers/user-helpers');
var productHelper = require('../server/helpers/product-helper');

exports.productView = (req, res) => {
    let pageNum = req.query.page
    userHelper.doViewProducts(pageNum).then(response => {
        productData = response.productsView
        totalPages = response.totalPages
        res.render('users/products', { productData, totalPages })
    })

}


exports.productDetail = (req, res) => {
    const mongoose = require('mongoose');
    let id = new mongoose.Types.ObjectId(req.params.id.trim());
    let userId =0
    if (req.session.userLoggedIn) {
         userId = req.session?.user._id
    }else{
         userId =1
    }
    userHelper.doProductDetails(id,userId).then(({ productdata, allProduct, productcartCheck }) => {
        let products = productdata

        if (productcartCheck) {
            res.render("users/product_details", { products, allProduct ,productcartCheck})
        } else {

            res.render("users/product_details", { products, allProduct })
        }
    }).catch((error) => {
   
    })

}
exports.shopView = async (req, res) => {


    let pageNum = req.query.page
    userHelper.doViewProducts(pageNum).then(async (response) => {
        productData = response.productsView
        totalPages = response.totalPages
        let parentCateagory = await userHelper.GetParentCategory()
        let brandCateagory = await userHelper.GetBrandCategory()
        let subCateagory = await userHelper.GetSubCategory()
    
        res.render('users/shop', { productData, totalPages, parentCateagory, brandCateagory, subCateagory })
    })



}

exports.shopCategory = (req, res) => {

    let categorys = req.body.category

    let pageNum
    userHelper.getCategoryProduct(pageNum, categorys).then(response => {
        res.send(response)


    })


}
exports.shopPriceFilter = (req, res) => {
    try {
        productHelper.priceFilter(req.body).then(response => {
            let priceFilter = response.filterProducts
            res.send(priceFilter)
        })

    }
    catch (e) {
   
    }

}

exports.brandProducts = (req, res) => {
    try {
        productHelper.brandProducts(req.body).then(response => {
            let brandProducts = response[0]
            res.send(brandProducts)

        })
    } catch (e) {

    }
}
exports.allBrandProducts = (req, res) => {
    try {
        productHelper.allBrandProducts().then(response => {
            let brandProducts = response
            res.send(brandProducts)

        })
    } catch (e) {

    }
}