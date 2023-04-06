const { authenticateAdmin, deleteUser, statusUser, statusUserUnblock, addCategory, deleteCategory } = require("./controller")
const users = require("../../models/user")
const category = require("../../models/category")
const product = require("../../models/products")
const { ObjectId } = require("mongodb")
module.exports = {

    doLogIn(userData) {

        return new Promise(async (resolve, reject) => {
            try {
                let { email, password } = userData
                console.log(userData);
                email = email.trim()
                password = password.trim()

                console.log(email);
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
            console.log(proId);
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
            console.log(proId);
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
            console.log(proId);
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
                console.log(category, 'null');
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
                console.log(categorys, "noooooooo");
                resolve({ port: 200, categorys })

            } catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)

            }
        })

    }, doCategoryDelete(proId) {
        return new Promise(async (resolve, reject) => {
            console.log(proId);
            try {
                let productId = await category.find({ _id: proId })

                if (!productId) throw Error("Empty products")

                await deleteCategory(proId)
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
                console.log(categoryId, "kdjf");

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
            console.log(proId);
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
            },{
                $lookup:{
                    from:'categories',
                    let :{categorys:'$product_category'},
                    pipeline:[{$match:{
                        $expr:{
                            $in:['$_id','$$categorys']
                        }
                    }}],
                    as:'category_name'
                }
            }])

            resolve(unlistProduct)
        })

    },
    doRestoreProduct(id) {
        return new Promise(async (resolve, reject) => {
            let unlistProduct = await product.updateOne({_id:new ObjectId(id)},{
                $set:{
                    delete_status:false
                }
            })
            resolve()
        })

    },
    doDeleteProduct(id) {
        return new Promise(async (resolve, reject) => {
            let unlistProduct = await product.deleteOne({_id:new ObjectId(id)})
            resolve()
        })

    }
}