const { createNewUser, authenticateUser, sendOTP, verifyOTP, sendVerificationOTPEmail, verifyUserEmail, sendPasswordResetOTPEmail, resetUserPassword } = require("./controller")
const product = require("../../models/products")
const user = require("../../models/user")
const category = require("../../models/category")
const { resolveContent } = require("nodemailer/lib/shared")
const createToken = require("../util/createToken")
const { PHONE_NUMBER_OTP } = require("../config/collections")
const { hashData, verifyHashedData } = require('../../server/util/hashData')
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Razorpay = require('razorpay')
var crypto = require("crypto");
const order = require("../../models/order")
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    doProductDetails(proId) {
        return new Promise(async (resolve, reject) => {
            console.log(typeof id, "nnnnnnnnnnn");


            try {
                let productdata = await product.findOne({ _id: proId })
                console.log(productdata, "nnnnnnnnnnn");
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

                resolve({ productdata, allProduct })
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
                let { firstName, lastName, email, phone } = userData
                let name = firstName + " " + lastName

                if (firstName || lastName || email || phone) {
                    await user.updateOne({ phone: phoneNumber }, {
                        $set: {
                            name: name,
                            email: email,
                            first_name: firstName,
                            last_name: lastName
                        }
                    })
                    let users = await user.findOne({ phone: phoneNumber })

                    if (users) {
                        resolve(user)
                    }

                }
            } catch (error) {

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




                    await user.updateOne({ phone: phoneNumber }, {
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
                    })

                }
                resolve()



            } catch (error) {

            }
        })
    },
    getMenProduct() {
        try {
            return new Promise(async (resolve, reject) => {
                let menProduct = await category.aggregate([{
                    $match: {
                        category: 'men'
                    },
                }, {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'product_category',
                        as: 'men_products'
                    }
                }])
                let products = menProduct[0]?.men_products
                let productData = []
                let j = 0
                products?.forEach(element => {
                    if (element.delete_status === false) {
                        productData[j] = element
                        j++
                    }

                });

                console.log(productData, "noooooooooooooo");
                resolve(productData)
            })
        } catch (error) {

        }
    },

    getWomenProduct(pageNum) {
        try {
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
                        as: 'women_products'
                    }
                }])
                let products = womenProduct[0]?.women_products
                let productData = []
                let j = 0
                products?.forEach(element => {
                    if (element.delete_status === false) {
                        productData[j] = element
                        j++
                    }

                });

                console.log(productData, "noooooooooooooo");
                resolve(productData)
            })
        } catch (error) {

        }
    },
    getSportsProduct() {
        try {
            return new Promise(async (resolve, reject) => {
             /*    pageNum = pageNum ? pageNum : 1
                const perPage = 12;
                const skipCount = (pageNum - 1) * perPage; */
                let sportsProduct = await category.aggregate([{
                    $match: {
                        category: 'sports'
                    },
                }, {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'product_category',
                        as: 'sports_products'
                    }
                }])
                let products = sportsProduct[0]?.sports_products
                let productData = []
                let j = 0
                products?.forEach(element => {
                    if (element.delete_status === false) {
                        productData[j] = element
                        j++
                    }

                });

                console.log(productData, "noooooooooooooo");
                resolve(productData)
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
    generateRazorpay(orders) {
        return new Promise((resolve, reject) => {
            var options = {
                amount: orders.totalAmount * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: String(orders._id)
            };
            instance.orders.create(options, function (err, order) {
                console.log(order);
                resolve(order)
            });
        })

    }
    ,
    verifyPayment(details) {
        return new Promise((resolve, reject) => {
            var expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            expectedSignature.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            expectedSignature = expectedSignature.digest('hex')
            if (expectedSignature === details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })

    },
    changePaymentStatus(orderId) {
        return new Promise((resolve, reject) => {
            order.updateOne({ _id: new ObjectId(orderId) }, {
                $set: { status: 'placed' }
            }).then(() => {
                resolve()
            })
        })

    },
    deleteAddress(addressId, userId) {
        return new Promise(async (resolve, reject) => {
            let address = await user.updateOne(
                { _id: new ObjectId(userId) },
                { $pull: { address: { _id: new ObjectId(addressId) } } }
            );
            resolve(true)
        })

    },

}