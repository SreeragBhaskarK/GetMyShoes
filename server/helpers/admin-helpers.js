const { authenticateAdmin, deleteUser, statusUser, statusUserUnblock, addCategory, deleteCategory } = require("./controller")
const users = require("../../models/user")
const category = require("../../models/category")
const product = require("../../models/products")
const order = require("../../models/order")
const coupon = require("../../models/coupon")
const { ObjectId } = require("mongodb")
module.exports = {

    doLogIn(userData) {

        return new Promise(async (resolve, reject) => {
            try {
                let { email, password } = userData

                email = email.trim()
                password = password.trim()


                if (!(email && password)) {
                    throw Error("Empty credentials supplied!")
                }
                const authenticateAdmins = await authenticateAdmin({ email, password })

                resolve({ result: authenticateAdmins, port: 200 })
            } catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)

            }
        })
    },
    doViewUsers() {
        return new Promise(async (resolve, reject) => {

            try {

                let UserView = await users.find()
                resolve(UserView)
            }
            catch (error) {

            }
        })
    },



    doUserDelete(proId) {
        return new Promise(async (resolve, reject) => {

            try {
                let userId = await users.find({ _id: proId })

                if (!userId) throw Error("Empty user")

                await deleteUser(proId)
                resolve()
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })

    },
    doUserStatus(proId) {
        return new Promise(async (resolve, reject) => {

            try {
                let userId = await users.find({ _id: proId })

                if (!userId) throw Error("Empty user")

                let status = await statusUser(proId)
                resolve({ status })
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    }
    , doUserUnblock(proId) {
        return new Promise(async (resolve, reject) => {

            try {
                let userId = await users.find({ _id: proId })

                if (!userId) throw Error("Empty user")

                let status = await statusUserUnblock(proId)
                resolve({ status })
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    /*     doUpload(req, res) {
            const newImage = new image({
                name: req.body.name,
                image: {
                    data: req.file.filename,
                    contentType: "image/png"
                }
            })
        }, */
    doCategory(categoryData) {
        return new Promise(async (resolve, reject) => {
            try {
                let { category } = categoryData

                if (!category) throw Error("Empty category")

                await addCategory(category)
                resolve({ port: 200 })

            } catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)

            }
        })
    },
    doViewCategory() {
        return new Promise(async (resolve, reject) => {
            try {
                let categorys = await category.find()
                if (!categorys) throw Error("Empty category")

                resolve({ port: 200, categorys })

            } catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)

            }
        })

    }, doCategoryDelete(proId) {
        return new Promise(async (resolve, reject) => {

            try {
                let productId = await category.find({ _id: proId })

                if (!productId) throw Error("Empty products")



                if (!productId[0].parent === true) {
                    await deleteCategory(proId)
                }

                resolve()
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    doCategoryEdit(proId) {
        return new Promise(async (resolve, reject) => {
            try {
                let categoryId = await category.find({ _id: proId })

                if (!categoryId) throw Error("Empty products")


                resolve(categoryId)
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    doCategoryUpdate(proId, categoryData) {
        return new Promise(async (resolve, reject) => {

            try {
                let categoryId = await category.find({ _id: proId })

                if (!categoryId) throw Error("Empty user")

                let status = await category.updateOne({ _id: proId },
                    {
                        $set: {

                            category: categoryData.category
                        }
                    })
                resolve({ status })
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    doCategorys(data) {
        return new Promise(async (resolve, reject) => {

            try {
                let categorys = await product.aggregate([{
                    $match: {
                        _id: data._id
                    }
                }, {
                    $lookup: {
                        from: 'categories',
                        localField: "product_category",
                        foreignField: "_id",
                        as: 'category_name'
                    }
                }])

                /* let categoryName =[]
                let j=0
            
                
                while(categoryId[j]){
                    categoryName[j]  = await category.find({_id:categoryId[j]})
                    j++
                    
                }
               
             */
                resolve(categorys[0].category_name)
            }
            catch {

            }


        })

    },
    doUnlist() {
        return new Promise(async (resolve, reject) => {
            let unlistProduct = await product.aggregate([{
                $match: {
                    delete_status: true
                }
            }, {
                $lookup: {
                    from: 'categories',
                    let: { categorys: '$product_category' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $in: ['$_id', '$$categorys']
                            }
                        }
                    }],
                    as: 'category_name'
                }
            }])

            resolve(unlistProduct)
        })

    },
    doRestoreProduct(id) {
        return new Promise(async (resolve, reject) => {
            let unlistProduct = await product.updateOne({ _id: new ObjectId(id) }, {
                $set: {
                    delete_status: false
                }
            })
            resolve()
        })

    },
    doDeleteProduct(id) {
        return new Promise(async (resolve, reject) => {
            let unlistProduct = await product.deleteOne({ _id: new ObjectId(id) })
            resolve()
        })

    },
    doSalesByState() {
        return new Promise(async (resolve, reject) => {
            let States = await order.aggregate([
                {
                    $group: {
                        _id: {
                            state: '$deliveryAddress.state',
                            coords: '$deliveryAddress.coords'
                        },
                        count: {
                            $sum: 1
                        },
                        docs: {
                            $push: '$$ROOT'
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        state: '$_id.state',
                        coords: '$_id.coords',
                        order: '$count'
                    }
                }])

            resolve(States)
        })
    }, getOrder() {
        return new Promise(async (resolve, reject) => {

            let orderData = await order.aggregate([{
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
            }])
            console.log(orderData, '///////////////////////////////');
            resolve(orderData)
        })
    },
    generateCoupon(couponData) {
        return new Promise(async(resolve, reject) => {
            let { couponName, discount, expiryDate, minPurchase } = couponData
            let couponCode = await generateCouponCode(expiryDate+couponName)
            console.log(couponCode);
            let couponAdd = new coupon({
                couponName: couponName,
                discount: discount,
                expiryDate: expiryDate,
                minPurchase: minPurchase,
                code: couponCode
            })
            couponAdd.save()
            resolve()

        })
    },
    getCopons() {
        return new Promise(async(resolve, reject) => {
           let getCoupons = await coupon.find({})
            resolve(getCoupons)

        })
    }
}

function generateCouponCode(data) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'+data;
    let code = '';

    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
    }

    return code;
}