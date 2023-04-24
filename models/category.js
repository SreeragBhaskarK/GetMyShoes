const mongoose  = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')
/* products schema */
const categorySchema = new Schema({

   category:String,
   category_type:String
    
})
   
const category = mongoose.model(collection.CATEGORY_COLLECTION, categorySchema)

module.exports = category