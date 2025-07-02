const Listing = require("../models/listing.js");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const access_Token = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: access_Token });

module.exports.index = async (req, res) => {
	let listings = await Listing.find().populate("owner");
	res.render("listings/index.ejs", { listings });
};

module.exports.renderNewForm = (req, res) => {
	res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res) => {
	let response = await geocodingClient
		.forwardGeocode({
			query: `${req.body.listing.location}, ${req.body.listing.country}`,
			limit: 1,
		})
		.send();

	let url = req.file.path;
	let filename = req.file.filename;
	let listing = req.body.listing;
	const newListing = new Listing(listing);
	newListing.owner = req.user._id;
	newListing.image = { url, filename };
	newListing.geometry = response.body.features[0].geometry;
	let savedListing = await newListing.save();
	// console.log(savedListing);
	req.flash("success", "Success! Your listing is now live.");
	res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
	let { id } = req.params;
	let listing = await Listing.findById(id)
		.populate({ path: "reviews", populate: { path: "author" } })
		.populate("owner");
	if (!listing) {
		req.flash(
			"error",
			"We couldn't find the listing you requested. It may have been removed or never existed.",
		);
		return res.redirect("/listings");
	}
	res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
	let { id } = req.params;
	const listing = await Listing.findById(id);
	if (!listing) {
		req.flash(
			"error",
			"We couldn't find the listing you requested. It may have been removed or never existed.",
		);
		return res.redirect("/listings");
	}
	let originalImageUrl = listing.image.url;
	originalImageUrl = originalImageUrl.replace(
		"/upload",
		"/upload/h_300,w_250",
	);
	res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
	let { id } = req.params;
	let listing = req.body.listing;
	let newListing = await Listing.findByIdAndUpdate(
		id,
		{ ...listing },
		{ runValidators: true, new: true },
	);
	if (typeof req.file !== "undefined") {
		let url = req.file.path;
		let filename = req.file.filename;
		newListing.image = { url, filename };
	}
	await newListing.save();
	req.flash(
		"success",
		`Listing "${newListing.title}" was updated successfully.`,
	);
	res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
	let { id } = req.params;
	let deletedListing = await Listing.findByIdAndDelete(id);
	req.flash(
		"success",
		`Listing "${deletedListing.title}" was deleted successfully.`,
	);
	res.redirect("/listings");
};

module.exports.filterListing = async (req, res) => {
	let { category } = req.query;
	const listings = await Listing.where("category").equals(category).limit(10);
	// console.log(`Clicked ${req.query.category}`);
	res.render("listings/index.ejs", { listings });
};
