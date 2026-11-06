import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// Register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists. Please use a different email.",
                success: false,
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Log in immediately upon registration:
        generateTokenAndSetCookie(newUser._id, res);

        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ errorMessage: error.message });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required", success: false });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User does not exist with this email.",
                success: false,
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
            });
        }

        // Generate JWT and set HTTP-only cookie
        generateTokenAndSetCookie(user._id, res);

        return res.status(200).json({
            message: "User logged in successfully",
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ errorMessage: error.message });
    }
};

// Logout
export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        return res.status(200).json({
            message: "User logged out successfully",
            success: true,
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ errorMessage: error.message });
    }
};

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "No user found with that email address.",
                success: false,
            });
        }

        // 1. Generate random reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // 2. Hash token and save to database with 15-minute expiration
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        // 3. Create reset URL
        const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

        // 4. Send email
        const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            html: message,
        });

        return res.status(200).json({
            message: "Password reset link sent to your email",
            success: true,
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({ errorMessage: error.message });
    }
};

// Reset Password Controller
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required", success: false });
        }

        // 1. Hash the token from the URL to compare with the database
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // 2. Find user by token and check if the token has not expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired password reset link",
                success: false,
            });
        }

        // 3. Hash the new password and clear the reset fields
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password reset successful. You can now log in.",
            success: true,
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ errorMessage: error.message });
    }
};

// Get Current Logged In User
export const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        console.error("GetMe Error:", error);
        return res.status(500).json({ errorMessage: error.message });
    }
};
