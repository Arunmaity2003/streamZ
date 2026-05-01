import express from "express"
import "dotenv/config"
import authRoutes from "./routes/auth.route.js"
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

const port = process.env.PORT || 5000
app.listen(port,() => {
    console.log(`app in running on: http://localhost:${port}`)
})