import mongoose from "mongoose"
import {Db_name} from "../constants.js"


const connectDb = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_URL}/${Db_name}`)
        console.log(`\n Mongodb connected DB Host : ${connection.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection failed",error)
        process.exit(1)  // process.exit(code) terminates the Node.js process with an exit code.//     Exit Codes Meaning    process.exit(0) → Success (Normal exit) ✅ process.exit(1) → Failure/Error
    }
}

export default connectDb;