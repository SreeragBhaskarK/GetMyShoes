const { ObjectId } = require("mongodb")
const mongoose  = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')
/* products schema */
const orderSchema = new Schema({

   userId:ObjectId,
   deliveryAddress:Object,
   paymentMethod:String,
   products:Object,
   status:String,
   totalAmount:Number,
   discount:Number,
   payment_details:Object,
   shipping_status:String

},{ timestamps: true })
   
const order = mongoose.model(collection.ORDER_COLLECTITON, orderSchema)

module.exports = order