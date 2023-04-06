var express = require('express');
var router = express.Router();
const { verify, verifyLogin } = require("../server/middleware/session_user")
const { userView,logInView,logInData,sigUpView,signUpData,verifyView,verifyData
  ,logoutView,settingsView,resetPasswordView,resetPasswordData
,setPasswordView,setPasswordData,profileInfoData,menCategoryView,womenCategoryView,
sportsCategoryView,profileInfoAdrsData,emailVerificationView,verifyEmailView,verifyEmailData,
logInEmailView,changePasswordData,cartCount} = require("../controllers/userController")

const auth= require("../server/middleware/auth")

router.use(cartCount)
router.get('/', userView)

router.get('/login',verifyLogin, logInView)
router.get('/loginemail',verifyLogin, logInEmailView)
router.post('/login', logInData)

router.get('/signup',verifyLogin, sigUpView)
router.post('/signup', signUpData)

router.get('/verify', verifyLogin,verifyView)
router.post('/verify', verifyData)

router.get('/logout',logoutView)

router.get('/settings',verify, settingsView) 
router.post('/emailverification',verify, emailVerificationView) 

router.post('/profile_info', profileInfoData) 
router.post('/profile_info_adrs', profileInfoAdrsData) 

router.get('/reset_password', resetPasswordView) 
router.post('/reset_password',resetPasswordData) 

router.get('/set_password',auth,setPasswordView) 
router.post('/set_password', setPasswordData)

router.get('/men', menCategoryView)
router.get('/women', womenCategoryView)
router.get('/sports', sportsCategoryView)

router.get('/verifyemail',verifyEmailView)
router.post('/verifyemail', verifyEmailData)
router.post('/change-password', changePasswordData)





module.exports = router;





