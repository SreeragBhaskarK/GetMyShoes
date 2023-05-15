const { authenticateAdmin, deleteUser, statusUser, statusUserUnblock, addCategory, deleteCategory } = require("./controller")
const users = require("../../models/user")
const category = require("../../models/category")
const product = require("../../models/products")
const order = require("../../models/order")
const coupon = require("../../models/coupon")
const banner = require("../../models/banner")
const { ObjectId } = require("mongodb")
const fs = require('fs');
const xlsx = require('xlsx');
var path = require('path');
let ejs = require('ejs')
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

                let UserView = await users.find().sort({"createdAt": -1})
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
                let { category_type } = categoryData
                let categoryName = categoryData.category

                if (!category) throw Error("Empty category")
                let addCategory = new category({
                    category: categoryName,
                    category_type: category_type

                })

                await addCategory.save()

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
                let categorys = await category.find().sort({"createdAt": -1})
                if (!categorys) throw Error("Empty category")

                resolve({ port: 200, categorys })

            } catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)

            }
        })

    }, doCategoryDelete(categoryId) {
        return new Promise(async (resolve, reject) => {

            try {
                let productId = await category.find({ _id: categoryId })

                if (!productId) throw Error("Empty products")

            
                if (productId[0].category_type != 'parent') {
                    await category.deleteOne({ _id: new ObjectId(categoryId) })
                }

                resolve()
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    doCategoryEdit(categoryId) {
        return new Promise(async (resolve, reject) => {
            try {
                let categoryData = await category.find({ _id: new ObjectId(categoryId) })

                if (!categoryData) throw Error("Empty products")


                resolve(categoryData)
            }
            catch (error) {
                let err = { port: 400, message: error.message }
                resolve(err)
            }
        })
    },
    doCategoryUpdate(categoryId, categoryUpdate) {
        return new Promise(async (resolve, reject) => {

            try {
                let categoryData = await category.find({ _id: new ObjectId(categoryId) })

                if (!categoryData) throw Error("Empty user")
          
                let status = await category.updateOne({ _id: new ObjectId(categoryId) },
                    {
                        $set: {

                            category: categoryUpdate.category,
                            category_type: categoryUpdate.category_type
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
            }, { "$sort": { "createdAt": -1 } }])

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

            let percentageChange = ((currentCount - previousCount) / previousCount) * 100;
            percentageChange = percentageChange.toFixed(2)
            /* weekRevenue */
            let weekRevenueData = await weekRevenue()
          
            let revenueWeek = weekRevenueData.weekRevenue[0]?.totalAmount ?? 0
            let revenuepercentage = weekRevenueData.RevenueChangeFormatted

            /* totalRevenueinMonth */
            let totalAmountByMonth = await totalRevenueMonth()

            /* weekIncome */
            let weekIncome = await weekIncomes()
  
            let incomeWeek = weekIncome.weekIncome[0]?.totalAmount ?? 0
            let incomepercentage = weekIncome.incomeChangeFormatted

            /* totalMonthOrder */

            let totalMonthOrder = await monthTotalOrder()

            /* totalIncomeMonth */
            let totalIncomeByMonth = await totalIncomeMonth()

            /* Category Sales */
            let cateagorySalesMonth = await totalcategorySalesMonth()

            /* Users */
            let weekUsers = await totalWeekUsers()

            resolve({ States, orderCount: weekOrders[0]?.orderCount ?? 0, percentageChange, revenueWeek, revenuepercentage, totalAmountByMonth, incomeWeek, incomepercentage, totalMonthOrder, totalIncomeByMonth, weekUsers })
        })
    }, getOrder() {
        return new Promise(async (resolve, reject) => {

            let orderData = await order.aggregate([{
                $addFields: {
                    productsData: {
                        $ifNull: ['$products.products', []]
                    }
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
            }, {
                $addFields: {
                    productInfo: {
                        $map: {
                            input: "$productInfo",
                            as: "product",
                            in: {
                                $mergeObjects: [
                                    "$$product",
                                    {
                                        quantity: {
                                            $arrayElemAt: [
                                                "$productsData.quantity",
                                                {
                                                    $indexOfArray: [
                                                        "$productsData.item",
                                                        "$$product._id"
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { "$sort": { "createdAt": -1 } }
            ]).catch(error => {
                
            })
   

            resolve(orderData)
        })
    },
    generateCoupon(couponData) {
        return new Promise(async (resolve, reject) => {
            let { couponName, discount, expiryDate, minPurchase, coupon_description } = couponData
            let couponCode = await generateCouponCode(expiryDate + couponName)

            let couponAdd = new coupon({
                couponName: couponName,
                discount: discount,
                expiryDate: expiryDate,
                minPurchase: minPurchase,
                code: couponCode,
                coupon_description: coupon_description,
                status: 'active'
            })
            couponAdd.save()
            resolve()

        })
    },
    getCopons() {
        return new Promise(async (resolve, reject) => {
            let getCoupons = await coupon.find({}).sort({"createdAt": -1})
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
     
            resolve(States)
        })
    },
    dototalRevenue(totalRevenue) {
        return new Promise(async (resolve, reject) => {
            if (totalRevenue.totalFilter == 'year') {
                let totalRevenue = await totalRevenueYear()
                resolve({ totalRevenue, name: 'year' })
            } else if (totalRevenue.totalFilter == 'month') {
                let totalRevenue = await totalRevenueMonth()
                resolve({ totalRevenue, name: 'month' })
            } else if (totalRevenue.totalFilter == 'week') {
                let totalRevenue = await totalRevenueWeek()
                resolve({ totalRevenue, name: 'week' })

            }

        })
    },
    totalCategorySales(CategorySales) {
        return new Promise(async (resolve, reject) => {
            if (CategorySales.categorySales == 'year') {
                let categorySales = await totalcategorySalesYear()
                resolve({ categorySales, name: 'year' })
            } else if (CategorySales.categorySales == 'month') {
                let categorySales = await totalcategorySalesMonth()
                resolve({ categorySales, name: 'month' })
            } else if (CategorySales.categorySales == 'week') {
                let categorySales = await totalcategorySalesWeek()
                resolve({ categorySales, name: 'week' })

            }

        })
    },
    doCouponUpdate(couponData) {
        return new Promise(async (resolve, reject) => {

            let { couponName, discount, expiryDate, minPurchase, coupon_description, couponId } = couponData
            await coupon.updateOne({ _id: new ObjectId(couponId) }, {
                $set: {
                    couponName: couponName,
                    discount: discount,
                    expiryDate: expiryDate,
                    minPurchase: minPurchase,
                    coupon_description: coupon_description,
                }

            })
      
            resolve()
        })
    },
    updateShippingStatus(orderData) {
        return new Promise(async (resolve, reject) => {

            let { orderId, shippingStatus } = orderData
            let result = await order.updateOne({ _id: new ObjectId(orderId), status: 'placed' },
                {
                    $set: {
                        shipping_status: shippingStatus
                    }

                })
   
            resolve()
        })
    }
    ,
    getSalesData() {
        return new Promise(async (resolve, reject) => {

            let salesReport = await order.aggregate([{
                $match: {
                    status: 'placed'
                }
            }, {
                $unwind: '$products.products'
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'products.products.item',
                    foreignField: '_id',
                    as: 'productsData'
                }
            }, {
                $addFields: {
                    productTotal: {
                        $multiply: [
                            '$products.products.quantity',
                            { $arrayElemAt: ['$productsData.product_price', 0] }
                        ]
                    }
                }
            }, { "$sort": { "createdAt": -1 } }])


            resolve(salesReport)
        })
    },

    getSalesReportPDF() {
        return new Promise(async (resolve, reject) => {
            let salesReport = await module.exports.getSalesData()
            let salesData = await salesReportPDF(salesReport)
            resolve(salesData)
        })
    },
    getSalesReportExcel() {
        return new Promise(async (resolve, reject) => {
            let salesReport = await module.exports.getSalesData()
            let salesData = await salesReportExcel(salesReport)
            resolve(salesData)
        })
    },
    /* checking categoriey */
    checkCategory(categoryNameData) {
        return new Promise(async (resolve, reject) => {
            let categoryName = categoryNameData.category
            let categoryData = await category.find({ category: categoryName.toLowerCase() })
          
            if (categoryData.length == 1) {
   
                reject(new Error('already declare category!'));
                return
            }
            resolve({ status: true })
        }).catch(error => {
         
            throw error
        })
    },
    getBanner() {
        return new Promise(async (resolve, reject) => {
            let bannerHeader = await banner.find()
      
            resolve(bannerHeader)
        })
    },
    updateBanner(headerData, image) {
        return new Promise(async (resolve, reject) => {
            let headerImage = image.filename
            const { header_title, header_title_strong, header_description, header_link } = headerData
            let updateBannerHeader = await banner.updateOne({
                header: [
                    {
                        title: header_title,
                        title_strong: header_title_strong,
                        description: header_description,
                        shop_link: header_link,
                        header_img: headerImage

                    }
                ]

            })
    
            resolve({ status: true })
        }).catch(error => {
            throw error
        })
    },
    updateBannerMain(mainData, images) {
        let image = images.map(file => file.filename)
        return new Promise(async (resolve, reject) => {
            const { main_left_title, main_left_description, main_left_link, main_right_title, main_right_description, main_right_link } = mainData
            let updateBannerMain = await banner.updateOne({
                main: [
                    {
                        left_title: main_left_title,
                        left_description: main_left_description,
                        shop_link_left: main_left_link,
                        main_image: image,
                        right_title: main_right_title,
                        right_description: main_right_description,
                        shop_link_right: main_right_link
                    }
                ]

            })
   
            resolve({ status: true })
        }).catch(error => {
            throw error
        })
    },
    updateBannerSpecial(specialData, image) {
        return new Promise(async (resolve, reject) => {
            const { special_title, special_link } = specialData
            let specialImage = image.filename
            let updateBannerSpecial = await banner.updateOne({
                special: [
                    {
                        title: special_title,
                        shop_link: special_link,
                        special_img: specialImage
                    }
                ]

            })
       
            resolve({ status: true })
        }).catch(error => {
            throw error
        })
    }
}

function salesReportPDF(salesReport) {

    let filePathName = path.resolve(__dirname, '../../views/admin/sales_report.ejs')
    let htmlString = fs.readFileSync(filePathName).toString()
    htmlString += `
    <style>
        body {
            text-align: center;
            font-size: 50%;
        }
        td{
            font-size: 70%;  
        }
        th{
            font-size: 70%;  
        }
        .table {
            margin: 0 auto;
            width: 100%;
        }
        th, td {
            border: 1px solid black;
            padding: 5px;
        }
    </style>
`
    let options = {
        format: 'A4',
        orientation: "portrait",
        border: '10mm',
        /* margins: {
            top: 150,
            bottom: 60,
            left: 40,
            right: 40,
            width: 800
        } */
    }
    let ejsData = ejs.render(htmlString, { salesReport, noButton: true })

    return { options, ejsData }


}
function salesReportExcel(salesReport) {



    const salesSheet = xlsx.utils.json_to_sheet(
        salesReport.map(({ createdAt, products: { products }, productTotal, paymentMethod, status, shipping_status }) => ({
            createdAt,
            item: products.item,
            quantity: products.quantity,
            productTotal,
            tax: (productTotal / 100) * 10,
            paymentMethod,
            status,
            shipping_status
        }))
    );

    // Add table header
    const header = ['Date of Order', 'Order Item Id', 'Quantity', 'Amount', 'Tax', 'Mode of Payment', 'Payment Status', 'Order Status'];
    xlsx.utils.sheet_add_aoa(salesSheet, [header], { origin: 'A1' });
    salesSheet['!cols'] = [{ width: 12 }, { width: 25 }, { width: 8 }, { width: 10 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 22 }];
    // Add table body rows

    const rows = salesReport.map(sale => [
        sale.createdAt, '#' + sale.products.products.item.toString(), sale.products.products.quantity, '₹ ' + sale.productTotal, '₹ ' + (tax = (sale.productTotal / 100) * 10).toFixed(2), sale.paymentMethod, sale.status, sale.shipping_status]);
    xlsx.utils.sheet_add_aoa(salesSheet, rows, { origin: 'A2' });

    // Create a new workbook and add the sales sheet to it
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, salesSheet, 'Sales Report');

    // Write the workbook to a file
    xlsx.writeFile(workbook, 'sales_report.xlsx');


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
  
    return ({ weekRevenue, RevenueChangeFormatted })



}
async function totalWeekUsers() {

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    let weekUsers = await users.aggregate([{
        $match: {
            status: {

                $ne: 'process'
            },
            createdAt: {
                $gte: startOfWeek,
                $lt: endOfWeek
            }

        }
    },
    {
        $count: 'userCount'
    }])


    // Get the start and end dates for the previous week
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const endOfLastWeek = new Date(endOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 7);
    // Use the aggregation framework to count orders placed in the previous week
    let previousWeekUsers = await users.aggregate([{
        $match: {
            status: {

                $ne: 'process'
            },
            createdAt: {
                $gte: startOfLastWeek,
                $lt: endOfLastWeek
            }
        }
    },
    {
        $count: 'userCount'
    }])

    // Calculate the percentage change in users count
    const usersChange = ((weekUsers[0]?.userCount ?? 0 - previousWeekUsers[0]?.userCount ?? 0) / previousWeekUsers[0]?.userCount ?? 0) * 100;
    const usersChangeFormatted = usersChange.toFixed(2);

    let weekUsersCount = weekUsers[0]?.userCount ?? 0
    return ({ weekUsersCount, usersChangeFormatted })



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

}
async function totalRevenueYear() {
    let totalAmountByYear = await order.aggregate([
        {
            $match: {
                status: 'placed'
            }
        }, {
            $group: {
                _id: null,
                2021: { $sum: { $cond: [{ $eq: [{ $year: '$createdAt' }, 2021] }, '$totalAmount', 0] } },
                2022: { $sum: { $cond: [{ $eq: [{ $year: '$createdAt' }, 2022] }, '$totalAmount', 0] } },
                2023: { $sum: { $cond: [{ $eq: [{ $year: '$createdAt' }, 2023] }, '$totalAmount', 0] } },
                2024: { $sum: { $cond: [{ $eq: [{ $year: '$createdAt' }, 2024] }, '$totalAmount', 0] } },
                2025: { $sum: { $cond: [{ $eq: [{ $year: '$createdAt' }, 2025] }, '$totalAmount', 0] } },

            }
        }
    ]);

    let totalYearAmount = totalAmountByYear.length > 0 ? totalAmountByYear : [
        {
            '2021': 0,
            '2022': 0,
            '2023': 0,
            '2024': 0,
            '2025': 0,
            _id: null
        }
    ];

    return totalYearAmount

}
async function totalRevenueWeek() {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()), 23, 59, 59, 999);


    let totalAmountByWeek = await order.aggregate([
        {
            $match: {

                status: 'placed',
                createdAt: {
                    $gte: startOfWeek,
                    $lt: endOfWeek
                }
            }
        }, {
            $group: {
                _id: null,
                mon: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: '$createdAt' }, 1] }, '$totalAmount', 0] } },
                tue: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: '$createdAt' }, 2] }, '$totalAmount', 0] } },
                wed: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: '$createdAt' }, 3] }, '$totalAmount', 0] } },
                thu: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: '$createdAt' }, 4] }, '$totalAmount', 0] } },
                fri: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: '$createdAt' }, 5] }, '$totalAmount', 0] } },
                sat: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: '$createdAt' }, 6] }, '$totalAmount', 0] } },
                sun: { $sum: { $cond: [{ $eq: [{ $dayOfWeek: '$createdAt' }, 7] }, '$totalAmount', 0] } },

            }
        }
    ]);

    return totalAmountByWeek

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

}

async function totalcategorySalesMonth() {
    let totalCateagorySales = await order.aggregate([{
        $match: {
            status: 'placed'
        }
    }])


}
