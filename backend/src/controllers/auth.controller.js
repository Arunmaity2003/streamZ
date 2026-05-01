import { upsertStreamUser } from "../db/stream.js"
import userModel from "../models/User.model.js"
import jwt from "jsonwebtoken"

const signup = async (req, res) => {
    const { email, password, fullName } = req.body

    try {
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 chracter long!" })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists, please use a different one." })
        }

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://i.pravatar.cc/150?img=${idx}.png`

        //create new user
        const user = await userModel.create({
            email,
            password,
            fullName,
            profilePic: randomAvatar
        })

        try {
            await upsertStreamUser({
                id: user._id.toString(),
                name: user.fullName,
                image: user.profilePic || ""
            })
            console.log(`Stream user is created for the new user:${user.fullName}`)
        } catch (error) {
            console.log("error createing stream user", error)
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, // to prevent XSS attack
            sameSite: "strict", //to prvent CSRF attack
            secure: process.env.NODE_ENV === "production"
        })

        res.status(201).json({ message: "user created successfully.", newUser: user })
    } catch (error) {
        console.log('error in signup contoller:', error)
        res.status(500).json({ message: "Internal server error" })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: "Invalid Email or Password" })
        }

        const isPasswordCorrect = await user.matchPassword(password)
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, // to prevent XSS attack
            sameSite: "strict", //to prvent CSRF attack
            secure: process.env.NODE_ENV === "production"
        })

        res.status(201).json({ message: "user logged in successfully.", newUser: user })
    } catch (error) {
        console.log('error in login contoller:', error)
        res.status(500).json({ message: "Internal server error" })
    }
}

const logout = async (req, res) => {
    res.clearCookie("jwt")
    res.status(200).json({ message: "user logout successfully" })
}

const onboard = async (req, res) => {
    try {
        const userId = req.user._id
        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body

        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            })
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true
        }, { new: true })

        if (!updatedUser) {
            return res.status(404).json({ message: "user not found" })
        }

        //update the user info in stream
        try {
            await upsertStreamUser({
                id:updatedUser._id.toString(),
                name:updatedUser.fullName,
                image: updatedUser.profilePic || ""
            })

            console.log(`Stream user updated successfully after onboarding for ${updatedUser.fullName}`)
        } catch (streamError) {
            console.error("Error updating user during onboarding: ",streamError.message)
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser })
    } catch (error) {
        console.error("Onboarding error", error)
        res.status(500).json({ message: "Internal server error" })
    }
}
export default { signup, login, logout, onboard }