var express = require('express');
var router = express.Router();
const { verifyAdmin } = require("../server/middleware/session_user")
const upload = require('../server/middleware/multer')
const { adminView, loginView, loginData, userView, logoutView, layoutView,productsView,productsData,deleteProductView ,editProductView
,updataProductData,deleteUserView,userStatusView,userStatusUnblockView,categoryView,categoryData,deleteCateagoryView,updateCategoryView,
editCategoryView,unListView,restoreProductView,unlistDeleteProductView,orders,admin,coupons,couponsGenerate,saleByStateMonth,totalRevenue,
totalCategorySales,deleteCouponView,restoreCouponView,editCouponView,couponUpdate,updateShippingStatus,salesReport,salesReportExport} = require('../controllers/adminControllers')




router.use( admin)
router.get('/',verifyAdmin, adminView)

router.get('/login', loginView)
router.post('/login', loginData)

router.get('/users',verifyAdmin, userView)

router.get('/logout',verifyAdmin, logoutView)


router.get('/layout', verifyAdmin,layoutView)

router.get('/products',verifyAdmin, productsView)



router.post('/products', upload.array('product_image', 4), productsData)

router.get('/delete-product/:id',verifyAdmin, deleteProductView)
router.get('/delete-coupon/:id',verifyAdmin, deleteCouponView)
router.get('/restore-coupon/:id',verifyAdmin, restoreCouponView)

router.get('/edit-product/:id',verifyAdmin, editProductView)
router.get('/edit-coupon/:id',verifyAdmin, editCouponView)
router.post('/updataProduct', upload.array('product_image', 4), updataProductData)

router.get('/delete_user/:id',verifyAdmin, deleteUserView)
router.get('/status_user/:id',verifyAdmin, userStatusView)

router.get('/status_user_unblock/:id',verifyAdmin, userStatusUnblockView)

router.get('/category',verifyAdmin, categoryView)

router.post('/category', categoryData)

router.get('/delete-category/:id',verifyAdmin, deleteCateagoryView)

router.get('/edit-category/:id',verifyAdmin, editCategoryView)

router.post('/category_update', updateCategoryView)

router.get('/unlist',verifyAdmin, unListView)

router.get('/restore-product/:id',verifyAdmin, restoreProductView)
router.get('/unlistdelete-product/:id',verifyAdmin, unlistDeleteProductView)
router.get('/orders',verifyAdmin, orders)
router.get('/coupons',verifyAdmin, coupons)
router.post('/coupons',verifyAdmin, couponsGenerate)
router.post('/salesbystate',verifyAdmin, saleByStateMonth)
router.post('/totalrevenue',verifyAdmin, totalRevenue)
router.post('/totalcategorysales',verifyAdmin, totalCategorySales)
router.post('/coupon_update',verifyAdmin,couponUpdate)
router.post('/update_shipping_status',verifyAdmin,updateShippingStatus)
router.get('/sales_report',verifyAdmin,salesReport)
router.get('/sales_report_export/:type',verifyAdmin,salesReportExport)



    
module.exports = router;