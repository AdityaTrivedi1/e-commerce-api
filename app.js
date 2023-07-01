require('dotenv').config()
require('express-async-errors')
const populate = require('./populate')

const express = require('express')
const app = express()

// packages
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

// security packages
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

// swagger ui
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

// connect to db
const connectDB = require('./db/connectDB')

// routers
const authRouter = require('./routes/authRoutes')
const productRouter = require('./routes/productRoutes')
const cartRouter = require('./routes/cartRoutes')

// error handling
const notFound = require('./middleware/notFound')
const customErrorHandler = require('./middleware/customErrorHandler')

app.set('trust proxy', 1)
app.use(rateLimiter({
    windowMs: 60 * 1000,
    max: 30
}))


app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

app.use(express.json())
// app.use(express.static('./public'))
// app.use(morgan('tiny'))
app.use(cookieParser(process.env.JWT_SECRET))

app.get('/', (req, res) => {
    res.status(200).send('<h1>E-Commerce API</h1><p>Click the link below to read about the services offered by this api and try it out.<p><p>To send requests to api, click on any route, click on try it out, add data to body if required then click on execute.<p><p>Check for response in response body displayed.<p><a href="/api-docs">Documentation</a>')
})

// routes
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/product', productRouter)
app.use('/api/v1/cart', cartRouter)

// error hanlders
app.use(notFound)
app.use(customErrorHandler)

const port = process.env.PORT || 3000

const start = async () => {
    try {
        await connectDB(process.env.JWT_SECRET)
        // await populate() 
        app.listen(port, console.log(`Server is listening on ${port}...`))
    } catch (error) {
        console.log('Unable to start server')
        console.log(error)
    }
}

start()
