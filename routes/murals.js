const express = require("express");
const router = express.Router();
const murals = require("../controllers/murals");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validatemural } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const mural = require("../models/murals");

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

module.exports = router;
