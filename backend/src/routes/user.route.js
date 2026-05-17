import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { 
  getRecommendedUsers, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest,
  cancelFriendRequest,
  unfriendUser,
  blockUser,
  getFriendRequest, 
  getOutgoingFriendRequest,
  getMyFriends
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getRecommendedUsers);
router.get("/friends", protectRoute, getMyFriends);

router.post("/friend-request/:id", protectRoute, sendFriendRequest);
router.put("/friend-request/:id/accept", protectRoute, acceptFriendRequest);
router.put("/friend-request/:id/reject", protectRoute, rejectFriendRequest);
router.delete("/friend-request/:id", protectRoute, cancelFriendRequest);
router.delete("/unfriend/:id", protectRoute, unfriendUser);
router.post("/block/:id", protectRoute, blockUser);

router.get("/friend-request", protectRoute, getFriendRequest);
router.get("/outgoing-friend-request", protectRoute, getOutgoingFriendRequest);

export default router;