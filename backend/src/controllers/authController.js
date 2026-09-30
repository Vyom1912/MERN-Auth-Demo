import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import Session from "../models/Session.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

export const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created",
      id: user._id,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // -----------------------------------------------
    // single token
    // -----------------------------------------------

    // const token = jwt.sign(
    //   {
    //     id: user._id,
    //     email: user.email,
    //   },
    //   process.env.JWT_SECRET,
    //   {
    //     expiresIn: "1d",
    //   },
    // );

    // -----------------------------------------------

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "lax",
    //   maxAge: 24 * 60 * 60 * 1000,
    // });

    // -----------------------------------------------
    // doubble token
    // -----------------------------------------------

    const accessToken = generateAccessToken(user); //15m

    const refreshToken = generateRefreshToken(user); //7d

    await Session.create({
      user: user._id,

      refreshToken, // use 7days token

      userAgent: req.headers["user-agent"],

      ipAddress: req.ip,

      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // for 7 days
    });

    // console.log("Access Token:", accessToken);
    // console.log("Refresh Token:", refreshToken);

    // -----------------------------------------------

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "No refresh token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const session = await Session.findOne({
      refreshToken: token,
    });

    if (!session) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    // const user = {
    //   _id: decoded.id,
    // };

    const user = await User.findById(decoded.id);

    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      message: "Token refreshed",
    });
  } catch (error) {
    res.status(401).json({
      message: "Refresh failed",
    });
  }
};

export const logoutUser = async (req, res) => {
  //   res.clearCookie("token"); // for single token

  await Session.deleteOne({
    refreshToken: req.cookies.refreshToken,
  });

  res.clearCookie("accessToken");

  res.clearCookie("refreshToken");

  res.json({
    message: "Logged out successfully",
  });
};
export const logoutAllDevices = async (req, res) => {
  await Session.deleteMany({
    user: req.user._id,
  });

  res.clearCookie("accessToken");

  res.clearCookie("refreshToken");

  res.json({
    message: "Logged out everywhere",
  });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password incorrect",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    await Session.deleteMany({
      user: user._id,
    });

    res.clearCookie("accessToken");

    res.clearCookie("refreshToken");

    res.json({
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user._id,
    }).select("-refreshToken");

    res.json({
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const revokeSession = async (req, res) => {
  console.log("Session ID:", req.params.sessionId);
  const session = await Session.findOne({
    _id: req.params.sessionId,
    user: req.user._id,
  });
  if (!session) {
    return res.status(404).json({
      message: "Session not found",
    });
  }

  await session.deleteOne();

  res.json({
    message: "Session revoked",
  });
};
