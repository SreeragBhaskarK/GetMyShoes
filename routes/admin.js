const { response } = require('express');
var express = require('express');
var router = express.Router();
var adminHelper = require('../server/helpers/admin-helpers');
const admin = require('../server/models/admin');
const upload = require('../server/middleware/multer')

let editView
let editCategory


router.get('/', (req, res) => {
    if (req.session.admin) {
        res.render('admin/admin_Dashboard', { admin: true, activeDashboard: 'active' })
    } else {
        res.redirect('/admin/login')
    }



})

router.get('/login', (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin')
    } else {
        res.render('admin/login', { noShow: true, noLayout: true })
    }
})

router.post('/login', (req, res) => {
    adminHelper.doLogIn(req.body).then(response => {

        if (response.port === 200) {
            /* res.status(200).json(response.result) */
            req.session.admin = true
            res.redirect('/admin')
        } else {
            res.redirect('/admin/login')
            /*  res.status(400).send(response.message) */
        }
    })

})

router.get('/users', (req, res) => {
    if (req.session.admin) {
        adminHelper.doViewUsers().then(userData => {

            console.log(userData.status, "kdjfk");
            res.render('admin/users', { admin: true, activeUser: 'active', userData })
        })

    } else {
        res.redirect('/admin/login')
    }


})

router.get('/logout', (req, res) => {
    /*     req.session.admin(function (err) {
            res.redirect('/admin/login');
        }); */
    req.session.admin = false
    res.redirect('/admin/login')
})


router.get('/layout', (req, res) => {
    if (req.session.admin) {
        res.render('admin/layout', { admin: true, activeLayout: 'active' })
    } else {
        res.redirect('/admin/login')
    }

})

router.get('/products', (req, res) => {

    if (req.session.admin) {

        adminHelper.doViewProducts().then((response) => {
          
            productData =response.productsView
            categoryView =response.category
            
            if (editView) {
                adminHelper.doCategoryIdChangeinName(editView.product_category).then((categroyName)=>{
                    console.log(categroyName,"/////////////////categroyName///////////////////")
                    res.render('admin/products', { admin: true, activeProducts: 'active', productData, editView,categoryView,categroyName })
                    editView = false
                })
            
            } else {
                console.log(categoryView,"kdddddddd")
                res.render('admin/products', { admin: true, activeProducts: 'active', productData})
            }
        })
    } else {
        res.redirect('/admin/login')
    }
})



router.post('/products', upload.array('product_image', 4), (req, res) => {
   
    adminHelper.doAddProduct(req.body, req.files).then(response => {
        console.log(response, "kdfkdjkfj");
        if (response.port === 200) {
            /*     if (req.files) {
                    console.log(response.insertedId, "djfkjdkf");
                    let image = req.files.product_image
                    image.mv("./public/images/products_image/" + response.data + '.jpg', (err) => {
    
                        if (!err) {
                            res.redirect('/admin/products')
                        }
                    })
                } else {
    
                    res.redirect('/admin/products')
                } */
            /* res.status(200).json(response.result) */
            res.redirect('/admin/products')
        } else {
            res.status(400).send(response.message)
        }


    })

})

router.get('/delete-product/:id', (req, res) => {


    let proId = req.params.id
    console.log(proId);
    adminHelper.doProductDelete(proId).then(response => {
        res.redirect('/admin/products')
    })
    /*  productHelper.deleteProduct(proId).then((response) => {
       res.redirect('/admin')
     }) */

})

router.get('/edit-product/:id', (req, res) => {
    let proId = req.params.id
    adminHelper.doProductEdit(proId).then(response => {
        editView = response
        res.redirect('/admin/products')
    })
})

router.post('/updataProduct/:id', (req, res) => {

    let proId = req.params.id
    adminHelper.doUpdateProduct(proId, req.body).then(response => {
        /* if (req.files) {
            let image = req.files.Image
            image.mv("./public/product-images/" + id + '.jpg')

        } */
        res.redirect('/admin/products')
    })
})

router.get('/delete_user/:id', (req, res) => {
    let proId = req.params.id
    console.log(proId);
    adminHelper.doUserDelete(proId).then(response => {
        req.session.user = false
        res.redirect('/admin/users')

    })
    /*  productHelper.deleteProduct(proId).then((response) => {
       res.redirect('/admin')
     }) */

})
router.get('/status_user/:id', (req, res) => {
    let proId = req.params.id
    console.log(proId);
    adminHelper.doUserStatus(proId).then(response => {

        req.session.user = false
        res.redirect('/admin/users')
    })
    /*  productHelper.deleteProduct(proId).then((response) => {
       res.redirect('/admin')
     }) */

})

router.get('/status_user_unblock/:id', (req, res) => {
    let proId = req.params.id
    console.log(proId);
    adminHelper.doUserUnblock(proId).then(response => {
        req.session.user = false
        res.redirect('/admin/users')
    })
    /*  productHelper.deleteProduct(proId).then((response) => {
       res.redirect('/admin')
     }) */

})

router.get('/category', (req, res) => {
    adminHelper.doViewCategory().then((response) => {
        let categorys = response.category
        if(editCategory){
           let edCategory = editCategory
            res.render('admin/category', { admin: true, categorys,edCategory})
            editCategory = null
        }else{
            res.render('admin/category', { admin: true, categorys })

        }
        res.render('admin/category', { admin: true, categorys })
    })
})

router.post('/category', (req, res) => {
    console.log(req.body, "body");
    adminHelper.doCategory(req.body).then(() => {
            res.redirect('/admin/category')
    })
})

router.get('/delete-category/:id', (req, res) => {
    let proId = req.params.id
    console.log(proId, "kdfk////////////////////////////////////");
    adminHelper.doCategoryDelete(proId).then(response => {
        res.redirect('/admin/category')
    })
    /*  productHelper.deleteProduct(proId).then((response) => {
       res.redirect('/admin')
     }) */

})

router.get('/edit-category/:id', (req, res) => {
    let proId = req.params.id
    adminHelper.doCategoryEdit(proId).then(response => {
        editCategory = response
        console.log(editCategory.category,"kdfjkd")
        res.redirect('/admin/category')
    })
})

router.post('/category_update/:id',(req,res)=>{
    let proId = req.params.id
    adminHelper.doCategoryUpdate(proId,req.body).then(response => {
    
        res.redirect('/admin/category')
    })
})



module.exports = router;