

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
/* sends random number to users number (twilio) */
module.exports = {
    sendSms(phone_number) {
  
        client.verify.v2.services(process.env.TWILIO_SERVICES_SID)
            .verifications
            .create({ to: "+91" + phone_number, channel: 'sms' })
            .then(verification => console.log(verification.sid))
            .catch((error) => {
                throw error
            })



    },
    sendSmsChecking(otp, phone_number) {



        return client.verify.v2.services(process.env.TWILIO_SERVICES_SID)
            .verificationChecks
            .create({ to: "+91" + phone_number, code: otp })
            .then(verification_check => {
                if (verification_check.status == "approved") {
             
                    let result = true
                    return result
                } else {
                 
                    let result = false
                    return result
                }
            })
            .catch((error) => {
                throw error

            })
    }


}


