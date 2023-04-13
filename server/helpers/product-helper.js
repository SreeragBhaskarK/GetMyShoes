const { } = require("./controller")
const product = require("../../models/products")
const category = require("../../models/category")
const user = require("../../models/user")
const upload = require('../middleware/multer')
const { response } = require("express")
module.exports = {
    doViewProducts() {
        return new Promise(async (resolve, reject) => {

            try {
                var products = await product.aggregate([
                    {
                        $match: {
                            delete_status:{
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
                    }])


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
                let { product_name, product_description, product_category, product_price, product_old_price, product_badge } = productData


                if (!(product_name && product_category && product_price && image && product_description)) throw Error("Empty products")
                let data = await module.exports.addProduct({ product_name, product_description, product_category, product_price, product_old_price, product_badge, image })
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
              
                let viewProducts = await module.exports.viewProduct(proId)
                resolve(viewProducts)
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    doUpdateProduct(proId, productData,images) {
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
            let { product_name, product_description, product_category, product_price, product_old_price, product_badge, image } = productData
        
            const addProduct = new product({
                product_name,
                product_description,
                product_category: product_category,
                product_image: image,
                product_price,
                product_old_price,
                product_badge,



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


        try {
            let result = await product.updateOne({ _id: proId },
                {
                    $set: {
                        product_name: productData.product_name,
                        product_category: productData.product_category,
                        product_price: productData.product_price,
                        product_badge: productData.product_badge,
                        product_description: productData.product_description,
                        product_image: images

                    }
                })
   
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


}
