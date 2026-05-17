import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getStreamToken, handleBotChat, handleDirectAIChat } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/bot", protectRoute, handleBotChat);
router.post("/ai", protectRoute, handleDirectAIChat);

export default router;