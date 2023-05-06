const category = require('../models/category');
var adminHelper = require('../server/helpers/admin-helpers');
const { resetUserPassword } = require('../server/helpers/controller');
var productHelper = require('../server/helpers/product-helper');
let { imageUpdate } = require('../server/middleware/multer')
const pdf = require('html-pdf');
var path = require('path');
const fs = require('fs');
exports.admin = (req, res, next) => {
    res.locals.admin = true

    next()
}
exports.adminView = (req, res) => {
    adminHelper.doDashboard().then((response) => {
        let States = response.States
        let orderCount = response.orderCount
        let percentageChange = response.percentageChange
        console.log(typeof percentageChange, percentageChange);
        let revenueWeek = response.revenueWeek?.toLocaleString('en-IN');
        let revenuepercentage = response.revenuepercentage
        let totalAmountByMonth = response.totalAmountByMonth
        let incomeWeek = response.incomeWeek?.toLocaleString('en-IN');
        let incomepercentage = response.incomepercentage
        let totalMonthOrder = response.totalMonthOrder
        let totalIncomeByMonth = response.totalIncomeByMonth
        let totalUsersByWeek = response.weekUsers
        console.log(totalUsersByWeek);
        res.render('admin/admin_Dashboard', { activeDashboard: 'active', States, orderCount, percentageChange, revenueWeek, revenuepercentage, totalAmountByMonth, incomeWeek, incomepercentage, totalMonthOrder, totalIncomeByMonth, totalUsersByWeek })
    })


}
exports.loginView = (req, res) => {

    res.render('admin/login', { noShow: true, noLayout: true })

}

exports.loginData = (req, res) => {
    adminHelper.doLogIn(req.body).then(response => {

        if (response.port === 200) {
            /* res.status(200).json(response.result) */
            req.session.adminLoggedIn = true

            res.redirect('/admin')
        } else {
            res.redirect('/admin/login')
            /*  res.status(400).send(response.message) */
        }
    })
}
exports.userView = (req, res) => {

    adminHelper.doViewUsers().then(userData => {


        res.render('admin/users', { activeUser: 'active', userData })
    })



}
exports.logoutView = (req, res) => {
    req.session.adminLoggedIn = false
    res.redirect('/admin/login')
}


exports.bannersView =async (req, res) => {
    let banners = await adminHelper.getBanner()
    console.log();
    res.render('admin/banners', { activeBanners: 'active' ,banners})

}
exports.productsView = (req, res) => {


    productHelper.doViewProducts().then((response) => {

        productData = response.products
        categoryView = response.categorys



        res.render('admin/products', { activeProducts: 'active', productData })

    })

}
exports.productsData = (req, res) => {

    console.log(req.files);
    productHelper.doAddProduct(req.body, req.files).then(response => {

        if (response.port === 200) {

            res.redirect('/admin/products')
        } else {
            res.status(400).send(response.message)
        }


    })


}
exports.deleteProductView = (req, res) => {
    let proId = req.params.id

    productHelper.doProductDelete(proId).then(response => {
        res.redirect('/admin/products')
    })
}
exports.deleteCouponView = (req, res) => {
    let couponId = req.params.id

    productHelper.doCouponDelete(couponId).then(response => {
        res.redirect('/admin/coupons')
    })
}
exports.restoreCouponView = (req, res) => {
    let couponId = req.params.id

    productHelper.doCouponRestore(couponId).then(response => {
        res.redirect('/admin/coupons')
    })
}
exports.editProductView = (req, res) => {
    let proId = req.params.id
    productHelper.doProductEdit(proId).then(response => {
        let productEdit = response[0]
        res.send(productEdit)
    })
}
exports.editCouponView = (req, res) => {
    let couponId = req.params.id
    productHelper.doCouponEdit(couponId).then(response => {
        let couponData = response
        res.send(couponData)
    })
}
exports.updataProductData = async (req, res) => {

    let proId = req.body.product_id

    productHelper.doUpdateProduct(proId, req.body, req.files).then(response => {
        /* if (req.files) {
            let image = req.files.Image
            image.mv("./public/product-images/" + id + '.jpg')

        } */
        res.redirect('/admin/products')
    })
}
exports.deleteUserView = (req, res) => {
    let proId = req.params.id

    adminHelper.doUserDelete(proId).then(response => {
        req.session.user = false
        res.redirect('/admin/users')

    })
}
exports.userStatusView = (req, res) => {
    let proId = req.params.id

    adminHelper.doUserStatus(proId).then(response => {

        req.session.user = false
        res.redirect('/admin/users')
    })
}
exports.userStatusUnblockView = (req, res) => {
    let proId = req.params.id

    adminHelper.doUserUnblock(proId).then(response => {
        req.session.user = false
        res.redirect('/admin/users')
    })
}
exports.categoryView = (req, res) => {
    adminHelper.doViewCategory().then((response) => {
        let categorys = response.categorys
        /*   if (editCategory) {
              let edCategory = editCategory
              res.render('admin/category', { categorys, edCategory, activeCategories: 'active' })
              editCategory = null */
        /*  } else { */
        res.render('admin/category', { categorys, activeCategories: 'active' })
        /* 
                } */

    })
}
exports.categoryData = (req, res) => {

    adminHelper.doCategory(req.body).then(() => {
        res.redirect('/admin/category')
    })
}
exports.deleteCateagoryView = (req, res) => {
    let categoryId = req.params.id

    adminHelper.doCategoryDelete(categoryId).then(response => {
        res.redirect('/admin/category')
    })
}
exports.editCategoryView = (req, res) => {
    let categoryId = req.params.id
    adminHelper.doCategoryEdit(categoryId).then(response => {
        let categoryData = response[0]
        console.log(categoryData);
        res.send(categoryData)
    })
}
exports.updateCategoryView = (req, res) => {
    let categoryId = req.body.category_id
    adminHelper.doCategoryUpdate(categoryId, req.body).then(response => {

        res.redirect('/admin/category')
    })
}
exports.unListView = (req, res) => {

    adminHelper.doUnlist().then(response => {
        let unListProduct = response

        res.render('admin/unlist', { unListProduct, activeUnlists: 'active' })
    })
}
exports.restoreProductView = (req, res) => {
    let id = req.params.id
    adminHelper.doRestoreProduct(id).then(response => {
        res.redirect('/admin/unlist')
    })
}
exports.unlistDeleteProductView = (req, res) => {
    let id = req.params.id
    adminHelper.doDeleteProduct(id).then(response => {

        res.redirect('/admin/unlist')
    })
}
exports.orders = (req, res) => {
    adminHelper.getOrder().then((response) => {
        let orders = response
        res.render('admin/orders', { activeOrders: 'active', orders })
    })


},
    exports.coupons = (req, res) => {
        adminHelper.getCopons().then((coupons) => {

            res.render('admin/coupons', { activeCoupons: 'active', coupons })
        })


    }
exports.couponsGenerate = (req, res) => {
    console.log(req.body);
    adminHelper.generateCoupon(req.body).then(() => {

        res.redirect('/admin/coupons')
    })


}
exports.saleByStateMonth = (req, res) => {

    adminHelper.doSalesByStateMonth(req.body).then((state) => {
        res.send(state)

    })


}
exports.totalRevenue = (req, res) => {

    adminHelper.dototalRevenue(req.body).then((totalRevenue) => {
        res.send(totalRevenue)

    })


}
exports.totalCategorySales = (req, res) => {

    adminHelper.doTotalCategorySales(req.body).then((totalCategorySales) => {
        res.send(totalRevenue)

    })


}

exports.couponUpdate = (req, res) => {
    adminHelper.doCouponUpdate(req.body).then(response => {
        res.redirect('/admin/coupons')
    })
}
exports.updateShippingStatus = (req, res) => {
    console.log(req.body);
    adminHelper.updateShippingStatus(req.body).then(response => {
        res.send()
        /* res.redirect('/admin/coupons') */
    })
}
exports.salesReport = (req, res) => {
    adminHelper.getSalesData().then(response => {
        let salesReport = response
        res.render('admin/sales_report', { activeSalesReport: 'active', salesReport })
    })
}
exports.salesReportExport = (req, res) => {


    try {

        let type = req.params.type
        if (type == 'pdf') {
            adminHelper.getSalesReportPDF().then(response => {
                let { ejsData, options } = response
                pdf.create(ejsData, options).toFile('sales_report.pdf', (err, response) => {
                    if (err) console.log(err);
                    let filePath = path.resolve(__dirname, '../sales_report.pdf')

                    fs.readFile(filePath, (err, file) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send('Could not download file')
                        }
                        console.log('file generated');
                        res.setHeader('Content-disposition', 'attachment; filename=sales_report.pdf');
                        res.setHeader('Content-type', 'application/pdf');

                        res.send(file)
                    })


                })
            })
        } else {

            adminHelper.getSalesReportExcel().then(response => {
                console.log('file generated');
                res.setHeader('Content-disposition', 'attachment; filename=sales_report.xlsx');
                res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.send(fs.readFileSync('sales_report.xlsx'));
            })

        }



    }
    catch (e) {
        console.log(e);
    }
}

exports.categoryNameCheck = (req, res) => {
    console.log(req.body);
    adminHelper.checkCategory(req.body).then(response => {
        res.status(200).json({status:response.status})
    })
    .catch(error=>{
        res.status(404).json({status:false,message:error.message})
    })
}

exports.banner = (req,res)=>{
    console.log(req.body);
    adminHelper.getBanner().then(response=>{
        console.log(response);
        res.status(200).send(response)
    }).catch(error=>{
        res.status(404).send(error.message)
    })
}

exports.updataBannerHeader = (req,res)=>{
    console.log(req.body,req.file,"kkkkkkk");
    adminHelper.updateBanner(req.body,req.file).then(response=>{
        console.log(response);
        res.redirect('/admin/banners')
    }).catch(error=>{
        res.redirect('/admin/banners')
    })
}
exports.updataBannerMain = (req,res)=>{
    console.log(req.body,);
    adminHelper.updateBannerMain(req.body,req.files).then(response=>{
        console.log(response);
        res.redirect('/admin/banners')
    }).catch(error=>{
        res.redirect('/admin/banners')
    })
}
exports.updataBannerSpecial = (req,res)=>{
    console.log(req.body,req.file);
    adminHelper.updateBannerSpecial(req.body,req.file).then(response=>{
        console.log(response);
        res.redirect('/admin/banners')
    }).catch(error=>{
        res.redirect('/admin/banners')
    })
}




