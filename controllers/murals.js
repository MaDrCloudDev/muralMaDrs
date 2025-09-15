import Mural from "../models/murals.js";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js";
import { cloudinary, hasCloudinaryConfig } from "../cloudinary/index.js";
import dotenv from "dotenv";

dotenv.config();

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapBoxToken ? mbxGeocoding({ accessToken: mapBoxToken }) : null;

export const index = async (req, res) => {
	const murals = await Mural.find({});
	res.render("murals/index", { murals });
};

export const renderNewForm = (req, res) => {
	res.render("murals/new");
};

export const createmural = async (req, res, next) => {
	const mural = new Mural(req.body.mural);
	
	if (geocoder) {
		try {
			const geoData = await geocoder
				.forwardGeocode({
					query: req.body.mural.location,
					limit: 1,
				})
				.send();
			
			if (geoData.body.features && geoData.body.features.length > 0) {
				mural.geometry = geoData.body.features[0].geometry;
			} else {
				mural.geometry = {
					type: "Point",
					coordinates: [-98.5795, 39.8283]
				};
			}
		} catch (error) {
			mural.geometry = {
				type: "Point",
				coordinates: [-98.5795, 39.8283]
			};
		}
	} else {
		mural.geometry = {
			type: "Point",
			coordinates: [-98.5795, 39.8283]
		};
	}
	
	if (req.files.length > 0) {
		if (hasCloudinaryConfig) {
			mural.images = req.files.map((f) => ({
				url: f.path,
				filename: f.filename,
			}));
		} else {
			mural.images = req.files.map((f) => ({
				url: `/uploads/${f.filename}`,
				filename: f.filename,
			}));
		}
	} else {
		mural.images = [];
	}
	mural.author = req.user._id;
	await mural.save();
	req.flash("success", "Successfully added a mural!");
	res.redirect(`/murals/${mural._id}`);
};

export const showmural = async (req, res) => {
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

export const renderEditForm = async (req, res) => {
	const { id } = req.params;
	const mural = await Mural.findById(id);
	if (!mural) {
		req.flash("error", "Cannot find that mural!");
		return res.redirect("/murals");
	}
	res.render("murals/edit", { mural });
};

export const updatemural = async (req, res) => {
	const { id } = req.params;
	const mural = await Mural.findByIdAndUpdate(id, {
		...req.body.mural,
	});
	
	if (req.files.length > 0) {
		if (hasCloudinaryConfig) {
			const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
			mural.images.push(...imgs);
		} else {
			const imgs = req.files.map((f) => ({ url: `/uploads/${f.filename}`, filename: f.filename }));
			mural.images.push(...imgs);
			console.log(" Images saved locally for development");
		}
	}
	
	await mural.save();
	
	if (req.body.deleteImages) {
		if (hasCloudinaryConfig) {
			for (let filename of req.body.deleteImages) {
				try {
					await cloudinary.uploader.destroy(filename);
				} catch (error) {
					console.warn("Failed to delete image from Cloudinary:", error.message);
				}
			}
			await mural.updateOne({
				$pull: { images: { filename: { $in: req.body.deleteImages } } },
			});
		} else {
			await mural.updateOne({
				$pull: { images: { filename: { $in: req.body.deleteImages } } },
			});
		}
	}
	
	req.flash("success", "Successfully updated mural!");
	res.redirect(`/murals/${mural._id}`);
};

export const deletemural = async (req, res) => {
	const { id } = req.params;
	await Mural.findByIdAndDelete(id);
	req.flash("success", "Successfully deleted mural!");
	res.redirect("/murals");
};
