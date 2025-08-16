import jwt from "jsonwebtoken";
import User from "../models/User.js";


//Middleware to protect Routes
export const protectRoute =async(req, res, next) =>{
    try {
    const token = req.headers.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decode.userId).select("-password")

    if(!user){
        return res.json({success: false, messsage: "User not found"})
    }
    req.user = user;
    next()  
    } catch (error) {
        console.log(error.messsage)
        res.json({success: false, messsage: error.messsage})
    }
    
}