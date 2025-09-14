import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middleware/errors.js";
import cookieParser from "cookie-parser";

// Handle Uncaught exceptions
process.on("uncaughtException", (err)=> {
    console.log(`ERROR: ${err}`);
    console.log("Shutting down Server due to Uncaught Exception");
    process.exit(1);
});

dotenv.config({ path: "backend/config/config.env" });

const app = express();

// Connectin to DataBase 
connectDatabase();

// app.use(cors());
app.use(cors({
  origin: process.env.FRONTEND_URL,  // your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// importing all routes
import createNotes from "./routes/noteRoutes.js";
import registerUser  from "./routes/auth.js";
import loginUser from "./routes/auth.js";

app.use("/api/v1", registerUser);
app.use("/api/v1", createNotes);
app.use("/api/v1", loginUser);

// Using Error Middleware
app.use(errorMiddleware);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

// Handle Unhandle Promise Rejection
process.on("uncaughtException", (err) =>{
    console.log(`ERROR: ${err}`);
    console.log("Shutting down Server due to Unhandle Promise Rejection");
    server.close(()=>{
        process.exit(1);
    });
});