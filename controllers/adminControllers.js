const category = require('../models/category');
var adminHelper = require('../server/helpers/admin-helpers');
var productHelper = require('../server/helpers/product-helper');
let {imageUpdate}= require('../server/middleware/multer')
let editView
let editCategory
exports.adminView = (req, res) => {

    res.render('admin/admin_Dashboard', { admin: true, activeDashboard: 'active' })

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

        console.log(userData.status, "kdjfk");
        res.render('admin/users', { admin: true, activeUser: 'active', userData })
    })



}
exports.logoutView = (req, res) => {
    req.session.adminLoggedIn = false
    res.redirect('/admin/login')
}


exports.layoutView = (req, res) => {

    res.render('admin/layout', { admin: true, activeLayout: 'active' })

}
exports.productsView = (req, res) => {


    productHelper.doViewProducts().then((response) => {

        productData = response.products
        categoryView = response.categorys

        if (editView) {
            
            adminHelper.doCategorys(editView).then((categroys) => {
               
                res.render('admin/products', { admin: true, activeProducts: 'active', productData, editView, categoryView, categroys })
                editView = false
            })

        } else {
            
            res.render('admin/products', { admin: true, activeProducts: 'active', productData })
        }
    })

}
exports.productsData = (req, res) => {


    productHelper.doAddProduct(req.body, req.files).then(response => {
        console.log(response, "kdfkdjkfj");
        if (response.port === 200) {

            res.redirect('/admin/products')
        } else {
            res.status(400).send(response.message)
        }


    })


}
exports.deleteProductView = (req, res) => {
    let proId = req.params.id
    console.log(proId);
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
    console.log(req.files);
    let proId = req.params.id
   
    productHelper.doUpdateProduct(proId, req.body).then(response => {
        /* if (req.files) {
            let image = req.files.Image
            image.mv("./public/product-images/" + id + '.jpg')

        } */
        res.redirect('/admin/products')
    })
}
exports.deleteUserView = (req, res) => {
    let proId = req.params.id
    console.log(proId);
    adminHelper.doUserDelete(proId).then(response => {
        req.session.user = false
        res.redirect('/admin/users')

    })
}
exports.userStatusView = (req, res) => {
    let proId = req.params.id
    console.log(proId);
    adminHelper.doUserStatus(proId).then(response => {

        req.session.user = false
        res.redirect('/admin/users')
    })
}
exports.userStatusUnblockView = (req, res) => {
    let proId = req.params.id
    console.log(proId);
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
            res.render('admin/category', { admin: true, categorys, edCategory })
            editCategory = null
        } else {
            res.render('admin/category', { admin: true, categorys })

        }
        res.render('admin/category', { admin: true, categorys })
    })
}
exports.categoryData = (req, res) => {
    console.log(req.body, "body");
    adminHelper.doCategory(req.body).then(() => {
        res.redirect('/admin/category')
    })
}
exports.deleteCateagoryView = (req, res) => {
    let proId = req.params.id
    console.log(proId, "kdfk////////////////////////////////////");
    adminHelper.doCategoryDelete(proId).then(response => {
        res.redirect('/admin/category')
    })
}
exports.editCategoryView = (req, res) => {
    let proId = req.params.id
    adminHelper.doCategoryEdit(proId).then(response => {
        editCategory = response
        console.log(editCategory.category, "kdfjkd")
        res.redirect('/admin/category')
    })
}
exports.updateCategoryView = (req, res) => {
    let proId = req.params.id
    adminHelper.doCategoryUpdate(proId, req.body).then(response => {

        res.redirect('/admin/category')
    })
}


