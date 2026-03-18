const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async(req,res,next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1]; //Bearer word ko remove karke store karega

            //decoding token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET); //token ko verify karega
            req.user = await User.findById(decoded.id).select("-password"); //finding the user and return without "-password"

            next(); //passing to the next function
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }

    if(!token){
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});

module.exports = { protect };

