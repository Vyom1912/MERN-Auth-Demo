import express from "express";
import { body } from "express-validator";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  logoutAllDevices,
  changePassword,
  getSessions,
  revokeSession,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// router.post("/register", registerUser);
router.post(
  "/register",
  [
    body("name").notEmpty(),

    body("email").isEmail(),

    body("password").isLength({ min: 6 }),
  ],
  registerUser,
);
router.post("/refresh", refreshToken);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/logout-all", authMiddleware, logoutAllDevices);

router.post("/change-password", authMiddleware, changePassword);

router.get("/sessions", authMiddleware, getSessions);
router.delete("/sessions/:sessionId", authMiddleware, revokeSession);
export default router;
