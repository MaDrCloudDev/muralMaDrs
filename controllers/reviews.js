import Mural from "../models/murals.js";
import Review from "../models/review.js";

export const createReview = async (req, res) => {
	const mural = await Mural.findById(req.params.id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	mural.reviews.push(review);
	await review.save();
	await mural.save();
	req.flash("success", "Created new review!");
	res.redirect(`/murals/${mural._id}`);
};

export const deleteReview = async (req, res) => {
	const { id, reviewId } = req.params;
	await Mural.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	req.flash("success", "Successfully deleted review");
	res.redirect(`/murals/${id}`);
};
