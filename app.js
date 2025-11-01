import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middleware/errors.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log(`ERROR: ${err}`);
    console.log("Shutting down Server due to Uncaught Exception");
    process.exit(1);
});

dotenv.config();
const app = express();

// Connecting to Database 
connectDatabase();

// CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL,  // your frontend URL
  credentials: true,
}));

// Body parsers with larger size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// importing all routes
import createNotes from "./routes/noteRoutes.js";
import authRoutes from "./routes/auth.js";

app.use("/api/v1", authRoutes);
app.use("/api/v1", createNotes);

// Using Error Middleware
app.use(errorMiddleware);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
    console.log(`ERROR: ${err}`);
    console.log("Shutting down Server due to Unhandled Promise Rejection");
    server.close(() => {
        process.exit(1);
    });
});
