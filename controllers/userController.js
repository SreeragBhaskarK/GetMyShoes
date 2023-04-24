
var userHelper = require('../server/helpers/user-helpers');
var authHelper = require('../server/helpers/authHelper');
const generateToken = require("../server/util/createToken");
const user = require('../models/user');
const product = require('../models/products');
const cartHelper = require('../server/helpers/cart-helper');
const { hashData } = require('../server/util/hashData');
const productHelper = require('../server/helpers/product-helper');

exports.userView = (req, res) => {
    userHelper.getBrandProducts().then(async(response) => {
        let brandProducts = response
       
       let brands = await userHelper.getBrands()
       let newSpecial = await productHelper.getNewSpecial()
       console.log(newSpecial);
        res.render('users/index',{brandProducts,brands,newSpecial})
    })

}
exports.logInView = (req, res) => {
    let message = req.query.message
    res.render('users/login', { noShow: true, noLayout: true, message })

}
exports.logInEmailView = (req, res) => {
    let message = req.query.message
    res.render('users/email_login', { noShow: true, noLayout: true, message })

}

exports.logInData = (req, res) => {
    if (req.body.email) {

        authHelper.doLogIn(req.body).then(response => {
            if (response.result) {
                req.session.user = response.userView
                req.session.userLoggedIn = true
                res.redirect('/')
            } else {
                res.redirect('/loginemail?message=' + response.message)
            }
        })
    } else {
        authHelper.doPhoneNumberLogin(req.body).then(response => {

            if (response.result === 0) {
                let message = "don't have an account sign up"
                res.redirect('/login?message=' + message)
            } else if (response.result === -1) {
                let message = "this account is blocked"
                res.redirect('/login?message=' + message)
            } else if (response.result === 1) {
                res.redirect('/verify?number=' + response.phone_number)
            }
        })
    }


}

exports.sigUpView = (req, res) => {

    if (req.query.message) {
        let message = req.query.message
        res.render('users/signup', { noShow: true, noLayout: true, message })
    } else {

        res.render('users/signup', { noShow: true, noLayout: true })
    }


}
exports.signUpData = (req, res) => {
    req.session.phone = req.body.number
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
    let phone = req.session.phone
    authHelper.doVerifyOtp(req.body).then(response => {

        if (response.validOTP) {

            req.session.user = response
            req.session.user.validOTP = null
            req.session.userLoggedIn = true
            res.redirect('/')
        } else {
            res.redirect('/verify?number=' + response.phone)
        }
    })

}



exports.logoutView = (req, res) => {

    req.session.userLoggedIn = false
    res.redirect('/')
}

/* settings */
exports.settingsView = async (req, res) => {
    let phoneNumber = req.session.user?.phone
    let users = await user.findOne({ phone: phoneNumber })
    req.session.user = users

    await cartHelper.getOrders().then(orders => {

        res.render('users/settings', { noLayout: true, users, orders })
    })


}
exports.resetPasswordView = (req, res) => {
    let message = req.query.message
    res.render('users/reset_password', { noLayout: true, message })

}
exports.resetPasswordData = (req, res) => {
    let email = req.body.email
    authHelper.sendOtpEmail(req.body).then((response) => {
        /* if (response.port === 200) {
            req.session.otpemail = response.email
            req.session.resettoken = response.token
            res.redirect('/verify?token=' + response.token)
        } else {
            res.status(400).send(response.message)
        } */
        if (response) {

            res.redirect('/verifyemail?email=' + email)
        } else {
            let message = 'email in not found '
            res.redirect('/reset_password?message=' + message)
        }

    })
}
exports.setPasswordView = (req, res) => {
    res.render('users/set_password', { noLayout: true })
}
exports.setPasswordData = (req, res) => {
    let email = req.session.loginForgot
    userHelper.updataPassword(email, req.body).then((response) => {

        res.redirect('/settings')

    })
}

exports.profileInfoData = (req, res) => {

    let phone = req.session.user.phone

    userHelper.doProfile(req.body, phone).then(response => {
        req.session.user = response
    })
}
exports.profileInfoAdrsData = (req, res) => {

    let phone = req.session.user.phone

    userHelper.doProfileAddress(req.body, phone).then(response => {
        let newAddress = response.Address
        res.json({ status: response.status, newAddress })

    })
}

exports.menCategoryView = (req, res) => {
    let pageNum = req.query.page
    userHelper.getMenProduct(pageNum).then(response => {
        productData = response.menProduct
        totalPages = response.totalPages

        res.render('category/men', { productData, totalPages })
    })

}

exports.womenCategoryView = (req, res) => {
    let pageNum = req.query.page
    userHelper.getWomenProduct(pageNum).then(response => {
        productData = response.womenProduct
        totalPages = response.totalPages
        res.render('category/women', { productData, totalPages })
    })

}

exports.sportsCategoryView = (req, res) => {
    let pageNum = req.query.page
    userHelper.getSportsProduct(pageNum).then(response => {
        productData = response.sportsProduct
        totalPages = response.totalPages
        res.render('category/sports', { productData, totalPages })
    })

}
exports.emailVerificationView = (req, res) => {

    let userId = req.session.user._id
    let email = req.body.email
    authHelper.emailVerification(email, userId).then(responese => {

        res.json({ redirectUrl: '/verifyemail?email=' + email });
    })

}

exports.verifyEmailView = (req, res) => {
    let email = req.query.email

    res.render("users/verify_email", { noShow: true, email, noLayout: true })

}

exports.verifyEmailData = (req, res) => {

    authHelper.doEmailVerifyOtp(req.body).then(response => {

        if (response.result) {
            req.session.loginForgot = response.email
            res.redirect('/set_password?token=' + response.token)
        } else {
            res.redirect('/verifyemail?email=' + response.email)
        }
    })

}
exports.changePasswordData = (req, res) => {

    let old_pass = req.session.user.password
    let userId = req.session.user._id
    authHelper.doChangePassword(req.body, old_pass, userId).then(response => {
        if (response.result) {
            req.session.user = response.users

            res.send(response.result)
        } else {
            res.send(response.result)
        }

    })

}
exports.cartCount = async (req, res, next) => {
    const user = req.session?.user;

    if (user) {
        res.locals.person = req.session.userLoggedIn
        res.locals.cartCount = await cartHelper.getCartCount(user._id)
        res.locals.wishlistCount = await cartHelper.getwishListCount(user._id)
        next()
    } else {
        res.locals.cartCount = 0
        res.locals.wishlistCount = 0
        next()
    }

}
exports.updateAddress = async (req, res) => {

    const userId = req.session?.user._id;
    console.log(req.body, userId);
    userHelper.doAddressUpdate(req.body, userId).then((response) => {
        res.send(response)
    })

}

exports.addressDelete = (req, res) => {
    let id = req.params.id
    let userId = req.session.user._id
    userHelper.deleteAddress(id, userId).then((response) => {
        res.send(response)
    })
}
exports.about = (req, res) => {
    res.render('users/about')
}
exports.contact = (req, res) => {
    res.render('users/contact')
}
exports.contactMessage = (req, res) => {
    authHelper.doContactMessage(req.body).then(response=>{

        res.redirect('/contact')
    })
}

