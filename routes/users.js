const { response } = require('express');
var express = require('express');
var router = express.Router();
/* user helper function */
var userHelper = require('../server/helpers/user-helpers');
const userVerification = require('../server/models/otp');
const auth = require('../server/middleware/auth');
const user = require('../server/models/user');

let otpemail
/* GET users listing. */
router.get('/', function (req, res, next) {
  let person = req.session.user
  res.render('users/index', { person })
});

router.post('/', (req, res) => {
  /*  userHelper.doOTP(req.body).then(response=>{
     if(response.message){
       res.status(400).send(response.message)
     }else{
        res.status(200).json(response)
     }
     
   
   }) */

  userHelper.doEmailVerification(req.body).then(response => {

    if (response.port === 200) {
      /* res.status(200).json(response.result) */
      res.redirect('/verification')
    } else {
      res.status(400).send(response.message)
    }

    /* if (response.message) {
      
    } else {
      
    } */
  })


})

/* login */
router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('users/login', { noShow: true, noLayout: true })
  }

})

router.post('/login', (req, res) => {
  userHelper.doLogIn(req.body).then(response => {

    if (response.port === 200) {
      /* res.status(200).json(response.result) */
      req.session.user = true
      res.redirect('/')
    } else {
      res.status(400).send(response.message)
    }
  })

})

/* signup */
router.get('/signup', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('users/signup', { noShow: true, noLayout: true })
  }
})


router.post('/signUp', (req, res) => {
  console.log(req.body, "kdjfkd");
  userHelper.doSignUp(req.body).then((response) => {

    if (response.port === 200) {
      /* res.status(200).json(response.result) */
      /*  res.redirect('/verification') */

      otpemail = response.email
      res.redirect("/verify")

    } else {
      res.status(400).send(response.message)
    }
  })


})

router.get('/private_data', auth, (req, res) => {
  res.status(200).send(`You're in the private territory of ${req.currentUser.email
    }`)
})

router.get('/verify', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render("users/verified", { noShow: true, noLayout: true })
  }
})

router.post('/verify', (req, res) => {
  /*   userHelper.doVerify(req.body).then(response=>{
      if(response.message){
        res.status(400).send(response.message)
      }else{
         res.status(200).json(response)
      }
    }) */

  /* userHelper.doVerifyEmail(req.body).then(response => {
    console.log(response)

    if (response.port === 200) {
      res.status(200).json(response.result)
    } else {
      res.status(400).send(response.message)
    }
  }) */

  let otp = ''
  req.body.otp.forEach(i => {
    otp += i
  });
  let email = otpemail
  console.log(email, "ldfkdj");
  userHelper.doVerifyEmail({ otp, email }).then(response => {
    console.log(response)
    if (response.port === 200) {
      /* res.status(200).json(response.result) */
      req.session.user = true
      res.redirect('/')
    } else {
      res.status(400).send(response.message)
    }
  })


})

router.get('/products', (req, res) => {
  userHelper.doViewProducts().then(productData => {
    console.log(productData);
    res.render('users/products', { productData })
  })
})

router.post('/products', (req, res) => {

})



router.get('/logout', (req, res) => {
  req.session.user = false
  res.redirect('/')
})



module.exports = router;
