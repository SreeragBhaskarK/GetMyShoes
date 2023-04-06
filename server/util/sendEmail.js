const nodemailer = require("nodemailer")
const {AUTH_EMAIL,AUTH_PASS}=process.env
console.log(AUTH_EMAIL,'///////');
let transporter = nodemailer.createTransport({
    /* host:"smtp-mail.outlook.com", */
    service: "gmail",
    auth:{
        
        user:AUTH_EMAIL,
        pass:AUTH_PASS,
        
    }
})

// test transporter
transporter.verify((error,success)=>{
    if(error){
        console.log(error)
    }else{
        console.log("Ready for messages")
        console.log("success")
    }
})

const sendEmail = async (mailOptions)=>{

    try {
        
        await transporter.sendMail(mailOptions)
      
        return
    }catch(error){
   
        throw error

    }

}
module.exports= sendEmail