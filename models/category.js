const mongoose  = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')
/* products schema */
const categorySchema = new Schema({

   category:{
      type:String,
      unique:true
   },
   category_type:String
    
})
   
const category = mongoose.model(collection.CATEGORY_COLLECTION, categorySchema)

module.exports = category