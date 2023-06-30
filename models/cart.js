const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        ref: 'product',
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    }
})

const cartSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: [true, 'Please provide _id for cart']
    },
    name: {
        type: String,
        required: [true, 'Please provide name'],
        trim: true,
        minLength: 3,
        maxLength: 50
    },
    noOfProducts: {
        type: Number,
    },
    totalPrice: {
        type: Number,
    },
    products: {
        type: [productSchema],
        default: []
    }
})

module.exports = mongoose.model('cart', cartSchema)
