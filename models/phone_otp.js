const mongoose  = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')

const  phoneOTPSchema= new Schema({
    phone_number:{
        type:Number,
        unique:true},

    otp:String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 120 // expires after 2 minutes
      }

},{ timestamps: true })
phoneOTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });

const phoneOTP = mongoose.model(collection.PHONE_NUMBER_OTP,phoneOTPSchema)


module.exports = phoneOTP
