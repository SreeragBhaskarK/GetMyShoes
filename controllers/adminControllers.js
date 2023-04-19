const category = require('../models/category');
var adminHelper = require('../server/helpers/admin-helpers');
const { resetUserPassword } = require('../server/helpers/controller');
var productHelper = require('../server/helpers/product-helper');
let { imageUpdate } = require('../server/middleware/multer')
let editView
let editCategory
exports.admin = (req, res, next) => {
    res.locals.admin = true
    next()
}
exports.adminView = (req, res) => {
    adminHelper.doDashboard().then((response) => {
        let States = response.States
        let orderCount = response.orderCount
        let percentageChange = response.percentageChange
        let revenueWeek = response.revenueWeek.toLocaleString('en-IN');
        let revenuepercentage = response.revenuepercentage
        let totalAmountByMonth = response.totalAmountByMonth
        let incomeWeek = response.incomeWeek.toLocaleString('en-IN');
        let incomepercentage = response.incomepercentage
        let totalMonthOrder = response.totalMonthOrder
        let totalIncomeByMonth = response.totalIncomeByMonth
        res.render('admin/admin_Dashboard', { activeDashboard: 'active', States, orderCount, percentageChange, revenueWeek, revenuepercentage, totalAmountByMonth,incomeWeek,incomepercentage,totalMonthOrder,totalIncomeByMonth })
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


exports.layoutView = (req, res) => {

    res.render('admin/layout', { activeLayout: 'active' })

}
exports.productsView = (req, res) => {


    productHelper.doViewProducts().then((response) => {

        productData = response.products
        categoryView = response.categorys

        if (editView) {

            adminHelper.doCategorys(editView).then((categroys) => {

                res.render('admin/products', { activeProducts: 'active', productData, editView, categoryView, categroys })
                editView = false
            })

        } else {

            res.render('admin/products', { activeProducts: 'active', productData })
        }
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
exports.editProductView = (req, res) => {
    let proId = req.params.id
    productHelper.doProductEdit(proId).then(response => {
        editView = response
        res.redirect('/admin/products')
    })
}
exports.updataProductData = async (req, res) => {

    let proId = req.params.id

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
        if (editCategory) {
            let edCategory = editCategory
            res.render('admin/category', { categorys, edCategory, activeCategories: 'active' })
            editCategory = null
        } else {
            res.render('admin/category', { categorys, activeCategories: 'active' })

        }

    })
}
exports.categoryData = (req, res) => {

    adminHelper.doCategory(req.body).then(() => {
        res.redirect('/admin/category')
    })
}
exports.deleteCateagoryView = (req, res) => {
    let proId = req.params.id

    adminHelper.doCategoryDelete(proId).then(response => {
        res.redirect('/admin/category')
    })
}
exports.editCategoryView = (req, res) => {
    let proId = req.params.id
    adminHelper.doCategoryEdit(proId).then(response => {
        editCategory = response

        res.redirect('/admin/category')
    })
}
exports.updateCategoryView = (req, res) => {
    let proId = req.params.id
    adminHelper.doCategoryUpdate(proId, req.body).then(response => {

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




