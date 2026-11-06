import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const protectRoute = async (req, res, next) => {
    try {
        let token = req.cookies?.jwt;

        // Fallback to Authorization header if cookies are not used (e.g. Postman testing)
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: No authentication token provided",
                success: false,
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({
                message: "Unauthorized: Invalid token",
                success: false,
            });
        }

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({
            message: "Unauthorized: Token verification failed",
            success: false,
        });
    }
};

export default protectRoute;
