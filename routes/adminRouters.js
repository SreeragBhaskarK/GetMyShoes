var express = require('express');
var router = express.Router();
const { verifyAdmin } = require("../server/middleware/session_user")
const upload = require('../server/middleware/multer')
const { adminView, loginView, loginData, userView, logoutView, layoutView,productsView,productsData,deleteProductView ,editProductView
,updataProductData,deleteUserView,userStatusView,userStatusUnblockView,categoryView,categoryData,deleteCateagoryView,menCategoryView,updateCategoryView,editCategoryView} = require('../controllers/adminControllers')




router.get('/', adminView)

router.get('/login', loginView)
router.post('/login', loginData)

router.get('/users', userView)

router.get('/logout', logoutView)


router.get('/layout', layoutView)

router.get('/products', productsView)



router.post('/products', upload.array('product_image', 4), productsData)

router.get('/delete-product/:id', deleteProductView)
router.get('/edit-product/:id', editProductView)
router.post('/updataProduct/:id', updataProductData)

router.get('/delete_user/:id', deleteUserView)
router.get('/status_user/:id', userStatusView)

router.get('/status_user_unblock/:id', userStatusUnblockView)

router.get('/category', categoryView)

router.post('/category', categoryData)

router.get('/delete-category/:id', deleteCateagoryView)

router.get('/edit-category/:id', editCategoryView)

router.post('/category_update/:id', updateCategoryView)




module.exports = router;