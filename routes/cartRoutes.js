const authenticate = require('../middleware/authenticate')

const {getUserCart, addProductToCart, deleteProductFromCart} = require('../controllers/cartController')

const express = require('express')
const router = express.Router()

router.get('/', authenticate, getUserCart)

router.route('/:id').post(authenticate, addProductToCart).delete(authenticate, deleteProductFromCart)

module.exports = router
