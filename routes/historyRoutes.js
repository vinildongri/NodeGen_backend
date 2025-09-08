import express from "express";
import {
  createHistory,
  addMessage,
  getUserHistories,
  getHistoryById,
} from "../controllers/historyController.js";

const router = express.Router();

// 🆕 Create a new chat history
router.post("", createHistory);

// ➕ Add a message to an existing history
router.post("/:id/message", addMessage);

// 📜 Get all histories of a user
router.get("/user/:userId", getUserHistories);

// 🔍 Get a single history by ID
router.get("/:id", getHistoryById);

export default router;