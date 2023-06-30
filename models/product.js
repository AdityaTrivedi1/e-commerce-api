const mongoose = require('mongoose')
const validator = require('validator')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        maxLength: 1000,
    },
    boughtYear: {
        type: Number,
        required: true,
        min: 2000,
        validate: {
            validator: async (year) => {
                return (year<=(new Date(Date.now()).getFullYear()))
            },
            message: 'Please provide a year less than or equal to current year'
        }
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    brand: {
        type: String,
        required: true,
        maxLength: 100
    }
}, {timestamps: true})

productSchema.pre('deleteOne', {document: true, query: false}, async function() {
    await this.model('cart').updateMany( { 
        products: {
            '$all': [ { _id: this._id, name: this.name, price: this.price } ] 
        } 
    }, { 
        '$pull': { products: { _id: this._id, name: this.name, price: this.price } }, 
        '$inc': { noOfProducts: -1, totalPrice: -this.price } 
    } )
})

module.exports = mongoose.model('product', productSchema)
