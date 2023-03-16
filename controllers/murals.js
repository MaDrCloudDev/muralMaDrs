const Mural = require("../models/murals");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
	const murals = await Mural.find({}).populate("popupText");
	res.render("murals/index", { murals });
};

module.exports.renderNewForm = (req, res) => {
	res.render("murals/new");
};

module.exports.createmural = async (req, res, next) => {
	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.mural.location,
			limit: 1,
		})
		.send();
	const mural = new Mural(req.body.mural);
	mural.geometry = geoData.body.features[0].geometry;
	mural.images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	mural.author = req.user._id;
	await mural.save();
	console.log(mural);
	req.flash("success", "Successfully added a mural!");
	res.redirect(`/murals/${mural._id}`);
};

module.exports.showmural = async (req, res) => {
	const mural = await Mural.findById(req.params.id)
		.populate({
			path: "reviews",
			populate: {
				path: "author",
			},
		})
		.populate("author");
	if (!mural) {
		req.flash("error", "Cannot find that mural!");
		return res.redirect("/murals");
	}
	res.render("murals/show", { mural });
};

module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const mural = await Mural.findById(id);
	if (!mural) {
		req.flash("error", "Cannot find that mural!");
		return res.redirect("/murals");
	}
	res.render("murals/edit", { mural });
};

module.exports.updatemural = async (req, res) => {
	const { id } = req.params;
	console.log(req.body);
	const mural = await Mural.findByIdAndUpdate(id, {
		...req.body.mural,
	});
	const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	mural.images.push(...imgs);
	await mural.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await mural.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
	}
	req.flash("success", "Successfully updated mural!");
	res.redirect(`/murals/${mural._id}`);
};

module.exports.deletemural = async (req, res) => {
	const { id } = req.params;
	await mural.findByIdAndDelete(id);
	req.flash("success", "Successfully deleted mural!");
	res.redirect("/murals");
};
