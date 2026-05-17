import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from "jsonwebtoken";
import { upsertStreamUser, createUserToken } from '../lib/stream.js';

//Signup
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const randomPic = "/img/profilepic.jpg";

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profilePic: randomPic,
    });

    const userIdStr = newUser._id.toString();
    await upsertStreamUser(userIdStr, newUser.fullName, newUser.profilePic);
    const streamToken = await createUserToken(userIdStr);

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d"
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        streamToken: streamToken,
      },
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

//Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const userIdStr = user._id.toString();
    const streamToken = await createUserToken(userIdStr);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        streamToken: streamToken,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

//Logout
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

//Onboard / Update Profile
export const onboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, bio, profilePic } = req.body;

    // Build database updates dynamically
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePic !== undefined) updateData.profilePic = profilePic;

    // Enable onboarding status
    updateData.isOnboarded = true;

    // Enforce full name constraint only if they are trying to clear it
    if (fullName === "") {
      return res.status(400).json({ message: "Full Name cannot be empty" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sync updated details (Name & Avatar) with GetStream chat
    await upsertStreamUser(
      updatedUser._id.toString(),
      updatedUser.fullName,
      updatedUser.profilePic
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error in onboarding:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}