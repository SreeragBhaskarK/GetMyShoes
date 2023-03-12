const mongoose  = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../config/collections')

const  otpSchema= new Schema({
    email:{
        type:String,
        unique:true},

    otp:String,
    createdAt:Date,
    expiresAt:Date
})

const otp = mongoose.model("otp",otpSchema)


module.exports = otp
