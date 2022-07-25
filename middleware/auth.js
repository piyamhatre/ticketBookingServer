const jwt = require("jsonwebtoken")

const User=require('../models/users')

const authenticate=async (req, res, next)=>{
try{
    const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send("A token is required for authentication");
      }
      console.log("get token ",token)
    // const token = req.cookies.jwtToken
    const verifyToken= jwt.verify(token, process.env.SECRET_KEY);
    console.log("verify token ", verifyToken)
    const rootUser= await User.findOne({_id:verifyToken._id})
    if(!rootUser){
        throw new Error("USER NOT FOUND")
    }
    req.token=token
    req.rootUser=rootUser
    req.userId= rootUser._id

    next();

}catch(err){
    console.log(err)
    res.status(401).send("unautorized")
}
}

module.exports= authenticate