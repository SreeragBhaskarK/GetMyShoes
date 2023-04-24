let coupon = require('../../models/coupon')
const couponExpire = async (req, res, next) => {

    const now = new Date();
    const coupons = await coupon.updateMany({
        expiryDate: { $lte: now },
        status: 'active'
    }, {
        $set: {
            status: 'expired'
        }

    });

    const couponsUpdate = await coupon.updateMany({
        expiryDate: { $gte: now },
        status: 'expired'
    }, {
        $set: {
            status: 'active'
        }

    });
  
  next()

}


module.exports = couponExpire