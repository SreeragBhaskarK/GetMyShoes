const { createNewUser, authenticateUser, sendOTP, verifyOTP, sendVerificationOTPEmail, verifyUserEmail, sendPasswordResetOTPEmail, resetUserPassword } = require("./controller")
const product = require("../../models/products")
const user = require("../../models/user")
const cart = require("../../models/cart")
const category = require("../../models/category")
const { resolveContent } = require("nodemailer/lib/shared")
const createToken = require("../util/createToken")
const { PHONE_NUMBER_OTP } = require("../config/collections")
const { hashData, verifyHashedData } = require('../../server/util/hashData')
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const order = require("../../models/order")


/* const { phoneOtp, verifyPhoneOTP } = require('../controller/user_controller/phone_otp')
const { userFinding,checkphoneNumber,userStatus} = require('../controller/user_controller/user') */

module.exports = {
    /* doSignUp(userData) {

        return new Promise(async (resolve, reject) => {
            try {
                let { name, email, password } = userData
                name = name.trim()
                email = email.trim()
                password = password.trim()

                if (!(name && email && password)) {
                    throw Error("Empty input fields!")

                } else if (!/^[a-zA-Z]*$/.test(name)) {
                    throw Error("Invalid name entered")
                } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
                    throw Error("Invalid email entered")
                } else if (password.length < 8) {
                    throw Error("Password is too short!")
                } else {
                    // good credentials, create new user

                    await createNewUser({
                        name,
                        email,
                        password
                    })

                    let token = await sendVerificationOTPEmail(email)

                    /*  this.doEmailVerification(userData) 
                    resolve({ port: 200, email: email, token })
                }
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })

    },
    doLogIn(userData) {

        return new Promise(async (resolve, reject) => {
            try {
                let { email, password } = userData
                email = email.trim()
                password = password.trim()

                if (!(email && password)) {
                    throw Error("Empty credentials supplied!")
                }
                console.log('//');
                const authenticateUsers = await authenticateUser({ email, password })

                resolve({ result: authenticateUsers, port: 200 })
            } catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)

            }
        })
    },
    doOTP(userData) {
        return new Promise(async (resolve, reject) => {
            try {
                const { email, subject, message, duration } = userData
                const createOTP = await sendOTP({
                    email,
                    subject,
                    message,
                    duration
                })
                resolve({ result: createOTP, port: 200 })

            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)

            }
        })
    },
    doVerify(userData) {
        return new Promise(async (resolve, reject) => {
            try {
                let { email, otp } = userData
                const validOTP = await verifyOTP({ email, otp })
                resolve({ result: validOTP, port: 200 })
            } catch (error) {
                let err = error.message
                resolve(err)
            }
        })

    },
    doEmailVerification(userData) {

        console.log(userData, "oooooooooo");
        return new Promise(async (resolve, reject) => {
            try {

                const { email } = userData

                if (!email) throw Error("An email is required")

                const createdEmailVerificationOTP = await sendVerificationOTPEmail(email)
                console.log(createdEmailVerificationOTP);

                /*  resolve({ result: createdEmailVerificationOTP, port: 200 }) 
            } catch (error) {

                let err = { port: 400, message: error.message }
                resolve(err)

            }
        })
    },
    doVerifyEmail(userData) {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            try {
                let { otp, email } = userData

                if (!(email && otp)) throw Error("Empty otp details are not allowed")
                console.log(email, otp);
                await verifyUserEmail({ email, otp })
                let token = await sendVerificationOTPEmail(email)
                resolve({ result: { email, verified: true }, port: 200, token })
            } catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)

            }
        })
    }, */
    doViewProducts(pageNum) {
        return new Promise(async (resolve, reject) => {

            try {
                pageNum = pageNum ? pageNum : 1
                const perPage = 12;
                const skipCount = (pageNum - 1) * perPage;
                let productsView = await product.aggregate([{
                    $match: {
                        delete_status: {
                            $not: {
                                $eq: true
                            }
                        }
                    }
                }, {
                    $lookup: {
                        from: 'categories',
                        localField: 'product_category',
                        foreignField: "_id",
                        as: 'product_categoryName'
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: skipCount },
                { $limit: perPage }
                ])

                let totalProducts = await product.countDocuments({ delete_status: { $ne: true } });
                let totalPages = Math.ceil(totalProducts / perPage);
                console.log(totalPages);
                resolve({ productsView, totalPages })
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    sendOtpEmail(userData) {

        return new Promise(async (resolve, reject) => {
            try {
                const { email } = userData
                if (!email) {
                    throw Error("An email is required.")

                }


                await sendPasswordResetOTPEmail(email)
                const existingUser = await user.findOne({ email })
                const tokenData = { userId: existingUser._id, email }
                const token = await createToken(tokenData)
                resolve({ port: 200, token, email })

            } catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }

        })

    },
    resetPassword(userData) {
        return new Promise(async (resolve, reject) => {
            try {
                let { email, otp, newPassword } = userData
                if (!(email && otp && newPassword)) {
                    throw Error("Empty credentials are not allowed.")
                }
                await resetUserPassword({ email, otp, newPassword })

            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    updataPassword(email, userData) {

        return new Promise(async (resolve, reject) => {
            try {
                let { password } = userData
                if (!(password)) {
                    throw Error("Empty credentials are not allowed.")
                }

                const hashedPassword = await hashData(password)

                await user.updateOne({ email }, { $set: { password: hashedPassword, email_status: 'Verified' } })
                resolve()
            }
            catch (error) {
                let err = { port: 400, message: error.message }

                resolve(err)

            }
        })
    },
    doProductDetails(proId, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                let productdata = await product.findOne({ _id: proId })
                let productcartCheck = false
                console.log(userId);
                if (userId !== 1) {
                    let cartItem = await cart.findOne({ userId:new ObjectId(userId) })
                    console.log(cartItem,proId);
                    proId= String(proId)
                    let proExist = cartItem.products.findIndex(product => product.item == proId )
                   
                    if (proExist != -1) {
                        productcartCheck = true
                    }
                }

                let allProduct = await product.aggregate([{
                    $match: {
                        delete_status: {
                            $not: {
                                $eq: true
                            }
                        }
                    }
                }, {
                    $sort: {
                        createdAt: -1
                    }
                }, {
                    $limit: 4
                }])

                resolve({ productdata, allProduct, productcartCheck })
            }
            catch (error) {
                console.log(error, "error");

                reject(error)


            }
        })
    },

    /*     /* new 
        doPhoneNumberSignUp(userData) {
            return new Promise(async (resolve, reject) => {
                try{
                    
                    let { phone_number } = userData
                    /* send otp in phone number 
                    phone_number =  Number('91'+phone_number)
                    let checkNumber = await checkphoneNumber(phone_number)
                    console.log(checkNumber, "//////////////////111111111111111");
                    if(checkNumber){
                        
                        resolve(false)
                    }else{
                        let number =await phoneOtp(phone_number)
                        
                        resolve(number)
                    }
                    
                }catch(error){
                    if(error.status===400){
                        console.log("hello")
                    }else{
    
                        console.log(error);
                    }
                }
                
    
            })
        },
    
        doVerifyOtp(OtpData) {
     
           
            return new Promise(async (resolve, reject) => {
                try{
    
                    let {otp,phone_number}= OtpData
                    const otpNumber = String(otp.join(''));
                    phone_number = Number(phone_number)
                    let validOTP = await verifyPhoneOTP(otpNumber,phone_number)
                    
        
                    resolve({phone_number,validOTP})
                }
                catch(error){
                    console.log(error);
                }
            })
        },
    
        doPhoneNumberLogin(userData){
       
            return new Promise(async(resolve,reject)=>{
                try{
    
                    let {phone_number}=userData
                    phone_number = Number('91'+phone_number)
                    
                   let result = await userFinding(phone_number)
                  
                    resolve({result,phone_number})
                }
                catch(error){
                    console.log(error);
                }
            })
        } */

    doProfile(userData, phoneNumber) {

        return new Promise(async (resolve, reject) => {
            try {
                console.log(userData);
                let { firstName, lastName, email, gender, age } = userData
                let name = firstName + " " + lastName
                let users = await user.find({ email: email, phone: { $ne: phoneNumber } })
                console.log(users);
                if (users.length > 0) {
                    reject(Error('already using email!'))
                    return
                }
                if (firstName || lastName || email || gender || age) {
                    await user.updateOne({ phone: phoneNumber }, {
                        $set: {
                            name: name,
                            email: email,
                            first_name: firstName,
                            last_name: lastName,
                            gender: gender,
                            age: age
                        }
                    })
                    resolve({ status: true })

                }
            } catch (error) {
                console.log(error.message);
                throw error
            }
        })
    },
    doProfileAddress(userData, phoneNumber) {

        return new Promise(async (resolve, reject) => {
            try {
                let { name, phone, pincode, locality, address, city, state, landmark, alternate_phone, address_type } = userData
                const str = state
                const stateName = str.split('[')[0]; // state = "Kerala"
                const coords = str.substring(str.indexOf('[') + 1, str.indexOf(']')).split(',').map(Number); // coords = [10.8505, 76.2711]
                if (name && phone && pincode && locality && city && landmark && alternate_phone && address_type) {




                    let newAddress = await user.findOneAndUpdate({ phone: phoneNumber }, {
                        $push: {
                            address: [
                                {
                                    name: name,
                                    phone: phone,
                                    pincode: pincode,
                                    locality: locality,
                                    address: address,
                                    city: city,
                                    state: stateName,
                                    coords: coords,
                                    landmark: landmark,
                                    alternate_phone: alternate_phone,
                                    address_type: address_type
                                }
                            ]

                        }
                    }, { new: true })
                    console.log(newAddress);
                    const Address = newAddress.address[newAddress.address.length - 1];
                    console.log(Address);
                    resolve({ status: true, Address })
                } else {

                    resolve({ status: false })
                }




            } catch (error) {

            }
        })
    },
    getMenProduct(pageNum) {
        try {
            return new Promise(async (resolve, reject) => {
                pageNum = pageNum ? pageNum : 1
                const perPage = 2;
                const skipCount = (pageNum - 1) * perPage;
                let menProduct = await category.aggregate([{
                    $match: {
                        category: 'men'
                    },
                }, {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'product_category',
                        as: 'products'
                    }
                }, {
                    $match: {
                        'products.delete_status': false
                    }
                }, {
                    $project: {
                        products: {
                            $filter: {
                                input: '$products',
                                as: 'product',
                                cond: {
                                    $eq: ['$$product.delete_status', false]
                                }
                            }
                        }
                    }
                }, {
                    $addFields: {
                        men_products_count: { $size: "$products" }
                    }
                }, {
                    $project: {
                        products: {
                            $slice: ['$products', skipCount, perPage]
                        },
                        men_products_count: 1
                    }
                }, {
                    $sort: {
                        'products.createdAt': -1
                    }
                }
                ])

                let totalPages = Math.ceil(menProduct[0].men_products_count / perPage);

                console.log(menProduct, "noooooooooooooo");
                resolve({ menProduct, totalPages })
            })
        } catch (error) {

        }
    },

    getWomenProduct(pageNum) {
        try {
            pageNum = pageNum ? pageNum : 1
            const perPage = 2;
            const skipCount = (pageNum - 1) * perPage;
            return new Promise(async (resolve, reject) => {
                let womenProduct = await category.aggregate([{
                    $match: {
                        category: 'women'
                    },
                }, {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'product_category',
                        as: 'products'
                    }
                }, {
                    $match: {
                        'products.delete_status': false
                    }
                }, {
                    $project: {
                        products: {
                            $filter: {
                                input: '$products',
                                as: 'product',
                                cond: {
                                    $eq: ['$$product.delete_status', false]
                                }
                            }
                        }
                    }
                }, {
                    $addFields: {
                        women_products_count: { $size: "$products" }
                    }
                }, {
                    $project: {
                        products: {
                            $slice: ['$products', skipCount, perPage]
                        },
                        women_products_count: 1
                    }
                }, {
                    $sort: {
                        'products.createdAt': -1
                    }
                }
                ])

                let totalPages = Math.ceil(womenProduct[0].women_products_count / perPage);

                console.log(womenProduct, "noooooooooooooo");
                resolve({ womenProduct, totalPages })
            })
        } catch (error) {

        }
    },
    getSportsProduct(pageNum) {
        try {
            return new Promise(async (resolve, reject) => {
                pageNum = pageNum ? pageNum : 1
                const perPage = 2;
                const skipCount = (pageNum - 1) * perPage;
                let sportsProduct = await category.aggregate([{
                    $match: {
                        category: 'sports'
                    },
                }, {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'product_category',
                        as: 'products'
                    }
                }, {
                    $match: {
                        'products.delete_status': false
                    }
                }, {
                    $project: {
                        products: {
                            $filter: {
                                input: '$products',
                                as: 'product',
                                cond: {
                                    $eq: ['$$product.delete_status', false]
                                }
                            }
                        }
                    }
                }, {
                    $addFields: {
                        sports_products_count: { $size: "$products" }
                    }
                }, {
                    $project: {
                        products: {
                            $slice: ['$products', skipCount, perPage]
                        },
                        sports_products_count: 1
                    }
                }, {
                    $sort: {
                        'products.createdAt': -1
                    }
                }
                ])
                let totalPages = Math.ceil(sportsProduct[0].sports_products_count / perPage);

                console.log(sportsProduct, "noooooooooooooo");
                resolve({ sportsProduct, totalPages })
            })
        } catch (error) {

        }
    },

    doAddressUpdate(AddressData, userId) {


        return new Promise(async (resolve, reject) => {
            let addresId = AddressData.id
            const str = AddressData.state
            const stateName = str.split('[')[0]; // state = "Kerala"
            const coords = str.substring(str.indexOf('[') + 1, str.indexOf(']')).split(',').map(Number); // coords = [10.8505, 76.2711]
            let data = await user.findOneAndUpdate({

                _id: new ObjectId(userId),
                'address._id': addresId,

            }, {
                $set: {
                    'address.$.name': AddressData.name,
                    'address.$.phone': AddressData.phone,
                    'address.$.pincode': AddressData.pincode,
                    'address.$.locality': AddressData.locality,
                    'address.$.address': AddressData.address,
                    'address.$.city': AddressData.city,
                    'address.$.state': stateName,
                    'address.$.landmark': AddressData.landmark,
                    'address.$.alternate_phone': AddressData.alternate_phone,
                    'address.$.address_type': AddressData.address_type,
                    'address.$.coords': coords,
                },
            },
                { new: true }
            )
            resolve(true)

        })
    }

    ,

    deleteAddress(addressId, userId) {
        return new Promise(async (resolve, reject) => {
            let address = await user.updateOne(
                { _id: new ObjectId(userId) },
                { $pull: { address: { _id: new ObjectId(addressId) } } }
            );
            resolve(true)
        })

    },

    getCategoryProduct(pageNum, categorys) {
        try {

            return new Promise(async (resolve, reject) => {
                pageNum = pageNum ? pageNum : 1
                const perPage = 2;
                const skipCount = (pageNum - 1) * perPage;
                let categoryProduct = await category.aggregate([{
                    $match: {
                        category: categorys
                    },
                }, {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'product_category',
                        as: 'products'
                    }
                }, {
                    $match: {
                        'products.delete_status': false
                    }
                }, {
                    $project: {
                        products: {
                            $filter: {
                                input: '$products',
                                as: 'product',
                                cond: {
                                    $eq: ['$$product.delete_status', false]
                                }
                            }
                        }
                    }
                }, {
                    $addFields: {
                        category_products_count: { $size: "$products" }
                    }
                }, {
                    $project: {
                        products: {
                            $slice: ['$products', skipCount, perPage]
                        },
                        category_products_count: 1
                    }
                }, {
                    $sort: {
                        'products.createdAt': -1
                    }
                }
                ])

                let totalPages = Math.ceil(categoryProduct[0]?.category_products_count / perPage);

                console.log(categoryProduct, "noooooooooooooo");
                resolve({ categoryProduct, totalPages })
            })
        } catch (error) {

        }
    }, getBrandProducts() {
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

            resolve(brandProducts)
        })
    },
    getBrands() {
        return new Promise(async (resolve, reject) => {
            let brands = await category.aggregate([{
                $match: {
                    category_type: 'brand'
                }
            }])

            resolve(brands)
        })
    },
    GetParentCategory() {
        return new Promise(async (resolve, reject) => {
            let parentCateagory = await category.find({ category_type: 'parent' })
            resolve(parentCateagory)
        })
    },
    GetBrandCategory() {
        return new Promise(async (resolve, reject) => {
            let brandCateagory = await category.find({ category_type: 'brand' })
            resolve(brandCateagory)
        })
    },
    GetSubCategory() {
        return new Promise(async (resolve, reject) => {
            let subCateagory = await category.find({ category_type: 'sub' })
            resolve(subCateagory)
        })
    }
}