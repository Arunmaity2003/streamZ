import FriendRequest from "../models/FriendRequest.model.js";
import userModel from "../models/User.model.js"

const getRecommendedUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUser = await userModel.find({
            $and: [
                { _id: { $ne: currentUserId } }, //excluding current user
                { _id: { $nin: currentUser.friends } }, //excluding already friends
                { isOnboarded: true }
            ]
        })
        res.status(200).json(recommendedUser)
    } catch (error) {
        console.log("error in getRecommendedUse controller")
        res.status(500).json({ message: "Internal server error" })
    }
}

const getMyFriends = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id)
            .select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage")

        res.status(200).json(user.friends)
    } catch (error) {
        console.log("error in getFriends controller")
        res.status(500).json({ message: "Internal server error" })
    }
}

const sendFriendRequest = async (req, res) => {
    try {
        const myId = req.user.id
        const { id: recipientId } = req.params;

        //prevent send req to yourself
        if (myId === recipientId) {
            return res.status(400).json({ message: "you can't send friend request to yourself" })
        }

        const recipient = await userModel.findById(recipientId)

        if (!recipient) {
            return res.status(404).json({ message: "User not found" })
        }

        //check user are already friends
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user" })
        }

        //check already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId }
            ]
        })

        if (existingRequest) {
            return res
                .status(400)
                .json({ message: "A friend request is already exist between you and this user" })
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId
        })

        res.status(201).json(friendRequest)
    } catch (error) {
        console.log("error in sendFriendRequest controller")
        res.status(500).json({ message: "Internal server error" })
    }
}

const acceptFriendRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params
        const friendRequest = await FriendRequest.findById(requestId)

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" })
        }

        //verify if the current user is recipient
        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "you are not authorized to accept this friend request" })
        }

        friendRequest.status = "accepted"
        await friendRequest.save()

        //add each user to others friends array
        await userModel.findByIdAndUpdate(friendRequest.sender,{
            $addToSet: {friends:friendRequest.recipient}
        })

        await userModel.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet: {friends:friendRequest.sender}
        })

        res.status(200).json({ message: "Friend request accepted" })
    } catch (error) {
        console.log("error in acceptFriendRequest controller")
        res.status(500).json({ message: "Internal server error" })
    }
}

const getFriendRequest = async (req,res) => {
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending"
        }).populate("sender","fullName profilePic nativeLanguage learningLanguage")

        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted"
        }).populate("recipient","fullName profilePic")

        res.status(200).json({ incomingReqs,acceptedReqs })
    } catch (error) {
        console.log("error in getFriendRequest controller")
        res.status(500).json({ message: "Internal server error" })
    }
}

const getOutgoingFriendRequest = async (req,res) => {
    try {
        const outgoingReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "pending"
        }).populate("recipient","fullName profilePic nativeLanguage learningLanguage")

        res.status(200).json(outgoingReqs)
    } catch (error) {
        console.log("error in getOutgoingFriendRequest controller")
        res.status(500).json({ message: "Internal server error" })
    }
}
export default { getRecommendedUsers, getMyFriends, sendFriendRequest,acceptFriendRequest,getFriendRequest,getOutgoingFriendRequest }