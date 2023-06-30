const jwt = require('jsonwebtoken')
const {StatusCodes} = require('http-status-codes')

const authenticate = async (req, res, next) => {
    const {token} = req.signedCookies
    try {
        const {email} = jwt.verify(token, process.env.JWT_SECRET)
        // console.log(email)
        req.user = {email}
        next()
    } catch (error) {
        res.status(StatusCodes.UNAUTHORIZED).json({msg: 'User is either not logged in or unauthorized'})
    }
    // console.log('Hello')
}

module.exports = authenticate
