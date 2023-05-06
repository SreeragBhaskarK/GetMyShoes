const mongoose = require('mongoose')
const Schema = mongoose.Schema
const collection = require('../server/config/collections')

const bannersSchema = new Schema({
    header: [
        {
            title: String,
            title_strong:String,
            description:String,
            shop_link:String,
            header_img:String
        }

    ],
    main:[{
        left_title:String,
        left_description:String,
        shop_link_left:String,
        main_image:Array,
        right_title:String,
        right_description:String,
        shop_link_right:String
    }],
    special:[{
        title:String,
        shop_link:String,
        special_img:String
    }]
})

const banner = mongoose.model(collection.BANNER_COLLECTITON,bannersSchema)
module.exports = banner