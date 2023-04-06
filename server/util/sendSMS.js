

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
/* sends random number to users number (twilio) */
module.exports = {
    sendSms(phone_number) {
        /* client.messages
        .create({ body: otp, from: '+', to: "+"+phone_number })
        
          */


        client.verify.v2.services(process.env.TWILIO_SERVICES_SID)
            .verifications
            .create({ to: "+" + phone_number, channel: 'sms' })
            .then(verification => console.log(verification.sid))
            .catch((error) => {
                console.log(error);
            })



    },
    sendSmsChecking(otp, phone_number) {



        return client.verify.v2.services(process.env.TWILIO_SERVICES_SID)
            .verificationChecks
            .create({ to: "+" + phone_number, code: otp })
            .then(verification_check => {
                if (verification_check.status == "approved") {
                    console.log(verification_check.status, "true");
                    let result = true
                    return result
                } else {
                    console.log(verification_check.status, "false");
                    let result = false
                    return result
                }
            })
            .catch((error) => {
                console.error(error);

            })
    }


}


