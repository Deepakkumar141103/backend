import dotenv from "dotenv"
import connectDb from "./db/index.js"
import {app} from './app.js'
dotenv.config()

connectDb()
.then(() =>{
    app.listen(process.env.PORT || 8003, () =>{
        console.log(`server started at ${process.env.PORT}`)
    })
})
.catch((err) =>{
    console.log("Mongo db connection failed",err)
})