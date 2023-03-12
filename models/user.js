const mongoose  = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../config/collections')
/* user schema */
const userSchema = new Schema({

    name: String,
    email: String,
    password: String,
    token:String 
})
   
const user = mongoose.model(collection.USER_COLLECTION, userSchema)

module.exports = user