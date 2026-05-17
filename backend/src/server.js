import express from "express";
import dotenv from 'dotenv';
import connectDB from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares to parse JSON and for access cookie (req.cookies.jwt)
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// Ensure MongoDB is connected in Vercel Serverless environment
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get('/', (req, res) => {
  res.send("Api is working");
});

// authentication routes
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

// user routes
app.use("/api/users", userRoutes);
app.use("/users", userRoutes);

// chat route
app.use("/api/chat", chatRoutes);
app.use("/chat", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;