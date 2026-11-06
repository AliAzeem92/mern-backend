import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Body Parsers & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration: clean trailing slashes and allow frontend origins
const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");

const allowedOrigins = [
    clientUrl,
    "http://localhost:5173",
    "http://localhost:3000",
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, or server-to-server)
            if (!origin) return callback(null, true);

            const normalizedOrigin = origin.replace(/\/+$/, "");
            if (
                allowedOrigins.includes(normalizedOrigin) ||
                normalizedOrigin.endsWith(".vercel.app")
            ) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
);

// Health Check Route
app.get("/", (req, res) => {
    res.json({
        message: "MERN Todo API is running",
        status: "OK",
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Connect to Database and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

export default app;

