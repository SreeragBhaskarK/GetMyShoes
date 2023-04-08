let product = require('../../models/products')
module.exports = {
    doSearchData(key) {
        return new Promise((resolve, reject) => {
            product.aggregate([{

                $lookup: {
                    from: 'categories',
                    localField: 'product_category',
                    foreignField: '_id',
                    as: 'categoryName',
                }

            }, {
                $match: {
                    $or: [{ product_name: { $regex: new RegExp(key, 'i') } },
                    { 'categoryName.category': { $regex: new RegExp(key, 'i') } }
                    ],
                    delete_status:false
                    
                }
            }]).then(result => {
                resolve(result)
            })
        }).catch(error => {
            console.log(error);
        })
    }
}