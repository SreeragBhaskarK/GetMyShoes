let user = require('../../models/user')
const phoneOTP = require('../../models/phone_otp')
const generateOTP = require('../../server/util/generateOTP')
const { sendSms, sendSmsChecking } = require("../util/sendSMS")
const { hashData, verifyHashedData } = require('../../server/util/hashData')
const { ObjectId } = require('mongodb')
const sendEmail = require("../../server/util/sendEmail")
const { AUTH_EMAIL, AUTH_PASS } = process.env
const OTP = require("../../models/otp")
const createToken = require("../util/createToken")
const { hash } = require('bcrypt')

module.exports = {
    /* login */
    doPhoneNumberLogin(userData) {

        return new Promise(async (resolve, reject) => {
            try {

                let { phone_number } = userData
                phone_number = Number('91' + phone_number)

                let result = await module.exports.userFinding(phone_number)
                if (result === 1) {
                    await sendSms(phone_number)
                }

                resolve({ result, phone_number })
            }
            catch (error) {
                console.log(error);
            }
        })
    },
    /* signUp */
    doPhoneNumberSignUp(userData) {
        return new Promise(async (resolve, reject) => {
            try {

                let { phone_number } = userData
                /* send otp in phone number */
                phone_number = Number('91' + phone_number)
                let checkNumber = await module.exports.checkphoneNumber(phone_number)

                if (checkNumber.result) {

                    resolve(false)
                } else {
                    let number = await module.exports.sendOtpPhone(phone_number)

                    resolve(phone_number)
                }

            } catch (error) {
                if (error.status === 400) {
                    console.log("hello")
                } else {

                    console.log(error);
                }
            }


        })
    },

    /* verify otp */

    doVerifyOtp(OtpData) {

        console.log(OtpData, "/////////////////////otp");
        return new Promise(async (resolve, reject) => {
            try {

                let { otp, phone_number } = OtpData
                const otpNumber = String(otp.join(''));
                phone_number = Number(phone_number)

                let userCheck = user.findOne({ phone: phone_number })
                let validOTP
                if (userCheck.status === 'active') {
                    validOTP = await sendSmsChecking(otpNumber, phone_number)

                } else {
                    validOTP = await sendSmsChecking(otpNumber, phone_number)
                    if (validOTP) {
                        await user.updateOne({ phone: phone_number }, { status: "active" })
                    }

                }

                let phone = phone_number
                resolve({ phone, validOTP })
            }
            catch (error) {
                console.log(error);
            }
        })
    },


    userFinding: async (phone_number) => {
        try {

            let result = await user.findOne({ phone: phone_number })

            if (result) {
                if (result.status === "active") {
                    return 1
                } else {

                    return -1
                }
            } else {

                return 0
            }
        } catch (error) {
            throw error
        }

    },

    phoneOtp: async (phone_number) => {

        try {

            /* generate randow otp */
            /*  const generatedOTP = await generateOTP() */
            /*  console.log('//////////', generatedOTP, '/////////'); */
            let result = await module.exports.sendOtpPhone(phone_number)
            return phone_number

        } catch (error) {

        }


    },
    sendOtpPhone: async (phone_number) => {
        console.log(phone_number, "//////////////////11nooooooooooo1111111111111");
        try {
            /* let hashedOTP = await hashData(otp) */
            let userCheck = await user.findOne({ phone: phone_number })

            sendSms(phone_number)

            return saveUser()

            /* */

            /* sends random number to users number (twilio) */
            /* client.messages
                      .create({ body: otp, from: '14753488168', to: phone_number })
                      .then(saveUser());  */





            /* saves random number to database then renders verify page */

            async function saveUser() {
                console.log("uuuuuuuuuuuuuuu");
                let phoneNumber = phone_number

                if (userCheck == null) {
                    console.log(userCheck, "zzzzzzzzzyyyyyyyyyyyyy");
                    const newUser = new user({
                        status: "process",
                        phone: phoneNumber

                    })
                    newUser.save()

                }
                return true

            }


        }
        catch (error) {
            if (error.status === 400) {
                console.log("hello")
            } else {
                throw error

            }

        }
    },
    checkphoneNumber: async (phone_number) => {
        try {
            console.log(phone_number, "nokkkkkkkkkkkkkkkkkkk");
            let result = await user.findOne({ phone: phone_number })
            console.log(result);
            if (result?.status !== "active") {
                return { result: false }
            } else {

                return { result: true }
            }
        }
        catch (error) {

        }
    },

    verifyPhoneOTP: async (otp, phone_number) => {

        console.log(phone_number, otp, "noooooooooooooooooooooo");
        try {
            /*  let otpData = await phoneOTP.findOne({ phone_number: phone_number })
             let userData = await user.findOne({ phone: phone_number })
  *//* 
                                                                                                                                                                   if (!otpData) {
                                                                                                                                                                       throw Error("Invalid otp.")
                                                                                                                                                                   } */
            /* console.log(userData?.phone, "nooooo") */
            let validOTP = await sendSmsChecking(otp, phone_number)
            if (validOTP) {

                await user.updataOne({ phone: phone_number }, {
                    status: "active"

                })



                /*    await module.exports.deleteOTP(phone_number) */

            }
            return validOTP

        }
        catch (error) {
            console.log(error);
        }

    },

    deleteOTP: async (phoneNumber) => {
        try {
            await phoneOTP.deleteOne({ phone_number: phoneNumber })
        } catch (error) {
            throw error
        }

    },
    doLogIn(userData) {

        return new Promise(async (resolve, reject) => {
            try {

                let { email, password } = userData
                email = email.trim()
                password = password.trim()

                if (!(email && password)) {
                    throw Error("Empty credentials supplied!")
                }
                console.log('//');
                const authenticateUsers = await module.exports.authenticateUser({ email, password })
                console.log(authenticateUsers);
                let userView = authenticateUsers
                if (userView) {
                    resolve({ result: true, userView })
                } else {
                    resolve({ result: false, message: "This mail is not Verified!" })
                }


            } catch (error) {
                let err = { message: error.message }
                resolve(err)

            }
        })
    },

    async authenticateUser(data) {

        try {

            const { email, password } = data
            const fetchedUser = await user.findOne({ email })
            if (!fetchedUser) {
                throw Error("Invalid credentials entered!")
            }

            if (fetchedUser.email_status === 'notVerified') {

                return false
            }

            const hashedPassword = fetchedUser.password
            const passwordMatch = await verifyHashedData(password, hashedPassword)
            if (!passwordMatch) {
                throw Error("Invalid password entered!")
            }


            /*     if (!fetchedUser.verified) {
                    /* throw Error("Email hasn't been verified yet. Check your inbox.") 
                    await user.deleteOne({ email })
                    throw Error("Email hasn't been signup.")
                } */

            //create user token
            /*  const tokenData = { userId: fetchedUser._id, email }
             const token = await createToken(tokenData) */

            // assign  user token
            /*  fetchedUser.token = token
             return fetchedUser */
            return fetchedUser


        } catch (error) {
            throw error
        }
    },
    emailVerification(email, userId) {
        try {
            return new Promise(async (resolve, reject) => {
                let userData = await user.findOne({ _id: new ObjectId(userId) })
                console.log(userData, userId, email);
                if (userData?.email_status === 'notVerified') {
                    await module.exports.sendVerificationOTPEmail(email)
                    resolve(true)
                }
                resolve(false)
            })
        } catch (error) {

        }
    },
    async sendVerificationOTPEmail(email) {
        try {

            const otpDetails = {
                email,
                subject: "Email Verification",
                message: "Verify your email with the code below.",
                duration: 5
            }
            console.log("testing");

            await module.exports.sendOTP(otpDetails)
            return true
        }
        catch (error) {
            throw error
        }
    },
    async sendOTP({ email, subject, message, duration = 5 }) {
        try {

            if (!(email && subject && message)) {
                throw Error("Provide values for email, subject,message")
            }
            /* 
                    // clear any old record
                    await OTP.deleteOne({ email }) */

            // generate pin
            const generatedOTP = await generateOTP()
            //send email
            console.log("dkfjkdjfkdjf", generatedOTP)
            const mailOptions = {

                from: AUTH_EMAIL,
                to: email,
                subject,
                html: `<p>${message}</p><p style="color:tomato;
                font-size:25px;letter-spacing:2px;"><b>${generatedOTP}</b></p><p>This code <b>expires in ${duration} minutes(s)</b>.</p>`
            }


            await sendEmail(mailOptions)


            // save otp record
            const hashedOTP = await hashData(generatedOTP)
            let otpCheck = await OTP.findOne({ email: email })
            if (!otpCheck) {
                const newOTP = await new OTP({
                    email,
                    otp: hashedOTP,
                    createdAt: Date.now(),
                    expiresAt: Date.now() + 1000 * 60 * + duration
                })
                await newOTP.save()
            } else {
                await OTP.updateOne({ email: email }, {
                    $set: {
                        email,
                        otp: hashedOTP,
                        createdAt: Date.now(),
                        expiresAt: Date.now() + 1000 * 60 * + duration
                    }
                })
            }


            return true
        } catch (error) {
            throw error
        }
    },
    doEmailVerifyOtp(OtpData) {
        try {
            return new Promise(async (resolve, reject) => {
                let { otp, email } = OtpData
                const otpNumber = String(otp.join(''));
                let result = await module.exports.verifyOTP(email, otpNumber)
                if (result) {
                    const tokenData = { otp, email }
                    const token = await createToken(tokenData)
                    console.log(token, "////////////////result");
                    resolve({ result, email, token })
                } else {

                    resolve({ result, email })
                }

            })
        } catch (error) {

        }
    },
    async verifyOTP(email, otp) {

        try {
            console.log(email, otp);
            if (!(email && otp)) {
                throw Error("Provide values for email,otp")
            }

            // ensure otp record exists
            const matchedOTPRecord = await OTP.findOne({
                email
            })
            console.log(matchedOTPRecord);
            if (!matchedOTPRecord) {
                throw Error("No otp records found.")
            }

            const { expiresAt } = matchedOTPRecord

            // checking for expired code
            if (expiresAt < Date.now()) {
                await OTP.deleteOne({
                    email
                })
                throw Error("Code has expired. Request for a new one.")
            }
            //not expired yet, verify value

            const hashedOTP = matchedOTPRecord.otp
            const validOTP = await verifyHashedData(otp, hashedOTP)
            return validOTP



        } catch (error) {
            throw error
        }
    },
    sendOtpEmail(userData) {

        return new Promise(async (resolve, reject) => {
            try {
                const { email } = userData
                if (!email) {
                    throw Error("An email is required.")

                }
                console.log(email, "dkfkdjf");
                let emailCheck = await user.findOne({ email: email })
                console.log(emailCheck, "dkfkdjf");

                if (!emailCheck) {
                    resolve(false)
                } else {
                    await module.exports.sendVerificationOTPEmail(email)
                    resolve(true)
                }

                /* await sendPasswordResetOTPEmail(email)
                const existingUser = await user.findOne({ email })
                const tokenData = { userId: existingUser._id, email }
                const token = await createToken(tokenData)
                resolve({ port: 200, token, email }) */

            } catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }

        })

    },
    doChangePassword(pass, oldPass, userId) {
        return new Promise(async (resolve, reject) => {
            let { current_password, new_password, confirm_password } = pass
            const passwordMatch = await verifyHashedData(current_password, oldPass)
            console.log(passwordMatch, "ppppppassssssssssss");
            if (!passwordMatch) {
                resolve({ result: false })
            } else {
                if (new_password === confirm_password) {
                    let hashedPass = await hashData(new_password)
                    console.log(hashedPass, 'hassssssssssss');
                    await user.updateOne({ _id: new ObjectId(userId) }, {
                        $set: { password: hashedPass }
                    })
                    let userView = await user.findOne({ _id: new ObjectId(userId) })
                    console.log(userView, 'checkkkkkkkkkkk');
                    resolve({ result: true, users: userView })
                } else {
                    resolve({ result: true })
                }

            }
        })
    }
    ,
    doContactMessage(data) {
        console.log(data);
        return new Promise(async (resolve, reject) => {
            const mailOptions = {

                from: AUTH_EMAIL,
                to: AUTH_EMAIL,
                subject:'contact message',
                html: `<p>contact message</p><p style="color:tomato;
                font-size:25px;letter-spacing:2px;"><b>contact message</b></p><p>Contact information <b><br>name : ${data.name}<br>email : ${data.email}<br>website : ${data.website}<br>message : ${data.message} </b>.</p>`
            }


            await sendEmail(mailOptions)
            resolve()
        })
    }



}