const User = require('../models/user')
const {StatusCodes} = require('http-status-codes')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const register = async (req, res) => {
    const {email, name, password} = req.body
    if (!email || !name || !password) {
        return res.status(StatusCodes.BAD_REQUEST).send('Please provide name, email and password')
    }
    if (await User.findOne({email})) {
        return res.status(StatusCodes.BAD_REQUEST).send('email already exists')
    }
    const user = await User.create({email, name, password})
    res.status(StatusCodes.CREATED).json({msg:'User account created', user: {email, name}})
}
const login = async (req, res) => {
    const {email, password} = req.body
    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).send('Please provide both email and password')
    }
    const user = await User.findOne({email})
    if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).send('Invalid credentials')
    }
    const isPasswordCorrect = await user.compare(password)
    if (!isPasswordCorrect) {
        return res.status(StatusCodes.UNAUTHORIZED).send('Invalid credentials')
    }
    const token = jwt.sign({email}, process.env.JWT_SECRET)
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        expires: new Date(Date.now()+(1000*60*60))
    })
    res.status(StatusCodes.OK).json({msg:'User logged in', user: {name:user.name, email: user.email}})
}
const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.status(StatusCodes.OK).send('User logged out')
}
const deleteAccount = async (req, res) => {
    console.log('Hello')
    const {email} = req.user
    const user = await User.findOne({email})
    // Is it necesary to check user in database? No
    if (!user) {
        throw new Error('Invalid credentials')
    }
    await user.deleteOne()
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.status(StatusCodes.OK).json({msg: 'User account deleted', user: {name: user.name, email: user.email}})
}

module.exports = {
    register,
    login,
    logout,
    deleteAccount
}
