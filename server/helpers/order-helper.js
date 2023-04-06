const order = require("../../models/order")
const { ObjectId } = require("mongodb")

module.exports = {
    doOrderDetails(orders,pro) {

        return new Promise(async (resolve, reject) => {
            try {
                let ordersData = await order.aggregate([{
                    $match:{_id:new ObjectId(orders)}
                },{
                    $addFields: {
                        productsData: '$products.products'
                    }
                }, {
                    $lookup: {
                        from: 'products',
                        let: { productIds: '$productsData.item' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$productIds']
                                    }
                                }
                            }
                        ],
                        as: 'productInfo'
                    }
                },{
                    $project:{
                        _id:1,
                        productInfo:1,
                        productsData:1
                    }
                },{
                    $unwind:'$productInfo'
                },{$match:{
                    'productInfo._id':new ObjectId(pro)
                }}])

                console.log(ordersData,"nnnnnnnnnnnnnnnn");
                resolve(ordersData)
            }
            catch (e) {
                console.log(e);
            }

        })
    }
}