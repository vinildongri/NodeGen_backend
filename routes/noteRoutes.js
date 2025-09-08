import express from "express";
import { createNotes } from "../controllers/noteController.js";
import { isAuthenticatedUser } from "../middleware/auth.js";


const router = express.Router();

router.route("/notes").post( isAuthenticatedUser, createNotes);
// router.route.post("/notes", upload.single("pdf"), createNotes);


export default router;


// import express from "express";
// import { createNotes } from "../controllers/noteController.js";
// import { upload } from "../middleware/upload.js";

// const router = express.Router();

// router.post("/notes", upload.single("pdf"), createNotes);

// export default router;
