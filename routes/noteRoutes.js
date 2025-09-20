import express from "express";
import { createNotes } from "../controllers/noteController.js";
import { isAuthenticatedUser } from "../middleware/auth.js";


const router = express.Router();

router.route("/notes").post( createNotes);
// router.route.post("/notes", upload.single("pdf"), createNotes);

// router.route("/notes/pdf").post( isAuthenticatedUser, searchPdf);


export default router;
