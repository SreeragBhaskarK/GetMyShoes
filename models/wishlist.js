const mongoose  = require("mongoose")
const { ObjectId } = require("mongodb")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')
/* products schema */
const wishlistSchema = new Schema({

   userId:ObjectId,
   products:[
      {
         item:ObjectId
        
      }
   ]
    
})
   
const wishlist = mongoose.model(collection.WISHLIST_COLLECTITON, wishlistSchema)

module.exports = wishlist