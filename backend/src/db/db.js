import mongoose from "mongoose"

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("db connected successfully")
    } catch (error) {
        console.error("error connecting db:",error)
    }
}

export default connectDB