import { muralSchema, reviewSchema } from "./schemas.js";
import ExpressError from "./utils/ExpressError.js";
import Mural from "./models/murals.js";
import Review from "./models/review.js";

export const isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash("error", "You must be signed in first!");
		return res.redirect("/login");
	}
	next();
};

export const validatemural = (req, res, next) => {
	const { error } = muralSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

export const isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const mural = await Mural.findById(id);
	if (!mural.author.equals(req.user._id)) {
		req.flash("error", "You do not have permission to do that!");
		return res.redirect(`/murals/${id}`);
	}
	next();
};

export const isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash("error", "You do not have permission to do that!");
		return res.redirect(`/murals/${id}`);
	}
	next();
};

export const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};
