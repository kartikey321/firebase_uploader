import express from "express";
import MediaController from "../controller/media.controller.js";
import uploadMiddleware from "../middleware/media.middleare.js";

const router = express.Router();

router.post("/upload", uploadMiddleware, MediaController.uploadMedia);
router.post("/delete", MediaController.delete);

export default router;
