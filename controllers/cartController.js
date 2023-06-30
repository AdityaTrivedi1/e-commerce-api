const User = require('../models/user')
const Product = require('../models/product')
const Cart = require('../models/cart')
const { StatusCodes } = require('http-status-codes')
const mongoose = require('mongoose')


const getUserCart = async (req, res) => {
    const {email} = req.user
    const user = await User.findOne({email})
    const cart = await Cart.findOne({_id: user._id})
    res.status(StatusCodes.OK).json({msg: 'OK', cart})
}

const addProductToCart = async (req, res) => {
    const {user: {email}, params: {id:productId}} = req

    const product = await Product.findOne({_id: productId})
    if (!product) {
        return res.status(StatusCodes.BAD_REQUEST).send(`No product exists with _id ${productId}`)
    }
    const owner = await User.findOne({_id: product.owner})
    const user = await User.findOne({email})

    if (owner.email === email) {
        return res.status(StatusCodes.BAD_REQUEST).send('A user cannot add their own product to cart')
    }

    if ( await Cart.findOne( { _id: user._id, products: { '$all': [ { _id: productId, name: product.name, price: product.price } ] } } ) ) {
        return res.status(StatusCodes.BAD_REQUEST).send('Product already exists in the cart')
    }

    const cart = await Cart.findOneAndUpdate( { _id: user._id }, { 
        '$push': { products: { _id: productId, name: product.name, price: product.price } }, 
        '$inc': { noOfProducts: 1, totalPrice: product.price } 
    }, {
        new: true,
        runValidators: true
    })

    res.status(StatusCodes.CREATED).json({msg: 'Product successfully added to cart', cart})
}

const deleteProductFromCart = async (req, res) => {
    const {user: {email}, params: {id:productId}} = req

    const product = await Product.findOne({_id: productId})
    if (!product) {
        return res.status(StatusCodes.BAD_REQUEST).send(`No product exists with _id ${productId}`)
    }
    const owner = await User.findOne({_id: product.owner})
    const user = await User.findOne({email})

    if (! await Cart.findOne( { _id: user._id, products: { '$all': [ { _id: productId, name: product.name, price: product.price } ] } } ) ) {
        return res.status(StatusCodes.BAD_REQUEST).send('Product does not exist in cart')
    }

    const cart = await Cart.findOneAndUpdate( { _id: user._id }, { 
        '$pull': { products: { _id: productId, name: product.name, price: product.price } }, 
        '$inc': { noOfProducts: -1, totalPrice: -product.price } 
    }, { 
        new: true, runValidators: true 
    } )

    return res.status(StatusCodes.OK).json({msg: 'Product deleted succesfully', cart})
}

module.exports = {
    getUserCart,
    addProductToCart,
    deleteProductFromCart
}
