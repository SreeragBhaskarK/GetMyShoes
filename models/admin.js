const mongoose  = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')
/* admin schema */
const adminSchema = new Schema({

    name: String,
    email: String,
    password: String,
    token:String,
    verified:{
        type:Boolean,
        default:false
    }
})
   
const admin = mongoose.model(collection.ADMIN_COLLECTION, adminSchema)

module.exports = admin