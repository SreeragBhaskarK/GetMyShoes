const mongoose  = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')

const  otpSchema= new Schema({
    email:String,
    otp:String,
    createdAt:Date,
    expiresAt:Date
})
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60*5 });

const otp = mongoose.model("otps",otpSchema)


module.exports = otp
