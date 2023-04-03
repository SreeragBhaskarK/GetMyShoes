var express = require('express');
var router = express.Router();
const { verify, verifyLogin } = require("../server/middleware/session_user")
const { userView,logInView,logInData,sigUpView,signUpData,verifyView,verifyData
  ,logoutView,settingsView,resetPasswordView,resetPasswordData
,setPasswordView,setPasswordData,profileInfoData,menCategoryView,womenCategoryView,sportsCategoryView,profileInfoAdrsData} = require("../controllers/userController")

const auth= require("../server/middleware/auth")


router.get('/', userView)

router.get('/login',verifyLogin, logInView)
router.post('/login', logInData)

router.get('/signup',verifyLogin, sigUpView)
router.post('/signup', signUpData)

router.get('/verify', verifyLogin,verifyView)
router.post('/verify', verifyData)

router.get('/logout',logoutView)

router.get('/settings', settingsView) 

router.post('/profile_info', profileInfoData) 
router.post('/profile_info_adrs', profileInfoAdrsData) 

router.get('/reset_password', resetPasswordView) 
router.post('/reset_password',resetPasswordData) 

router.get('/set_password',setPasswordView) 
router.post('/set_password', setPasswordData)

router.get('/men', menCategoryView)
router.get('/women', womenCategoryView)
router.get('/sports', sportsCategoryView)


module.exports = router;





