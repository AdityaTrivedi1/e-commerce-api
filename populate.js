const products = require('./products.json')
const Product = require('./models/product')

const populate = async () => {
    await Product.deleteMany({})
    await Product.create(products)
    console.log('Dummy products added')
}

module.exports = populate
