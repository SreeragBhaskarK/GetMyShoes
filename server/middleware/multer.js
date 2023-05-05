
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/products_image')
    },
    /*  filename: function (req, file, cb) {
         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
         cb(null, file.fieldname + '-' + uniqueSuffix)
       } */
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)

    }
})
const bannerHeaderStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/users/images')
    },
    /*  filename: function (req, file, cb) {
         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
         cb(null, file.fieldname + '-' + uniqueSuffix)
       } */
    filename: function (req, file, cb) {
        return cb(null, 'hero-banner.png')

    }
})
const upload = multer({ storage: storage })
const bannerHeaderImage =multer({ storage: bannerHeaderStorage })
module.exports = {upload,bannerHeaderImage}