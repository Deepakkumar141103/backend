import mongoose from "mongoose"
import {Db_name} from "../constants.js"


const connectDb = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_URL}/${Db_name}`)
        console.log(`\n Mongodb connected DB Host : ${connection.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection failed",error)
        process.exit(1)
    }
}

export default connectDb;