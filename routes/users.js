const { response } = require('express');
var express = require('express');
var router = express.Router();
/* user helper function */
var userHelper = require('../helpers/user-helpers');
const userVerification = require('../models/otp');
const auth = require('../middleware/auth')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('users/index')
});

router.post('/',(req,res)=>{
  userHelper.doOTP(req.body).then(respone=>{

  })
})

/* login */
router.get('/login', (req, res) => {
  res.render('users/login', { noShow: true, noLayout: true })
})

router.post('/login', (req, res) => {
  userHelper.doLogIn(req.body).then(respone => {
    if (response.message) {
      res.status(400).send(respone.message)
    } else {
      res.status(200).json(respone)
    }
  })

})

/* signup */
router.get('/signup', (req, res) => {
  res.render('users/signup', { noShow: true, noLayout: true })
})

router.post('/signUp', (req, res) => {
  userHelper.doSignUp(req.body).then((respone) => {
    if (response.message) {
      res.status(400).send(respone.message)
    } else {
      /* res.status(200).json(respone) */
      res.redirect('/login')
    }
  })


})

router.get('/private_data',auth,(req,res)=>{
  res.status(200).send(`You're in the private territory of ${
    req.currentUser.email
  }`)
})


module.exports = router;
