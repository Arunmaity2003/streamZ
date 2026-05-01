import {StreamChat} from "stream-chat"
import "dotenv/config"

const apiKey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET

if(!apiKey || !apiSecret){
    console.error("API secret key or API key is missing")
}

const streatClient = StreamChat.getInstance(apiKey,apiSecret)

export const upsertStreamUser = async (userData) => {
    try {
        await streatClient.upsertUsers([userData])
        return userData
    } catch (error) {
        console.error("Error in upserting stream user:",error)
    }
}

//todo