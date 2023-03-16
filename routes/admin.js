const { response } = require('express');
var express = require('express');
var router = express.Router();
var adminHelper = require('../server/helpers/admin-helpers');
const admin = require('../server/models/admin');
let editView


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
           
            console.log(userData.status,"kdjfk");
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

        adminHelper.doViewProducts().then(productData => {
            console.log(productData);
            if (editView) {
                console.log("kdfjd");
                res.render('admin/products', { admin: true, activeProducts: 'active', productData, editView })
                editView = false
            } else {
                res.render('admin/products', { admin: true, activeProducts: 'active', productData })
            }
        })
    } else {
        res.redirect('/admin/login')
    }
})

router.post('/products', (req, res) => {
    console.log(req.body);
    adminHelper.doAddProduct(req.body).then(response => {
       console.log(response,"kdfkdjkfj");
        if (response.port === 200) {
            if (req.files) {
                console.log(response.data,"djfkjdkf");
                let image = req.files.product_image
                image.mv("./public/images/products_image/" + response.data + '.jpg', (err) => {
    
                    if (!err) {
                        res.redirect('/admin/products')
                    }
                })
            }else{

                res.redirect('/admin/products')
            }
            /* res.status(200).json(response.result) */
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

router.get('/delete_user/:id', (req, res) => {
    let proId = req.params.id
    console.log(proId);
    adminHelper.doUserDelete(proId).then(response => {
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
        status=response.status
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
     
      res.redirect('/admin/users')
    })
    /*  productHelper.deleteProduct(proId).then((response) => {
       res.redirect('/admin')
     }) */
  
  })
module.exports = router;