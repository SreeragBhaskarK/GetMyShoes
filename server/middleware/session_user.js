const verifyLogin = (req, res, next) => {
    if(req.session.userLoggedIn){
        res.redirect('/')
    }else{
        next() 
    }
    

}

const verifyAdmin = (req, res, next) => {

    if (req.session.adminLoggedIn) {
        next()
    } else {
        res.redirect('/admin/login')
    }
}
const verify= (req,res,next)=>{
    if(req.session.userLoggedIn){
        next()
    }else{
        res.redirect('/login')
    }
}
module.exports = { verifyLogin ,verifyAdmin,verify}
