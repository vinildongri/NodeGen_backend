import History from "../models/history.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// Create new chat history
export const createHistory = catchAsyncErrors(async (req, res, next) => {
  const { userId, firstMessage } = req.body;

  const history = await History.create({
    userId,
    title: firstMessage?.substring(0, 30) || "New Chat",
    messages: [{ role: "user", content: firstMessage }],
  });

  res.status(201).json({
    success: true,
    history,
  });
});

// Add message to history
export const addMessage = catchAsyncErrors(async (req, res, next) => {
  const { role, content } = req.body;
  const history = await History.findById(req.params.id);

  if (!history) {
    return next(new ErrorHandler("History not found", 404));
  }

  history.messages.push({ role, content });
  await history.save();

  res.status(200).json({
    success: true,
    history,
  });
});

// Get all histories of a user
export const getUserHistories = catchAsyncErrors(async (req, res, next) => {
  const histories = await History.find({ userId: req.params.userId });

  res.status(200).json({
    success: true,
    histories,
  });
});

// Get a single history
export const getHistoryById = catchAsyncErrors(async (req, res, next) => {
  const history = await History.findById(req.params.id);

  if (!history) {
    return next(new ErrorHandler("History not found", 404));
  }

  res.status(200).json({
    success: true,
    history,
  });
});