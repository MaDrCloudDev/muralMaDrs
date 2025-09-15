import express from "express";
import { validateReview, isLoggedIn, isReviewAuthor } from "../middleware.js";
import * as reviews from "../controllers/reviews.js";
import catchAsync from "../utils/catchAsync.js";

const router = express.Router({ mergeParams: true });

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	catchAsync(reviews.deleteReview)
);

export default router;
