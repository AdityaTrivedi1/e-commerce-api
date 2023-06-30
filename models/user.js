const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        trim: true,
        minLength: 3,
        maxLength: 50
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minLength: 6,
        maxLength: 100
    }
})

userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return
    }
    // console.log(`Hashing password for ${this.name}`)
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
}, {timestamps: true})

userSchema.pre('save', async function() {
    const cart = await this.model('cart').findOne({_id: this._id})
    if (cart) {
        return
    }
    await this.model('cart').create({_id: this._id, name: this.name, products: []})
}, {timestamps: true})

userSchema.pre('deleteOne', {document: true, query: false}, async function() {
    // console.log(`Removing proucts for ${this.name}`)
    // await this.model('product').deleteMany({owner: this._id})
    const product = await this.model('product').find({owner: this._id})
    for (const singleProduct of product) {
        await singleProduct.deleteOne()
    }
    await this.model('cart').deleteOne({_id: this._id})
})

userSchema.methods.compare = async function(password) {
    const isCorrect = await bcrypt.compare(password, this.password)
    return isCorrect
}

module.exports = mongoose.model('user', userSchema)

// 649ed446153da89561db4f35 Shivam
// 649ed45d153da89561db4f37 Rishabh
// 649ed494153da89561db4f39 Aditya


