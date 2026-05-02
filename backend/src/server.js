import express from "express"
import "dotenv/config"
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import chatRoutes from "./routes/chat.route.js"
import connectDB from "./db/db.js"
import cookieParser from "cookie-parser"

const app = express()

connectDB() 

app.get("/",(req,res) => {
    res.send("you are in the right place")
})

app.use(express.json())
app.use(cookieParser()); 

app.use("/api/auth",authRoutes)
app.use("/api/users",userRoutes)
app.use("/api/chat",chatRoutes)

const port = process.env.PORT || 5000
app.listen(port,() => {
    console.log(`app in running on: http://localhost:${port}`)
})