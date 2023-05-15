const { ObjectId } = require("mongodb")
const mongoose  = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')
/* products schema */
const cartSchema = new Schema({

   userId:ObjectId,
   products:[
      {
         item:ObjectId,
         quantity:Number,
         stock : Number
      }
   ]
    
})
   
const cart = mongoose.model(collection.CART_COLLECTITON, cartSchema)

module.exports = cart