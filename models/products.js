const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const collection = require('../server/config/collections')
/* products schema */
const productSchema = new Schema({

    product_name: String,
    product_description: String,
    product_category: [{
        type: ObjectId
    }]  
    ,
    product_price: Number,
    product_old_price: Number,
    product_badge: String,
    product_image: Array,
    delete_status: {
        type: Boolean,
        default: false

    }

},{ timestamps: true })

const product = mongoose.model(collection.PRODUCT_COLLECTION, productSchema)

module.exports = product