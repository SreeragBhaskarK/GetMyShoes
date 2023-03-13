const { response } = require('express');
var express = require('express');
var router = express.Router();
/* user helper function */
var userHelper = require('../server/helpers/user-helpers');
const userVerification = require('../server/models/otp');
const auth = require('../server/middleware/auth')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('users/index')
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
 
    if (response.port===200) {
      /* res.status(200).json(response.result) */
     res.redirect('/verification')
    } else  {
      res.status(400).send(response.message)
    }

    /* if (response.message) {
      
    } else {
      
    } */
  })


})

/* login */
router.get('/login', (req, res) => {
  res.render('users/login', { noShow: true, noLayout: true })
})

router.post('/login', (req, res) => {
  userHelper.doLogIn(req.body).then(response => {
    
    if (response.port===200) {
      /* res.status(200).json(response.result) */
      res.redirect('/')
    } else  {
      res.status(400).send(response.message)
    }
  })

})

/* signup */
router.get('/signup', (req, res) => {
  res.render('users/signup', { noShow: true, noLayout: true })
})


router.post('/signUp', (req, res) => {
  console.log(req.body,"kdjfkd");
  userHelper.doSignUp(req.body).then((response) => {
    
    if (response.port===200) {
      /* res.status(200).json(response.result) */
     /*  res.redirect('/verification') */
     res.render("users/verified",{noShow:true,noLayout:true})
      
    } else  {
      res.status(400).send(response.message)
    }
  })


})

router.get('/private_data', auth, (req, res) => {
  res.status(200).send(`You're in the private territory of ${req.currentUser.email
    }`)
})

router.post('/verify', (req, res) => {
  /*   userHelper.doVerify(req.body).then(response=>{
      if(response.message){
        res.status(400).send(response.message)
      }else{
         res.status(200).json(response)
      }
    }) */

  userHelper.doVerifyEmail(req.body).then(response => {
    console.log(response)
   
    if (response.port===200) {
      res.status(200).json(response.result)
    } else  {
      res.status(400).send(response.message)
    }
  })
})


router.post('/verification',(req,res)=>{
  let otp=''
  req.body.otp.forEach(i => {
    otp += i
  });

  userHelper.doVerifyEmail({otp,email:'sreeragvk020@gmail.com'}).then(response => {
    console.log(response)
   
    if (response.port===200) {
      /* res.status(200).json(response.result) */
      res.redirect('/')
    } else  {
      res.status(400).send(response.message)
    }
  })
})


module.exports = router;
