
var userHelper = require('../server/helpers/user-helpers');
var authHelper = require('../server/helpers/authHelper');
const generateToken = require("../server/util/createToken");
const user = require('../models/user');
const cartHelper = require('../server/helpers/cart-helper');
const { hashData } = require('../server/util/hashData');

exports.userView = (req, res) => {


    res.render('users/index')
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
            console.log(response, "testing");
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
    console.log(number, req.query.login, "heloooooo");
    res.render("users/verify", { noShow: true, number, noLayout: true })

}
exports.verifyData = (req, res) => {
    console.log(req.body, "uuuuuuuuuuuuuu");
    authHelper.doVerifyOtp(req.body).then(response => {
        console.log(response);
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
    console.log(users, '//////////');
    await cartHelper.getOrders().then(orders => {
        console.log(orders, 'neeeeeeeeeee');
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
    console.log(req.body, '//////////////ssssss/');
    userHelper.doProfile(req.body, phone).then(response => {
        req.session.user = response
    })
}
exports.profileInfoAdrsData = (req, res) => {

    let phone = req.session.user.phone
    console.log(req.body, req.session.user, '///////////////daaaaaaaaaaaaaaa');
    userHelper.doProfileAddress(req.body, phone).then(response => {
        res.send({ status: true })

    })
}

exports.menCategoryView = (req, res) => {
    userHelper.getMenProduct().then(responses => {

        let menProduct = responses
        console.log(menProduct);
        res.render('category/men', { menProduct })
    })

}

exports.womenCategoryView = (req, res) => {
    userHelper.getWomenProduct().then(responese => {
        let womenProduct = responese
        res.render('category/women', { womenProduct })
    })

}

exports.sportsCategoryView = (req, res) => {
    userHelper.getSportsProduct().then(responese => {
        let sportsProduct = responese
        res.render('category/sports', { sportsProduct })
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
    console.log(email, "heloooooo");
    res.render("users/verify_email", { noShow: true, email, noLayout: true })

}

exports.verifyEmailData = (req, res) => {
    console.log(req.body, "uuuuuuuuuuuuuu");
    authHelper.doEmailVerifyOtp(req.body).then(response => {
        console.log(response);
        if (response.result) {
            req.session.loginForgot = response.email
            res.redirect('/set_password?token=' + response.token)
        } else {
            res.redirect('/verifyemail?email=' + response.email)
        }
    })

}
exports.changePasswordData = (req, res) => {
    console.log(req.body, "uuuuuuuuuuuuuu");
    let old_pass = req.session.user.password
    let userId = req.session.user._id
    authHelper.doChangePassword(req.body, old_pass, userId).then(response => {
        if (response.result) {
            req.session.user = response.users
            console.log(req.session.user, 'checkkkkkkkkkkk');
            res.send(response.result)
        } else {
            res.send(response.result)
        }

    })

}
exports.cartCount = async (req, res, next) => {
    const user = req.session?.user;
    console.log(user, '////////////session');
    if (user) {
        res.locals.person = req.session.userLoggedIn
        res.locals.cartCount = await cartHelper.getCartCount(user._id)
        next()
    } else {
        next()
    }

}



