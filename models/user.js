const mongoose = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')
/* user schema */
const userSchema = new Schema({

    name: String,
    first_name: String
    ,

    last_name: String

    ,

    email: {
        unique: true,
        type: String
    },
    email_status: {
        type:String,
        default:'notVerified',
    },
    phone: {
        type: Number,
        unique: true
    },
    age: Number,
    gender: String,
    country: String,
    city: String,
    status: String,
    password: String,
    token: String,
    address: [{
        name:String,
        phone:Number,
        pincode:Number,
        locality:String,
        address:String,
        city:String,
        state:String,
        landmark:String,
        alternate_phone:Number,
        address_type:String,
        coords:Object
    }],
    verified: {
        type: Boolean,
        default: false
    }
})

const user = mongoose.model(collection.USER_COLLECTION, userSchema)

module.exports = user