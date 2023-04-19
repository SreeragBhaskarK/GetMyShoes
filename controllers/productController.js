const { response } = require('express');
const product = require('../models/products');
var userHelper = require('../server/helpers/user-helpers');
let shopCategory

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
    userHelper.doProductDetails(id).then(({ productdata, allProduct }) => {
        let products = productdata
        res.render("users/product_details", { products, allProduct })
    }).catch((error) => {
        console.log(error), '////////////';
    })

}
exports.shopView = async (req, res) => {

    console.log(shopCategory, '................');
    if (shopCategory) {
        console.log(shopCategory, '......if.........');
        let productData = shopCategory
        console.log(productData, '11111111111111111111111111');
        res.render('users/shop', { productData })
        shopCategory = undefined

    } {
        let pageNum = req.query.page
        userHelper.doViewProducts(pageNum).then((response) => {
            productData = response.productsView
            totalPages = response.totalPages
            console.log(productData, '222222222222222222222222');
            res.render('users/shop', { productData, totalPages })
        })
    }


}

exports.shopCategory = (req, res) => {

    let categorys = req.body.category
    console.log(categorys);
    let pageNum
    userHelper.getCategoryProduct(pageNum, categorys).then(response => {



        res.send(response)


    })


}