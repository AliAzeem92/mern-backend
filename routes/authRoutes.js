import express from "express";
import {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getMe,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protectRoute, getMe);

export default router;
