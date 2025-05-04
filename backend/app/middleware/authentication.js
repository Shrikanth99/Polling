const jwt = require('jsonwebtoken');
const User = require('../models/User')

const authenticateUser = async(req,res,next) => {
    let token = req.headers.authorization?.split(" ")[1];
    try {
        if(!token){
            return res.status(401).json({message : 'Authentication Failed'})
        }
        const tokenData = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(tokenData.id).select('-password');
        next()
        
    } catch (e) {
        res.status(401).json({ message : 'Authentication Failed' })
    }
}

module.exports = authenticateUser
