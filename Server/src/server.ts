// Modules imports
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// Config
import connectDB from "./config/db.js";
import { errorHandler } from "./utils/errorHandler.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dangerRoutes from "./routes/dangerRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import { upload } from "./middleware/uploadMdw.js";

// Config Middleware
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT ?? "3000";

// CORS: allow CLIENT_URL (comma-separated for multiple origins)
const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

// Rate Limit 
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10000, // 100 requests per 15 minutes
}));

// Morgan 
app.use(morgan("dev")); // dev is the format of the logs

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/health", (req, res) => {
    res.json({ success: true, message: "Server is healthy" });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/danger", dangerRoutes);

// File upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, error: "No file uploaded" });
        return;
    }
    res.status(200).json({
        success: true,
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
    });
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});