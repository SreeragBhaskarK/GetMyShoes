const { createNewUser, authenticateUser, sendOTP, verifyOTP, sendVerificationOTPEmail, verifyUserEmail, sendPasswordResetOTPEmail, resetUserPassword } = require("./controller")
const product = require("../../models/products")
const user = require("../../models/user")
const category = require("../../models/category")
const { resolveContent } = require("nodemailer/lib/shared")
const createToken = require("../util/createToken")
const { PHONE_NUMBER_OTP } = require("../config/collections")
const { hashData, verifyHashedData } = require('../../server/util/hashData')

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
    doViewProducts() {
        return new Promise(async (resolve, reject) => {

            try {
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
                }])
                console.log(productsView, "testing kjjkkkkkkk");

                resolve(productsView)
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
                console.log(email, "dkfkdjf");

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
        console.log(email, userData);
        console.log(email, userData, 'final//////////////////////');
        return new Promise(async (resolve, reject) => {
            try {
                let { password } = userData
                if (!(password)) {
                    throw Error("Empty credentials are not allowed.")
                }

                const hashedPassword = await hashData(password)
                console.log(hashedPassword, "nooooooooooo")
                await user.updateOne({ email }, { $set: { password: hashedPassword, email_status: 'Verified' } })
                resolve()
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)

            }
        })
    },
    doProductDetails(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let productdata = await product.find({ _id: id })
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
                console.log(allProduct, "nooooooooooo");
                resolve({ productdata, allProduct })
            }
            catch (error) {
                console.log(error)

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
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            try {
                let { firstName, lastName, email, phone } = userData
                let name = firstName + " " + lastName
                console.log(email, "///////////personal info////////////")
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
                    console.log(users);
                    if (users) {
                        resolve(user)
                    }

                }
            } catch (error) {

            }
        })
    },
    doProfileAddress(userData, phoneNumber) {
        console.log(userData);
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
                                    coords:coords,
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

    getWomenProduct() {
        try {
            return new Promise(async (resolve, reject) => {
                let womenProduct = await category.aggregate([{
                    $match: {
                        category: 'women'
                    }
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
                resolve(productData)

            })
        } catch (error) {

        }
    },
    getSportsProduct() {
        try {
            return new Promise(async (resolve, reject) => {
                let sportsProduct = await category.aggregate([{
                    $match: {
                        category: 'sports'
                    }
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
                resolve(productData)

            })
        } catch (error) {

        }
    },



}