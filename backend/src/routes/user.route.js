import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import userController from "../controllers/user.controller.js"
const router = express.Router()


//apply auth middleware to all routes
router.use(protectRoute)

router.get("/",userController.getRecommendedUsers)
router.get("/friends",userController.getMyFriends)

router.post("/friend-request/:id",userController.sendFriendRequest)
router.put("/friend-request/:id/accept",userController.acceptFriendRequest)

router.get("/friend-request",userController.getFriendRequest)
router.get("/outgoing-friend-request",userController.getOutgoingFriendRequest)

export default router