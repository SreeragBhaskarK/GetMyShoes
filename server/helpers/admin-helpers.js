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
    doDashboard() {
        return new Promise(async (resolve, reject) => {

            /* Sales by State */
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const startOfMonth = new Date(currentDate.getFullYear(), currentMonth, 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentMonth + 1, 1);

            let States = await order.aggregate([{
                $match: {
                    status: 'placed'
                    , createdAt: {
                        $gte: startOfMonth,
                        $lt: endOfMonth,
                    },
                }
            },
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

            /* week orders */
            const startOfWeek = new Date();
            startOfWeek.setHours(0, 0, 0, 0);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 7);

            let weekOrders = await order.aggregate([{
                $match: {
                    status: 'placed',
                    createdAt: {
                        $gte: startOfWeek,
                        $lt: endOfWeek
                    }
                }
            },
            {
                $count: 'orderCount'
            }])
            console.log(weekOrders);

            // Get the start and end dates for the previous week
            const startOfLastWeek = new Date(startOfWeek);
            startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

            const endOfLastWeek = new Date(endOfWeek);
            endOfLastWeek.setDate(endOfLastWeek.getDate() - 7);
            // Use the aggregation framework to count orders placed in the previous week
            let previousWeekOrders = await order.aggregate([
                {
                    $match: {
                        status: 'placed',
                        createdAt: {
                            $gte: startOfLastWeek,
                            $lt: endOfLastWeek
                        }
                    }
                },
                {
                    $count: 'orderCount'
                }
            ]);

            // Calculate the percentage change in order count
            const currentCount = weekOrders.length > 0 ? weekOrders[0].orderCount : 0;
            const previousCount = previousWeekOrders.length > 0 ? previousWeekOrders[0].orderCount : 0;

            const percentageChange = ((currentCount - previousCount) / previousCount) * 100;
            /* weekRevenue */
            let weekRevenueData = await weekRevenue()
            console.log(weekRevenueData, 'return');
            let revenueWeek = weekRevenueData.weekRevenue[0].totalAmount
            let revenuepercentage = weekRevenueData.RevenueChangeFormatted

            /* totalRevenueinMonth */
            let totalAmountByMonth = await totalRevenueMonth()

            /* weekIncome */
            let weekIncome = await weekIncomes()
            console.log(weekIncome);
            let incomeWeek = weekIncome.weekIncome[0].totalAmount
            let incomepercentage = weekIncome.incomeChangeFormatted

            /* totalMonthOrder */

            let totalMonthOrder = await monthTotalOrder()

            /* totalIncomeMonth */
            let totalIncomeByMonth = await totalIncomeMonth()

            resolve({ States, orderCount: weekOrders[0].orderCount, percentageChange, revenueWeek, revenuepercentage, totalAmountByMonth, incomeWeek, incomepercentage, totalMonthOrder,totalIncomeByMonth })
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
        return new Promise(async (resolve, reject) => {
            let { couponName, discount, expiryDate, minPurchase } = couponData
            let couponCode = await generateCouponCode(expiryDate + couponName)
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
        return new Promise(async (resolve, reject) => {
            let getCoupons = await coupon.find({})
            resolve(getCoupons)

        })
    },
    doSalesByStateMonth(monthData) {

        let month = Number(monthData.month)
        return new Promise(async (resolve, reject) => {
            const startOfMonth = new Date(2023, month, 1);
            const endOfMonth = new Date(2023, month + 1, 1);
            let States = await order.aggregate([{
                $match: {
                    status: 'placed'
                    , createdAt: {
                        $gte: startOfMonth,
                        $lt: endOfMonth,
                    },
                }
            },
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
            console.log(States);
            resolve(States)
        })
    },
}

function generateCouponCode(data) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + data;
    let code = '';

    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
    }

    return code;
}

async function weekRevenue() {

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    let weekRevenue = await order.aggregate([{
        $match: {
            status: 'placed',
            createdAt: {
                $gte: startOfWeek,
                $lt: endOfWeek
            }
        }
    },
    {
        $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" }
        }
    }])


    // Get the start and end dates for the previous week
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const endOfLastWeek = new Date(endOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 7);
    // Use the aggregation framework to count orders placed in the previous week
    let previousWeekRevenue = await order.aggregate([
        {
            $match: {
                status: 'placed',
                createdAt: {
                    $gte: startOfLastWeek,
                    $lt: endOfLastWeek
                }
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" }
            }
        }
    ]);

    // Calculate the percentage change in order count
    const currentRevenue = weekRevenue.length > 0 ? weekRevenue[0].totalAmount : 0;
    const previousRevenue = previousWeekRevenue.length > 0 ? previousWeekRevenue[0].totalAmount : 0;

    const RevenueChange = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    const RevenueChangeFormatted = RevenueChange.toFixed(2);
    console.log(weekRevenue, RevenueChangeFormatted);
    return ({ weekRevenue, RevenueChangeFormatted })
}

async function totalRevenueMonth() {
    let totalAmountByMonth = await order.aggregate([
        {
            $match: {
                status: 'placed'
            }
        }, {
            $group: {
                _id: null,
                jan: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 1] }, '$totalAmount', 0] } },
                feb: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 2] }, '$totalAmount', 0] } },
                mar: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 3] }, '$totalAmount', 0] } },
                apr: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 4] }, '$totalAmount', 0] } },
                may: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 5] }, '$totalAmount', 0] } },
                jun: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 6] }, '$totalAmount', 0] } },
                jul: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 7] }, '$totalAmount', 0] } },
                aug: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 8] }, '$totalAmount', 0] } },
                sep: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 9] }, '$totalAmount', 0] } },
                oct: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 10] }, '$totalAmount', 0] } },
                nov: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 11] }, '$totalAmount', 0] } },
                dec: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 12] }, '$totalAmount', 0] } },
            }
        }
    ]);
    return totalAmountByMonth
    console.log(totalAmountByMonth);
}


async function weekIncomes() {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    let weekIncome = await order.aggregate([{
        $match: {
            createdAt: {
                $gte: startOfWeek,
                $lt: endOfWeek
            }
        }
    },
    {
        $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" }
        }
    }])


    // Get the start and end dates for the previous week
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const endOfLastWeek = new Date(endOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 7);
    // Use the aggregation framework to count orders placed in the previous week
    let previousWeekIncome = await order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfLastWeek,
                    $lt: endOfLastWeek
                }
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" }
            }
        }
    ]);

    // Calculate the percentage change in order count
    const currentIncome = weekIncome.length > 0 ? weekIncome[0].totalAmount : 0;
    const previousIncome = previousWeekIncome.length > 0 ? previousWeekIncome[0].totalAmount : 0;

    const incomeChange = ((currentIncome - previousIncome) / previousIncome) * 100;
    const incomeChangeFormatted = incomeChange.toFixed(2);
    console.log(weekIncome, incomeChangeFormatted);
    return ({ weekIncome, incomeChangeFormatted })
}

async function monthTotalOrder() {


    let monthOrder = await order.aggregate([
        {
            $match: {
                status: 'placed'
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                month: "$_id",
                count: 1
            }
        },
        {
            $group: {
                _id: null,
                jan: { $sum: { $cond: [{ $eq: ["$month", 1] }, "$count", 0] } },
                feb: { $sum: { $cond: [{ $eq: ["$month", 2] }, "$count", 0] } },
                mar: { $sum: { $cond: [{ $eq: ["$month", 3] }, "$count", 0] } },
                apr: { $sum: { $cond: [{ $eq: ["$month", 4] }, "$count", 0] } },
                may: { $sum: { $cond: [{ $eq: ["$month", 5] }, "$count", 0] } },
                jun: { $sum: { $cond: [{ $eq: ["$month", 6] }, "$count", 0] } },
                jul: { $sum: { $cond: [{ $eq: ["$month", 7] }, "$count", 0] } },
                aug: { $sum: { $cond: [{ $eq: ["$month", 8] }, "$count", 0] } },
                sep: { $sum: { $cond: [{ $eq: ["$month", 9] }, "$count", 0] } },
                oct: { $sum: { $cond: [{ $eq: ["$month", 10] }, "$count", 0] } },
                nov: { $sum: { $cond: [{ $eq: ["$month", 11] }, "$count", 0] } },
                dec: { $sum: { $cond: [{ $eq: ["$month", 12] }, "$count", 0] } },
            }
        }
    ]);


    console.log(monthOrder);
    return monthOrder


}
async function totalIncomeMonth() {
    let totalIncomeByMonth = await order.aggregate([
        {
            $group: {
                _id: null,
                jan: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 1] }, '$totalAmount', 0] } },
                feb: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 2] }, '$totalAmount', 0] } },
                mar: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 3] }, '$totalAmount', 0] } },
                apr: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 4] }, '$totalAmount', 0] } },
                may: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 5] }, '$totalAmount', 0] } },
                jun: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 6] }, '$totalAmount', 0] } },
                jul: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 7] }, '$totalAmount', 0] } },
                aug: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 8] }, '$totalAmount', 0] } },
                sep: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 9] }, '$totalAmount', 0] } },
                oct: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 10] }, '$totalAmount', 0] } },
                nov: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 11] }, '$totalAmount', 0] } },
                dec: { $sum: { $cond: [{ $eq: [{ $month: '$createdAt' }, 12] }, '$totalAmount', 0] } },
            }
        }
    ]);
    return totalIncomeByMonth
    console.log(totalIncomeByMonth);
}
