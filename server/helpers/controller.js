const user = require("../../models/user")
const admin = require("../../models/admin")
const { hashData, verifyHashedData } = require("../util/hashData")
const createToken = require("../util/createToken")
const OTP = require("../../models/otp")
const product = require('../../models/products')
const categoryAdd = require('../../models/category')
const generateOTP = require('../util/generateOTP')
const sendEmail = require("../util/sendEmail")
var objectId = require('mongodb').ObjectId
const multer = require('multer')

const { verify } = require("jsonwebtoken")

const verifyUserEmail = async ({ email, otp }) => {
  
    try {
        const validOTP = await verifyOTP({ email, otp })

        if (!validOTP) {

            throw Error("Invalid code passed. Check your inbox.")
        }

        //now update user record to show verified.
        await user.updateOne({ email }, { verified: true, status: 'active' })

        await deleteOTP(email)
        return
    } catch (error) {

        throw error
    }
}

/* const sendVerificationOTPEmail = async (email) => {
    try {
        //check if an account exists

        const existingUser = await user.findOne({ email })
        if (!existingUser) {
            throw Error("There's no account for the provided email.")
        }

        const otpDetails = {
            email,
            subject: "Email Verification",
            message: "Verify your email with the code below.",
            duration: 5
        }
  
        const tokenData = { userId: existingUser._id, email }
        const token = await createToken(tokenData)
     
        await sendOTP(otpDetails)
        return token
    }
    catch (error) {
        throw error
    }
} */

const { AUTH_EMAIL } = process.env

/* const verifyOTP = async ({ email, otp }) => {

    try {

        if (!(email && otp)) {
            throw Error("Provide values for email,otp")
        }

        // ensure otp record exists
        const matchedOTPRecord = await OTP.findOne({
            email
        })

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
} */

/* const sendOTP = async ({ email, subject, message, duration = 5 }) => {
    try {

        if (!(email && subject && message)) {
            throw Error("Provide values for email, subject,message")
        }

        // clear any old record
        await OTP.deleteOne({ email })

        // generate pin
        const generatedOTP = await generateOTP()
        //send email
  
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
        const newOTP = await new OTP({
            email,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 1000 * 60 * + duration
        })
        const createOTPRecord = await newOTP.save()

        return createOTPRecord
    } catch (error) {
        throw error
    }
} */

const createNewUser = async (data) => {

    try {
        const { name, email, password } = data
        // Checking if user already exists
        const existingUser = await user.findOne({ email })

        if (existingUser) {
            throw Error("User with the provided email already exists")
        } else {

        }


        //hash.password
        const hashedPassword = await hashData(password)
        let status = "process"
        const newUser = new user({
            name,
            email,
            password: hashedPassword,
            status: status
        })
        // save user
        const createdUser = await newUser.save()
        return createdUser
    } catch (error) {
        throw error
    }
}



const authenticateAdmin = async (data) => {

    try {
        const { email, password } = data
        const fetchedUser = await admin.findOne({ email })

        if (!fetchedUser) {
            throw Error("Invalid credentials entered!")
        }

        const hashedPassword = fetchedUser.password
        const passwordMatch = await verifyHashedData(password, hashedPassword)
        if (!passwordMatch) {
            throw Error("Invalid password entered!")
        }

        if (!fetchedUser.verified) {
            throw Error("Email hasn't been verified yet. Check your inbox.")


        }

        //create user token
        const tokenData = { userId: fetchedUser._id, email }
        const token = await createToken(tokenData)

        // assign  user token
        fetchedUser.token = token
        return fetchedUser


    } catch (error) {
        throw error
    }
}


const deleteOTP = async (email) => {

    try {

        await OTP.deleteOne({ email })


    } catch (error) {
        throw error
    }
}







const deleteUser = async (proId) => {
    try {
        await user.deleteOne({ _id: proId })
        return
    }
    catch {

    }
}

const statusUser = async (proId) => {
    try {
        await user.updateOne({ _id: proId }, { status: "block" })
        return user.findOne({ _id: proId })
    }
    catch {

    }
}

const statusUserUnblock = async (proId) => {
    try {
        await user.updateOne({ _id: proId }, { status: "active" })
        return user.findOne({ _id: proId })
    }
    catch {

    }
}


/* const sendPasswordResetOTPEmail = async (email) => {
    try {

        const existingUser = await user.findOne({ email })
   
        if (!existingUser) {
            throw Error("There's no account for the provided email.")
        }

        if (!existingUser.verified) {
            throw Error("Email hasn't been verified yet. Check your inbox.")
        }

        const otpDetails = {
            email,
            subject: "Password Reset",
            message: "Enter the code below to reset your password .",
            duration: 5,
        }

        const sendotp = await sendOTP(otpDetails)
        return sendotp
    } catch (error) {
        throw error
    }
} */

const resetUserPassword = async ({ email, otp, newPassword }) => {
    try {
        const validOTP = await verifyOTP({ email, otp })
        if (!validOTP) {
            throw Error("Invalid code passed. Check your inbox.")
        }

        if (newPassword.length < 8) {
            throw Error("Password is too short!")
        }
        const hashedNewPassword = await hashData(newPassword)
        await user.updateOne({ email }, { password: hashedNewPassword })
        await deleteOTP(email)
        return

    } catch (error) {
        throw error
    }
}

/* const addCategory = async (categorys) => {
  
    try {
        let category = categorys
        const addCategory = new categoryAdd({
            category

        })
        await addCategory.save()

        return
    }
    catch {

    }
} */
/* const deleteCategory = async (proId) => {
    try {
        await categoryAdd.deleteOne({ _id: proId })
        return

    }
    catch {

    }
} */

/* const upload = multer({ storage: storage }) */

module.exports = { createNewUser, deleteOTP, verifyUserEmail, authenticateAdmin, deleteUser, statusUser, statusUserUnblock, resetUserPassword }