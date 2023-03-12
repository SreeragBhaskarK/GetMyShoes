var express = require('express');
var router = express.Router();
var userHelper = require('../helpers/user-helpers')

router.get('/', (req, res) => {
    
    res.render('admin/admin_Dashboard', { admin: true ,activeDashboard:'active'})

})

router.get('/login',(req,res)=>{
    res.render('admin/login',{noShow:true,noLayout:true})
})

router.post('/login',(req,res)=>{
    res.redirect('/admin')
})

router.get('/users',(req,res)=>{
    res.render('admin/users',{admin:true,activeUser:'active'})
})

module.exports = router;