import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId) // phle id liye uss user k phir usko search kiye ab uss document
        //  ko use krke uspr dono function call kiye phir uss document k refreshtoken m usko dal diye 
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        // now ab user ko phirse save krna hoga as naya data dale hai but save krne waqt mongoose check krta hai 
        // ki sara filed hai ya nhi but hum yhn ek hi chiz update kiye hai to uske wjh se hum isko false kr dete 
        // hai to woh check nhi krta bss save kr deta hai yeh hum tab krte hai jab hum el field ko update krte 
        // hai 
        await user.save({ validateBeforeSave: false })
        // yeh aese krke  hum tab use krte hai jab hume update krna hoo kisi field m bss kisi field ko remove 
        // krna ho to unset use krte hai findbyandupdate yhn bhi use kr skte the but id phle hi nikl liye the 
        return {accessToken, refreshToken}
        // aur last m dono chiz return kr diye 

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    
    // 1. sbse phle user data liye 
    const {fullName, email, username, password } = req.body
    
    // 2. user data check kiye agr kuch missing hai return error now maybe agr input m sirf "  " aese kuch aa gya
    //  to uske liye hum trim use krte hai yeh start and end se phle koi sapce hai to usko hta deta hai to hamne 
    // sbse phle array bnaya and uspr yeh some function run kiya and kaise run kiya to check kiya agr trim lagne 
    // k bad woh empty hai to error return kr doo bss yhi ho gya jhn phla empty mila to wahi error 
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    // 3. verify kiye ki yeh user phle se register to nhi hum jo code likhe aese hum ek se colm pr lga skte hai 
    // operator like and or to hamne check kiya ki koi aesa hai jisme yeh emailid ya username same hai to return error
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    

    // 4. multer wala path nikale yeh aese hi ? lga kr use krna usse error nhi hota as maybe multer m kuch issue ho jaye so check krna jruri
    const avatarLocalPath = req.files?.avatar[0]?.path;
    
    // 5. coverImage k liye check agr kuch bhi false to usme undefined
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // 6. check for avatar as woh jruri file to agr umse bhi oath nhi aaya yani koi issue to mainly user side se
    //  issue soo hyeh error pass kiya
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    // 7.clodinary pr upload kiya and obj store kr liya
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // 8.agr cloudinary m kuch issue soo check kr liye
    if (!avatar) {
        throw new ApiError(400, "Cloudinary error")
    }
    // console.log(avatar)
   
    // 9. ab pura ek documnet bna kr databse m insert kr diye ab yhn pr hum password direct pass kr rhe but 
    // database m save hone se phle woh encrypt ho jaega bcse of pre hook and bcrypt
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })
    // 10. ab hum nhi chahte ki pura documnt user k pass response m pass kre to hum user direct pass nhi kiye uske
    //  id se document fetch kiye but use dcoument se password and refreshtoken remove kr diye 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    // 11. return response 
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie


    // 1.sbse phle humne user data liya from req.body
    const {email, username, password} = req.body
    console.log(email);
    // 2.phir humne verify kiya kii data hai ya nhi
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }
    // 3.ab hume data mil gya to ab hum usko database m find krenge 
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    // 4. ab uska password verify krenge kii shi hai ya nhi uske liye hame ek function lagega jo check krega ki
    //  password shi hai ya nhi to uske liye hamare pass ek  document user hai uspr woh fucntion run krenge one 
    // thing keep in mind database pr hum function run nhi krte hum ek documnet pr krte hai isliye hamne user se 
    // use kiya sath me usse req.password bhi de diya 
    //ab  uss function ko thoda read kr skte hoo user model me
   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }
    // ab hum accesstoken and refreshtoken generate kr rhe ab dekho humne ek hi function m dono chiz kr liye using function defined above
   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    // ab hamre pass accesstoken and refreshtoken hai now user._id use krke hum juss document ko search kr liye
    //  but usme se password and refreshtoken hta diye as woh hum pass nhi krna chahte
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    // now login m cookie set krte hai to yeh phle krte hai 
    const options = {
        httpOnly: true,
        secure: true
    }
    // ab return krenge 
    return res
    .status(200)
    .cookie("accessToken", accessToken, options) // aese cookie return krte hai 
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user:loggedInUser,// direct loggedinuser bhi bhej skte the but bss whn user dikhne k liye humne 
                // aese bheja 
                accessToken, 
                refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, // unset  wala process tab use krna jab kisi ko remove krna hoo yeh kya krega kii uss id wale 
        // document ko find krega and usse refreshtoken hta dega and new true se woh document update ho jaega 
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )
    // use of new 
    //By default, findByIdAndUpdate() returns the old document (before the update).
    //  Adding { new: true } ensures that the updated document (after $unset removes the field) is returned.
    // Since findByIdAndUpdate() returns the old document by default, user.refreshToken still appears in the 
    // console (even though it's removed in the database).
    const options = {
        httpOnly: true,
        secure: true
    }
    // aese krke collie clear krte hai bss ho gya logout

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}