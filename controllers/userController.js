
var userHelper = require('../server/helpers/user-helpers');
var authHelper = require('../server/helpers/authHelper');
const generateToken = require("../server/util/createToken");
const user = require('../models/user');

exports.userView = (req, res) => {
    res.render('users/index')
}
exports.logInView = (req, res) => {
    let message = req.query.message
    res.render('users/login', { noShow: true, noLayout: true, message })

}

exports.logInData = (req, res) => {
    authHelper.doPhoneNumberLogin(req.body).then(response => {
        console.log(response, "testing");
        if (response.result === 0) {
            let message = "don't have an account sign up"
            res.redirect('/login?message=' + message)
        } else if (response.result === -1) {
            let message = "this account is blocked"
            res.redirect('/login?message=' + message)
        } else {
            res.redirect('/verify?number=' + response.result)
        }
    })

}

exports.sigUpView = (req, res) => {
    console.log(req.query.message, '/////////');
    if (req.query.message) {
        let message = req.query.message
        res.render('users/signup', { noShow: true, noLayout: true, message })
    } else {

        res.render('users/signup', { noShow: true, noLayout: true })
    }


}
exports.signUpData = (req, res) => {
    authHelper.doPhoneNumberSignUp(req.body).then(responese => {
        if (responese) {
            res.redirect('/verify?number=' + responese)
        } else {
            res.redirect('/signUp?message=An account is already registered')
        }
    })

}

exports.verifyView = (req, res) => {
    let number = req.query.number
    res.render("users/verify", { noShow: true, number, noLayout: true })

}
exports.verifyData = (req, res) => {
    authHelper.doVerifyOtp(req.body).then(response => {

        if (response.validOTP) {

            req.session.user = response
            req.session.user.validOTP = null
            req.session.userLoggedIn = true
            res.redirect('/')
        } else {
            res.redirect('/verify?number=' + response.phone_number)
        }
    })

}


exports.logoutView = (req, res) => {

    req.session.user = false
    res.redirect('/')
}

/* settings */
exports.settingsView = async(req, res) => {
    let phoneNumber = req.session.user?.phone
    let users = await user.findOne({phone:phoneNumber})
    console.log(users,'//////////');
    res.render('users/settings', { noLayout: true ,users})

}
exports.resetPasswordView = (req, res) => {
    res.render('users/reset_password', { noLayout: true })

}
exports.resetPasswordData = (req, res) => {

    userHelper.sendOtpEmail(req.body).then((response) => {
        if (response.port === 200) {
          req.session.otpemail = response.email
          req.session.resettoken = response.token
          res.redirect('/verify?token=' + response.token)
        } else {
          res.status(400).send(response.message)
        }
    
      })
}
exports.setPasswordView = (req, res) => {
    res.render('users/set_password', { noLayout: true })
}
exports.setPasswordData = (req, res) => {
    let email = req.session.otpemail
  userHelper.updataPassword(email, req.body).then((response) => {
    if (response.port == 200) {

      res.redirect('/')
    } else {
      res.redirect('/set_password?token=' + req.session.resettoken)
    }
  })
}

exports.profileInfoData=(req,res)=>{

    let phone=req.session.user.phone
    userHelper.doProfile(req.body,phone).then(response=>{
        req.session.user=response
    })
}

exports.menCategoryView = (req,res)=>{
    userHelper.getMenProduct().then(responses=>{
      
        let menProduct = responses
        res.render('category/men',{menProduct})
    })
  
}

exports.womenCategoryView = (req,res)=>{
    userHelper.getWomenProduct().then(responese=>{
        let womenProduct = responese
        res.render('category/women',{womenProduct})
    })
  
}

exports.sportsCategoryView = (req,res)=>{
    userHelper.getSportsProduct().then(responese=>{
        let sportsProduct = responese
        res.render('category/sports',{sportsProduct})
    })
  
}

