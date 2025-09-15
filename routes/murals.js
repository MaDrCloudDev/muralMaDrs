import express from "express";
import * as murals from "../controllers/murals.js";
import catchAsync from "../utils/catchAsync.js";
import { isLoggedIn, isAuthor, validatemural } from "../middleware.js";
import multer from "multer";
import { storage, hasCloudinaryConfig } from "../cloudinary/index.js";

const router = express.Router();

const upload = multer({ 
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }
});

router
	.route("/")
	.get(catchAsync(murals.index))
	.post(
		isLoggedIn,
		upload.array("image"),
		validatemural,
		catchAsync(murals.createmural)
	);

router.get("/new", isLoggedIn, murals.renderNewForm);

router
	.route("/:id")
	.get(catchAsync(murals.showmural))
	.put(
		isLoggedIn,
		isAuthor,
		upload.array("image"),
		validatemural,
		catchAsync(murals.updatemural)
	)
	.delete(isLoggedIn, isAuthor, catchAsync(murals.deletemural));

router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	catchAsync(murals.renderEditForm)
);

export default router;
