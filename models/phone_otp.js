const mongoose  = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')

const  phoneOTPSchema= new Schema({
    phone_number:{
        type:Number,
        unique:true},

    otp:String,
    createdAt:Date,
    expiresAt:Date
})

const phoneOTP = mongoose.model(collection.PHONE_NUMBER_OTP,phoneOTPSchema)


module.exports = phoneOTP
