const {
    getAllProducts,
    getUserProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    search
} = require("../controllers/productController");
  
const authenticate = require('../middleware/authenticate')

const express = require('express')
const router = express.Router()

router.route('/').get(getAllProducts).post(authenticate, createProduct)
router.get('/search', search)
router.get('/my-products', authenticate, getUserProducts)
router.route('/:id').get(getSingleProduct).patch(authenticate, updateProduct).delete(authenticate, deleteProduct)

module.exports = router
