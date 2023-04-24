const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')
/* products schema */
const couponSchema = new Schema({

    code: {
        type: String,
        unique: true,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    minPurchase: {
        type: Number,
        required: true
    },
    couponName: {
        type: String,
        required: true
    },
    coupon_description:String,
    status:{
        type:String,
    }

},{ timestamps: true })

const coupon = mongoose.model(collection.COUPON_COLLECTITON, couponSchema)

module.exports = coupon