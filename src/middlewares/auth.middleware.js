
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // dekho web app m token req.cookies m rehta hai but mobile app and api me req.header m rhta hai but kis form mr hta hai 
        // Authorization: Bearer abcd123
        // The replace("Bearer ", "") part removes the "Bearer " prefix, leaving only the token (abcd123).this ensures we only extract the actual token.
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        // ab JWT ko use krke verify krnege ki ahi token hai ya nhi to token m access token secret rhta hai to 
        // usko comapre kr liye 
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log(decodedToken) // decodedtoken m pura documnet aa gya 
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        //ab uss document ki id se usko seafch kiye and usko req m dal diye ab usko logout m use kr skte hai but 
        // hum refresh and access token pass nhi kr rhe req me  
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})
