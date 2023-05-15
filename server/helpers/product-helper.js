const { } = require("./controller")
const product = require("../../models/products")
const category = require("../../models/category")
const user = require("../../models/user")
const coupon = require("../../models/coupon")
const upload = require('../middleware/multer')
const { response } = require("express")
const { ObjectId } = require("mongodb")
module.exports = {
    doViewProducts() {
        return new Promise(async (resolve, reject) => {

            try {
                var products = await product.aggregate([
                    {
                        $match: {
                            delete_status: {
                                $not: {
                                    $eq: true

                                }
                            }


                        }
                    }, {
                        $lookup: {
                            from: "categories",
                            localField: "product_category",
                            foreignField: "_id",
                            as: 'category_name'
                        }
                    }, { "$sort": { "createdAt": -1 } }])


                if (!products) throw Error("Empty products")
                let categorys = await category.find()
                /*   console.log(category, "//////////////////");
                  let categoryName 
                  let category_name ="/"
                  console.log(productsView[0].product_category, "nooooooooooooo");
                  let i =0
                  while (productsView[0].product_category[i]) {
                      console.log(category, "//////////////////");
                      categoryName = await categoryView.find({_id:productsView[0].product_category[i]})
                      categoryName.forEach(j => {
                          category_name+=j.category
                          category_name+="/"
                          
                      });
                      
                      i++
                  } */



                resolve({ products, categorys })
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    doAddProduct(productData, images) {


        let image = images.map(file => file.filename)
        return new Promise(async (resolve, reject) => {
            try {
                let { product_name, product_size, product_description, product_category, product_price, product_old_price, product_badge, product_stock } = productData


                if (!(product_name && product_category && product_price && image && product_description && product_size)) throw Error("Empty products")
                let data = await module.exports.addProduct({ product_name, product_description, product_category, product_price, product_old_price, product_size, product_badge, image, product_stock })
                resolve({ port: 200 })

            } catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)

            }
        })

    },
    doProductDelete(proId) {
        return new Promise(async (resolve, reject) => {

            try {
                let productId = await product.find({ _id: proId })

                if (!productId) throw Error("Empty products")

                await module.exports.deleteProduct(proId)
                resolve()
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    doProductEdit(proId) {
        return new Promise(async (resolve, reject) => {
            try {
                let productId = await product.find({ _id: proId })

                if (!productId) throw Error("Empty products")

                let viewProducts = await product.aggregate([{
                    $match: { _id: new ObjectId(proId) }
                }, {
                    $lookup: {
                        from: 'categories',
                        localField: 'product_category',
                        foreignField: '_id',
                        as: 'categories'
                    }
                }, {
                    $lookup: {
                        from: 'categories',
                        pipeline: [],
                        as: 'categories_full'
                    }
                }])
                console.log(viewProducts, "nnnnnnnnnnnn");
                resolve(viewProducts)
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    doUpdateProduct(proId, productData, images) {
        let image = images.map(file => file.filename)
        return new Promise(async (resolve, reject) => {

            try {
                let productId = await product.find({ _id: proId })

                if (!productId) throw Error("Empty user")
                /*           let images = await module.exports.imageUpdate(productData.product_image, productId) */

                let status = await module.exports.updateProduct(proId, productData, image)
                resolve({ status })
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    async addProduct(productData) {
        try {
            let { product_name, product_description, product_category, product_price, product_old_price, product_badge, image, product_stock, product_size } = productData

            const addProduct = new product({
                product_name,
                product_description,
                product_category: product_category,
                product_image: image,
                product_price,
                product_old_price,
                product_badge,
                product_stock,
                product_size



            })
            const createProduct = await addProduct.save()

            return createProduct
        }
        catch {

        }
    },
    async deleteProduct(proId) {
        try {
            await product.updateOne({ _id: proId }, {
                $set: {
                    delete_status: true
                }
            })

            return
        }
        catch {

        }
    },
    async viewProduct(proId) {
        try {
            let viewProduct = await product.findOne({ _id: proId })
            return viewProduct
        }
        catch {

        }

    },
    async updateProduct(proId, productData, images) {
        console.log(images.length,'nnnnnnnnnnnnnnnnnnn');

        try {
            if(images.length>0){
                let result = await product.updateOne({ _id: proId },
                    {
                        $set: {
                            product_name: productData.product_name,
                            product_category: productData.product_category,
                            product_price: productData.product_price,
                            product_badge: productData.product_badge,
                            product_description: productData.product_description,
                            product_image: images,
                            product_stock: productData.product_stock,
                            product_size: productData.product_size
    
                        }
                    })
    
            }else{
                let result = await product.updateOne({ _id: proId },
                    {
                        $set: {
                            product_name: productData.product_name,
                            product_category: productData.product_category,
                            product_price: productData.product_price,
                            product_badge: productData.product_badge,
                            product_description: productData.product_description,
                            product_stock: productData.product_stock,
                            product_size: productData.product_size
    
                        }
                    })
            }
         
            return user.findOne({ _id: proId })
        }
        catch {
            throw error
        }

    },
    async imageUpdate(images, products) {


        /*  await upload.single(images[0]).then(response=>{
             console.log(response,req.file);
         }) */
        /*      console.log(result); */
        /* const file = req.file */
        try {
            /* if (images[0]) {

            } *//*  else if (images[1] == '') {
                images[1] = product_image[1]
            } else if (images[2] == '') {
                images[2] = product_image[2]
            } else if (images[3] == '') {
                images[3] = product_image[3]
            } */

            if (images[0] == '') {
                images[0] = product_image[0]
            } else if (images[1] == '') {
                images[1] = product_image[1]
            } else if (images[2] == '') {
                images[2] = product_image[2]
            } else if (images[3] == '') {
                images[3] = product_image[3]
            }

            return images
        } catch (error) {

        }
    }
    ,
    priceFilter(priceMinMax, pageNum) {
        return new Promise(async (resolve, reject) => {
            console.log(priceMinMax);
            let { minPrice, maxPrice } = priceMinMax
            minPrice = Number(minPrice)
            maxPrice = Number(maxPrice)

            pageNum = pageNum ? pageNum : 1
            const perPage = 12;
            const skipCount = (pageNum - 1) * perPage;
            let filterProducts = await product.aggregate([{
                $match: {
                    $and: [
                        { delete_status: false },
                        { product_price: { $gt: minPrice } },
                        { product_price: { $lt: maxPrice } }
                    ]

                }
            }, { $sort: { createdAt: -1 } },
            { $skip: skipCount },
            { $limit: perPage }
            ])

            /* let totalProducts = await product.filterProducts({ delete_status: { $ne: true } });
            let totalPages = Math.ceil(totalProducts / perPage); */


            resolve({ filterProducts, /* totalPages */ })



        })
    },
    doCouponDelete(couponId) {
        return new Promise(async (resolve, reject) => {
            await coupon.updateOne({ _id: new ObjectId(couponId) }, {
                status: 'remove'
            })

            resolve()
        })
    },
    doCouponRestore(couponId) {
        return new Promise(async (resolve, reject) => {
            await coupon.updateOne({ _id: new ObjectId(couponId) }, {
                status: 'active'
            })

            resolve()
        })
    },
    doCouponEdit(couponId) {
        return new Promise(async (resolve, reject) => {
            let couponData = await coupon.findOne({ _id: new ObjectId(couponId) })
            resolve(couponData)
        })
    },
    brandProducts(brandData) {
        return new Promise(async (resolve, reject) => {
            console.log(brandData);
            let brandProducts = await category.aggregate([{
                $match: {
                    $and: [
                        { category_type: 'brand' },
                        { category: brandData.brand }
                    ]


                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'product_category',
                    as: 'brandProducts'
                }
            }, {
                $match: {
                    'brandProducts.delete_status': false
                }
            }, {
                $addFields: {
                    brandProducts: { $slice: ['$brandProducts', 8] }
                }
            }])
            console.log(brandProducts);
            resolve(brandProducts)
        })
    },
    allBrandProducts() {
        return new Promise(async (resolve, reject) => {

            let brandProducts = await category.aggregate([{
                $match: {

                    category_type: 'brand'
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'product_category',
                    as: 'brandProducts'
                }
            }, {
                $match: {
                    'brandProducts.delete_status': false
                }
            }, {
                $sort: {
                    'brandProducts.created_at': -1
                }
            }, {
                $unwind:
                    '$brandProducts'

            }, {
                $project: {
                    brandProducts: '$brandProducts'
                }
            },
            {
                $limit: 8
            }])
            console.log(brandProducts);
            resolve(brandProducts)
        })
    },
    getNewSpecial() {
        return new Promise(async (resolve, reject) => {

            let newSpecial = await product.find({ product_badge: 'new' }).sort({ created_at: -1 }).limit(4);

            resolve(newSpecial)
        })
    }


}
