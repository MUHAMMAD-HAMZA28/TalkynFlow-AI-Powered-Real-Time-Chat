import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

//Get Recommended Users Controller
export const getRecommendedUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // 1. Get all potential users (excluding self and blocked)
    const allUsers = await User.find({
      _id: { $ne: loggedInUserId, $nin: req.user.blockedUsers },
    }).select("fullName profilePic friends bio");

    // 2. Get all requests involving the current user
    const existingRequests = await FriendRequest.find({
      $or: [{ sender: loggedInUserId }, { recipient: loggedInUserId }],
    });

    // 3. Map users to include status
    const recommendedUsers = allUsers.map((user) => {
      const userObj = user.toObject();
      
      // Check if already friends
      if (req.user.friends.includes(user._id.toString())) {
        userObj.friendStatus = "friends";
      } else {
        // Check requests
        const request = existingRequests.find(
          (r) =>
            (r.sender.toString() === loggedInUserId.toString() && r.recipient.toString() === user._id.toString()) ||
            (r.recipient.toString() === loggedInUserId.toString() && r.sender.toString() === user._id.toString())
        );

        if (request) {
          if (request.status === "accepted") {
            userObj.friendStatus = "friends";
          } else if (request.status === "pending") {
            userObj.friendStatus = request.sender.toString() === loggedInUserId.toString() ? "pending" : "received";
            userObj.requestId = request._id;
          } else {
            userObj.friendStatus = null;
          }
        } else {
          userObj.friendStatus = null;
        }
      }
      return userObj;
    });

    // Filter out existing friends from "Recommended"
    const filteredRecommendations = recommendedUsers.filter(u => u.friendStatus !== "friends");

    res.status(200).json(filteredRecommendations);
  } catch (error) {
    console.error("Error in getRecommendedUsers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


//Get My Friends ListController
export const getMyFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const userWithFriends = await User.findById(userId).populate({
      path: "friends",
      select: "fullName profilePic bio",
    });

    if (!userWithFriends) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(userWithFriends.friends);
  } catch (error) {
    console.error("Error in getMyFriends:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


//Send Friend Request Controller
export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const recipientId = req.params.id;

    if (senderId.toString() === recipientId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.friends.includes(recipientId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // Check if blocked
    if (recipientUser.blockedUsers.includes(senderId)) {
      return res.status(403).json({ message: "You are blocked by this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    });

    if (existingRequest && existingRequest.status !== "rejected") {
      return res.status(400).json({ message: "A friend request is already pending or exists" });
    }

    if (existingRequest && existingRequest.status === "rejected") {
        existingRequest.status = "pending";
        existingRequest.sender = senderId;
        existingRequest.recipient = recipientId;
        await existingRequest.save();
        return res.status(200).json({ message: "Friend request sent again!" });
    }

    const newRequest = new FriendRequest({
      sender: senderId,
      recipient: recipientId,
      status: "pending",
    });

    await newRequest.save();

    res.status(201).json({ 
      message: "Friend request sent successfully!",
      request: newRequest 
    });

  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


//Accept Friend Controller
export const acceptFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const currentUserId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.recipient.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: request.recipient },
    });

    await User.findByIdAndUpdate(request.recipient, {
      $addToSet: { friends: request.sender },
    });

    res.status(200).json({ message: "Friend request accepted. You are now friends!" });

  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


//Get Friend Request Controller 
export const getFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const notifications = await FriendRequest.find({
      recipient: currentUserId,
      status: "pending",
    })
      .populate("sender", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = notifications.length;

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });

  } catch (error) {
    console.error("Error in getFriendRequest (Notification):", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//getOutgoingFriendRequest Controller
export const getOutgoingFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const outgoingRequests = await FriendRequest.find({
      sender: currentUserId,
      status: "pending",
    })
      .populate("recipient", "fullName profilePic bio")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: outgoingRequests.length,
      outgoingRequests
    });
  } catch (error) {
    console.error("Error in getOutgoingFriendRequest:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const currentUserId = req.user._id;

    const request = await FriendRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Friend request not found" });

    if (request.recipient.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const cancelFriendRequest = async (req, res) => {
  try {
    const recipientId = req.params.id;
    const senderId = req.user._id;

    const request = await FriendRequest.findOneAndDelete({
      sender: senderId,
      recipient: recipientId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "No pending request found to cancel" });
    }

    res.status(200).json({ message: "Friend request cancelled" });
  } catch (error) {
    console.error("Error in cancelFriendRequest:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const unfriendUser = async (req, res) => {
  try {
    const friendId = req.params.id;
    const userId = req.user._id;

    // Remove from both friends lists
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    // Delete the accepted friend request record
    await FriendRequest.findOneAndDelete({
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId },
      ],
      status: "accepted",
    });

    res.status(200).json({ message: "User unfriended successfully" });
  } catch (error) {
    console.error("Error in unfriendUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const blockId = req.params.id;
    const userId = req.user._id;

    // Add to blocked list
    await User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: blockId } });
    
    // Auto-unfriend if they were friends
    await User.findByIdAndUpdate(userId, { $pull: { friends: blockId } });
    await User.findByIdAndUpdate(blockId, { $pull: { friends: userId } });

    // Delete any requests between them
    await FriendRequest.findOneAndDelete({
      $or: [
        { sender: userId, recipient: blockId },
        { sender: blockId, recipient: userId },
      ],
    });

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Error in blockUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};