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
    email_status: String,
    phone: {
        type: Number,
        unique: true
    },
    age: String,
    gender: String,
    country: String,
    city: String,
    status: String,
    password: String,
    token: String,
    address: Array,
    verified: {
        type: Boolean,
        default: false
    }
})

const user = mongoose.model(collection.USER_COLLECTION, userSchema)

module.exports = user