import { generateStreamToken } from "../db/stream.js"

const getStreamToken = async (req, res) => {
    try {
        const token = generateStreamToken(req.user.id)
        res.status(200).json({ token })
    } catch (error) {
        console.log("error in getStreamToken controller")
        res.status(500).json({ message: "Internal server error" })
    }
}

export default { getStreamToken }