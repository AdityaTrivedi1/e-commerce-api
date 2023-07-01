const { StatusCodes } = require('http-status-codes')
const Product = require('../models/product')
const User = require('../models/user')
const mongoose = require('mongoose')

const getAllProducts = async (req, res) => {
    const products = await Product.find({}).populate('owner').sort('-createdAt')
    products.map((product) => {
        const {name, email} = product.owner
        product.owner = {name, email}
    })
    res.status(StatusCodes.OK).json({products, count: products.length})
}
const getUserProducts = async (req, res) => {
    const {email} = req.user
    const user = await User.findOne({email})
    const products = await Product.find({owner: user._id})
    res.status(StatusCodes.OK).json({products, count: products.length})
}
const createProduct = async (req, res) => {
    const {name, price, boughtYear, brand, description} = req.body
    if (!name || !price || !boughtYear || !brand) {
        res.send('Please provide name, price, bought year and brand of product')
    }
    if (boughtYear>new Date(Date.now()).getFullYear()) {
        res.status(StatusCodes.BAD_REQUEST).send('Please provide a year less than or equal to current year')
    }
    const {email} = req.user
    const user = await User.findOne({email})
    const product = await Product.create({name, price, description, brand, boughtYear, owner: user._id})
    res.status(StatusCodes.CREATED).json({msg: 'Product created', product: {name, price, description, brand, boughtYear}})
}
const updateProduct = async (req, res) => {
    const {id} = req.params
    let product = await Product.findOne({_id: id})
    if (!product) {
        res.status(StatusCodes.NOT_FOUND).send(`No product exists with id ${id}`)
    }
    const productOwner = await User.findOne({_id: product.owner})
    const {email} = req.user
    if (productOwner.email!==email) {
        return res.status(StatusCodes.UNAUTHORIZED).send('Product can only be updated by their owners')
    }
    product = await Product.findOneAndUpdate({_id: id}, req.body, {
        new: true,
        runValidators: true
    })
    res.status(StatusCodes.OK).json({msg:"product updated", product})
}
const deleteProduct = async (req, res) => {
    const {id} = req.params
    let product = await Product.findOne({_id: id})
    if (!product) {
        return res.status(StatusCodes.NOT_FOUND).send(`No product with id ${id}`)
    }
    const productOwner = await User.findOne({_id: product.owner})
    const {email} = req.user
    // _ids cannot be directly compared
    if (productOwner.email!==email) {
        return res.status(StatusCodes.UNAUTHORIZED).send('Product can only be deleted by their owners')
    }
    // await Product.findOneAndDelete({_id: id})
    await product.deleteOne()
    res.status(StatusCodes.OK).json({msg: 'product deleted', product})
}
const getSingleProduct = async (req, res) => {
    const {id} = req.params
    let product = await Product.findOne({_id: id}).populate('owner')
    if (product) {
        const {name, email} = product.owner
        product.owner = {name, email}
    } else {
        return res.status(StatusCodes.NOT_FOUND).send(`No product with id ${id}`)
    }
    res.status(StatusCodes.OK).json({product})
}
const search = async (req, res) => {
    const {name, brand, description, owner, sort, price, boughtYear, select} = req.query
    let {page, limit} = req.query
    const query = {}

    if (name) {
        query.name = { $regex: name, $options: 'i'}
    }
    if (brand) {
        query.brand = { $regex: brand, $options: 'i'}
    }
    if (owner) {
        query.owner = new mongoose.Types.ObjectId(owner)
    }
    if (description) {
        query.description = { $regex: description, $options: 'i'}
    }

    // xss-clean changes '<' symbol to '&lt;' in req.query
    const operatorMap = {
        '<': '$lt',
        '<=': '$lte',
        '>': '$gt',
        '>=': '$gte',
        '&lt;': '$lt',
        '&lt;=': '$lte'
    }
    const regex = /(<|<=|>|>=|&lt;|&lt;=)\b/g

    if (price) {
        query.price = await map('price', regex, operatorMap, price)
    }
    if (boughtYear) {
        query.boughtYear = await map('boughtYear', regex, operatorMap, boughtYear)
    }

    let result = Product.find(query)
    if (sort) {
        const sortOrder = sort.split(',').join(' ')
        result = result.sort(sortOrder)
    } else {
        result = result.sort('-createdAt')
    }

    if (select) {
        const projection = select.split(',').join(' ')
        result = result.select(projection)
    }

    page = Number(page) || 1
    limit = Number(limit) || 10
    const skip = (page - 1) * limit
    result = result.skip(skip).limit(limit)

    const products = await result
    res.status(StatusCodes.OK).json({count: products.length, products})
}

const map = async (field, regex, operatorMap, filter) => {
    let query = {}

    // console.log(filter)
    let filters = filter.replace(regex, (operator) => `${operatorMap[operator]}-`)

    // console.log(filters)

    filters.split(',').forEach((singleFilter) => {
        const [operator, value] = singleFilter.split('-')
        // console.log(operator, value)
        query[operator] = Number(value)
    })

    return query
}

module.exports = {
    getAllProducts,
    getUserProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getSingleProduct,
    search
}