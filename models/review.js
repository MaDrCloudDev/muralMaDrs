import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema({
	body: String,
	rating: Number,
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
});

export default mongoose.model("Review", reviewSchema);
