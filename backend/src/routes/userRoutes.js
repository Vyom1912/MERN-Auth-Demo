import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import { getProfile, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);

router.delete("/:id", authMiddleware, authorize("admin"), deleteUser);
export default router;
