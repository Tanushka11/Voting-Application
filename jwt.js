const jwt = require('jsonwebtoken');


const jwtAuthMiddileware = (req,res,next) =>{

    // check if request header has authorization token or not
    const authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({error: 'Token not found'});
    // extract the jwt token from request headers
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error: 'unauthorized'});
    try{
        // verify the jwt token
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       // attach user information to user object

       req.user = decoded;
       next();
    }
    catch(err){
        console.error(err);
        res.status(401).json({error : 'Invalid token'})
    }
}

// functiom to generate jwt token

const generateToken = (userData) =>{
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: 300000});
}


module.exports = {jwtAuthMiddileware, generateToken }